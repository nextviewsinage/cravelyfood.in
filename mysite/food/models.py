from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import random


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Restaurant(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100, default='Ahmedabad')
    phone = models.CharField(max_length=15, blank=True)
    image = models.ImageField(upload_to='restaurants/', blank=True, null=True)
    cuisine = models.CharField(max_length=200, blank=True)
    opening_time = models.TimeField(default='09:00')
    closing_time = models.TimeField(default='23:00')
    is_active = models.BooleanField(default=True)
    delivery_time = models.CharField(max_length=30, default='30-40 min')
    min_order = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def avg_rating(self):
        reviews = self.reviews.all()
        if not reviews:
            return 4.0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def __str__(self):
        return self.name


class FoodItem(models.Model):
    restaurant = models.ForeignKey(
        Restaurant, on_delete=models.SET_NULL,
        related_name='menu', null=True, blank=True
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        related_name='items', null=True, blank=True
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='food_images/', blank=True, null=True)
    available = models.BooleanField(default=True)
    is_veg = models.BooleanField(default=True)
    is_bestseller = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.category.name if self.category else 'No Category'})"


class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Preparing', 'Preparing'),
        ('On the way', 'On the way'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]
    PAYMENT_CHOICES = [
        ('COD', 'Cash on Delivery'),
        ('UPI', 'UPI'),
        ('Card', 'Card'),
        ('Wallet', 'Wallet'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer_name = models.CharField(max_length=100)
    customer_address = models.TextField()
    customer_phone = models.CharField(max_length=15)
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    gst_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    coupon = models.ForeignKey('Coupon', on_delete=models.SET_NULL, null=True, blank=True)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='COD')
    payment_status = models.CharField(max_length=20, default='Pending')
    upi_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        base = float(self.food_item.price) * self.quantity
        self.gst_amount = round(base * 0.18, 2)
        self.total_price = round(base + self.gst_amount - float(self.discount_amount), 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name} ({self.status})"


class Coupon(models.Model):
    DISCOUNT_TYPE = [
        ('percent', 'Percentage'),
        ('flat', 'Flat Amount'),
    ]
    code = models.CharField(max_length=20, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE, default='percent')
    discount_value = models.DecimalField(max_digits=6, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_to = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    usage_limit = models.PositiveIntegerField(default=100)
    used_count = models.PositiveIntegerField(default=0)

    def is_valid(self):
        now = timezone.now()
        return self.is_active and self.valid_from <= now <= self.valid_to and self.used_count < self.usage_limit

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == 'percent' else '₹'})"


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE, null=True, blank=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('user', 'food_item'), ('user', 'restaurant')]

    def __str__(self):
        return f"{self.user.username} - {self.food_item or self.restaurant}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_reviews', blank=True)
    dislikes = models.ManyToManyField(User, related_name='disliked_reviews', blank=True)

    class Meta:
        unique_together = [('user', 'food_item'), ('user', 'restaurant')]

    def __str__(self):
        return f"{self.user.username} - {self.rating}★"


class ReviewImage(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='review_images/')

    def __str__(self):
        return f"Image for Review #{self.review.id}"


class DeliveryBoy(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='delivery_profile')
    phone = models.CharField(max_length=15)
    vehicle_number = models.CharField(max_length=20, blank=True)
    is_available = models.BooleanField(default=True)
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Delivery: {self.user.username}"


# ── LOYALTY POINTS ────────────────────────────────────
class LoyaltyAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='loyalty')
    points = models.PositiveIntegerField(default=0)
    total_earned = models.PositiveIntegerField(default=0)
    level = models.CharField(max_length=20, default='Bronze')
    updated_at = models.DateTimeField(auto_now=True)

    LEVELS = [(0, 'Bronze'), (500, 'Silver'), (1500, 'Gold'), (3000, 'Platinum')]

    def recalculate_level(self):
        for threshold, name in reversed(self.LEVELS):
            if self.total_earned >= threshold:
                self.level = name
                break

    def add_points(self, pts):
        self.points += pts
        self.total_earned += pts
        self.recalculate_level()
        self.save()

    def redeem_points(self, pts):
        if self.points >= pts:
            self.points -= pts
            self.save()
            return True
        return False

    def __str__(self):
        return f"{self.user.username} — {self.points}pts ({self.level})"


# ── SUBSCRIPTION ──────────────────────────────────────
class Subscription(models.Model):
    PLANS = [('basic', '₹99/month'), ('pro', '₹199/month')]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.CharField(max_length=10, choices=PLANS, default='basic')
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def is_valid(self):
        return self.is_active and self.expires_at > timezone.now()

    def __str__(self):
        return f"{self.user.username} — {self.plan}"


# ── FLASH DEAL ────────────────────────────────────────
class FlashDeal(models.Model):
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE, related_name='flash_deals')
    discount_percent = models.PositiveIntegerField()
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def is_live(self):
        now = timezone.now()
        return self.is_active and self.starts_at <= now <= self.ends_at

    def __str__(self):
        return f"{self.food_item.name} — {self.discount_percent}% OFF"


# ── REFERRAL ──────────────────────────────────────────
class Referral(models.Model):
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_sent')
    referred = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referred_by')
    bonus_given = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.referrer.username} → {self.referred.username}"


# ── GROUP ORDER ───────────────────────────────────────
class GroupOrder(models.Model):
    STATUS = [('open', 'Open'), ('placed', 'Placed'), ('cancelled', 'Cancelled')]
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_orders_created')
    name = models.CharField(max_length=100, default='Group Order')
    invite_code = models.CharField(max_length=8, unique=True)
    status = models.CharField(max_length=10, choices=STATUS, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.invite_code:
            self.invite_code = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=8))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Group #{self.id} by {self.creator.username}"


class GroupOrderItem(models.Model):
    group_order = models.ForeignKey(GroupOrder, on_delete=models.CASCADE, related_name='items')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def subtotal(self):
        return float(self.food_item.price) * self.quantity

    def __str__(self):
        return f"{self.user.username}: {self.food_item.name} x{self.quantity}"


# ── MOOD ORDER ────────────────────────────────────────
MOOD_TAGS = {
    'happy':   ['pizza', 'burger', 'cake', 'ice cream', 'biryani'],
    'sad':     ['chocolate', 'ice cream', 'pasta', 'soup', 'khichdi'],
    'lazy':    ['sandwich', 'rolls', 'maggi', 'noodles', 'wrap'],
    'excited': ['biryani', 'pizza', 'wings', 'tacos', 'sushi'],
    'hungry':  ['thali', 'biryani', 'burger', 'pizza', 'rice'],
}


# ── PUSH CAMPAIGN ─────────────────────────────────────
class PushCampaign(models.Model):
    title = models.CharField(max_length=100)
    message = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_sent = models.BooleanField(default=False)

    def __str__(self):
        return self.title


# ── VIDEO FEED ────────────────────────────────────────
class FoodVideo(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='videos')
    food_item = models.ForeignKey(FoodItem, on_delete=models.SET_NULL, null=True, blank=True, related_name='videos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_url = models.URLField(blank=True)          # external URL (YouTube/Cloudinary)
    thumbnail = models.ImageField(upload_to='video_thumbs/', blank=True, null=True)
    views = models.PositiveIntegerField(default=0)
    likes = models.ManyToManyField(User, related_name='liked_videos', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# ── GROCERY ───────────────────────────────────────────
class GroceryCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.CharField(max_length=10, default='🛒')

    def __str__(self):
        return self.name


class GroceryItem(models.Model):
    category = models.ForeignKey(GroceryCategory, on_delete=models.SET_NULL, null=True, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    unit = models.CharField(max_length=30, default='1 pc')   # e.g. 500g, 1L, 1 dozen
    image = models.ImageField(upload_to='grocery/', blank=True, null=True)
    emoji = models.CharField(max_length=10, default='🛒')
    stock = models.PositiveIntegerField(default=100)
    available = models.BooleanField(default=True)
    is_organic = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.unit})"


# ── NOTIFICATIONS ────────────────────────────────────
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    icon = models.CharField(max_length=10, default='🔔')
    text = models.CharField(max_length=300)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.text[:50]}"


# ── HERO SLIDER ───────────────────────────────────────
class HeroSlide(models.Model):
    TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]
    title = models.CharField(max_length=200, blank=True)
    subtitle = models.CharField(max_length=300, blank=True)
    slide_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='image')
    image = models.ImageField(upload_to='slides/', blank=True, null=True)
    video = models.FileField(upload_to='slides/videos/', blank=True, null=True)
    video_url = models.URLField(blank=True, help_text='External video URL (YouTube embed or direct mp4)')
    link = models.CharField(max_length=300, blank=True, help_text='URL to navigate on click (e.g. /restaurants)')
    button_text = models.CharField(max_length=50, blank=True, default='Order Now')
    order = models.PositiveIntegerField(default=0, help_text='Lower number = shown first')
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text='Leave blank = never expires')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Hero Slide'
        verbose_name_plural = 'Hero Slides'

    def is_live(self):
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < timezone.now():
            return False
        return True

    def __str__(self):
        return f"[{self.slide_type.upper()}] {self.title or 'Slide #' + str(self.id)} (order={self.order})"


# ── CONTACT MESSAGE ───────────────────────────────────
class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.subject}"


# ── BADGES / GAMIFICATION ─────────────────────────────
class Badge(models.Model):
    BADGE_TYPES = [
        ('first_order', 'First Order'),
        ('five_orders', '5 Orders'),
        ('ten_orders', '10 Orders'),
        ('reviewer', 'First Review'),
        ('referral', 'Referral Master'),
        ('subscriber', 'Subscriber'),
        ('loyal', 'Loyal Customer'),
        ('foodie', 'Foodie'),
    ]
    name = models.CharField(max_length=100)
    badge_type = models.CharField(max_length=30, choices=BADGE_TYPES, unique=True)
    icon = models.CharField(max_length=10, default='🏅')
    description = models.CharField(max_length=200)
    points_reward = models.PositiveIntegerField(default=50)

    def __str__(self):
        return f"{self.icon} {self.name}"


class UserBadge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')

    def __str__(self):
        return f"{self.user.username} — {self.badge.name}"


# ── USER PROFILE (Role-based) ─────────────────────────
class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('delivery', 'Delivery Boy'),
        ('admin', 'Admin'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=15, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


# ── PHONE OTP ─────────────────────────────────────────
class PhoneOTP(models.Model):
    phone = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        from django.utils import timezone
        # OTP valid for 10 minutes
        return not self.is_used and (timezone.now() - self.created_at).seconds < 600

    def __str__(self):
        return f"{self.phone} — {self.otp}"
