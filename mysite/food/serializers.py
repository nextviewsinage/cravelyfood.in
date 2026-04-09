from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Category, FoodItem, Order, Restaurant, Review, ReviewImage, Coupon, Wishlist


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=['customer', 'delivery'],
        default='customer',
        write_only=True,
        required=False,
    )

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2", "first_name", "last_name", "role")

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Passwords must match.")
        return data

    def create(self, validated_data):
        role = validated_data.pop("role", "customer")
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        # Create profile with role
        from .models import UserProfile
        UserProfile.objects.create(user=user, role=role)
        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "role")

    def get_role(self, obj):
        try:
            return obj.profile.role
        except Exception:
            return 'customer'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


# ── REVIEW ────────────────────────────────────────────
class ReviewImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewImage
        fields = ['id', 'image']


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    like_count = serializers.SerializerMethodField()
    dislike_count = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    user_disliked = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'username', 'rating', 'comment', 'created_at',
            'food_item', 'restaurant',
            'images', 'uploaded_images',
            'like_count', 'dislike_count', 'user_liked', 'user_disliked',
        ]
        read_only_fields = ['user', 'created_at']

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_dislike_count(self, obj):
        return obj.dislikes.count()

    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_user_disliked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.dislikes.filter(id=request.user.id).exists()
        return False

    def create(self, validated_data):
        images = validated_data.pop('uploaded_images', [])
        review = Review.objects.create(**validated_data)
        for img in images:
            ReviewImage.objects.create(review=review, image=img)
        return review


# ── RESTAURANT ────────────────────────────────────────
class RestaurantSerializer(serializers.ModelSerializer):
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = '__all__'

    def get_avg_rating(self, obj):
        return obj.avg_rating()

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_image(self, obj):
        if obj.image:
            return f"/media/{obj.image.name}"
        return None


# ── FOOD ITEM ─────────────────────────────────────────
class FoodItemSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    restaurant_name = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    # Dynamic pricing fields
    dynamic_price = serializers.SerializerMethodField()
    surge_active = serializers.SerializerMethodField()
    surge_label = serializers.SerializerMethodField()
    surge_emoji = serializers.SerializerMethodField()

    class Meta:
        model = FoodItem
        fields = [
            'id', 'name', 'description', 'price', 'available',
            'is_veg', 'is_bestseller',
            'category', 'category_name',
            'restaurant', 'restaurant_name',
            'image', 'avg_rating', 'review_count',
            'dynamic_price', 'surge_active', 'surge_label', 'surge_emoji',
        ]

    def _surge(self):
        """Cache surge info per serializer instance."""
        if not hasattr(self, '_surge_cache'):
            from .dynamic_pricing import get_surge_info
            request = self.context.get('request')
            self._surge_cache = get_surge_info(request)
        return self._surge_cache

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_restaurant_name(self, obj):
        return obj.restaurant.name if obj.restaurant else None

    def get_image(self, obj):
        if obj.image:
            return f"/media/{obj.image.name}"
        return None

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_dynamic_price(self, obj):
        surge = self._surge()
        if surge:
            return round(float(obj.price) * surge['multiplier'], 2)
        return float(obj.price)

    def get_surge_active(self, obj):
        return self._surge() is not None

    def get_surge_label(self, obj):
        surge = self._surge()
        return surge['label'] if surge else None

    def get_surge_emoji(self, obj):
        surge = self._surge()
        return surge['emoji'] if surge else None


# ── COUPON ────────────────────────────────────────────
class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value', 'min_order_amount', 'max_discount', 'valid_to', 'is_active']


# ── ORDER ─────────────────────────────────────────────
class OrderSerializer(serializers.ModelSerializer):
    food_item_name = serializers.CharField(source='food_item.name', read_only=True)
    food_item_image = serializers.SerializerMethodField()
    coupon_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'customer_name', 'customer_address', 'customer_phone',
            'food_item', 'food_item_name', 'food_item_image',
            'quantity', 'total_price', 'gst_amount', 'discount_amount', 'coupon',
            'payment_method', 'payment_status', 'upi_id',
            'status', 'created_at', 'scheduled_at',
            'coupon_code',
        ]
        read_only_fields = ['user', 'total_price', 'gst_amount']

    def get_food_item_image(self, obj):
        if obj.food_item.image:
            return f"/media/{obj.food_item.image.name}"
        return None

    def create(self, validated_data):
        coupon_code = validated_data.pop('coupon_code', '').strip().upper()
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if coupon.is_valid():
                    validated_data['coupon'] = coupon
            except Coupon.DoesNotExist:
                pass
        return super().create(validated_data)


# ── WISHLIST ──────────────────────────────────────────
class WishlistSerializer(serializers.ModelSerializer):
    food_item_detail = FoodItemSerializer(source='food_item', read_only=True)
    restaurant_detail = RestaurantSerializer(source='restaurant', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'food_item', 'restaurant', 'food_item_detail', 'restaurant_detail', 'created_at']
        read_only_fields = ['user', 'created_at']


# ── LOYALTY ───────────────────────────────────────────
from .models import LoyaltyAccount, Subscription, FlashDeal, GroupOrder, GroupOrderItem, PushCampaign


class LoyaltySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    discount_value = serializers.SerializerMethodField()

    class Meta:
        model = LoyaltyAccount
        fields = ['points', 'total_earned', 'level', 'username', 'discount_value']

    def get_discount_value(self, obj):
        return obj.points // 10  # 100 pts = ₹10


class SubscriptionSerializer(serializers.ModelSerializer):
    active = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = ['plan', 'started_at', 'expires_at', 'is_active', 'active']

    def get_active(self, obj):
        return obj.is_valid()


class FlashDealSerializer(serializers.ModelSerializer):
    food_item_detail = FoodItemSerializer(source='food_item', read_only=True)
    seconds_left = serializers.SerializerMethodField()
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = FlashDeal
        fields = ['id', 'food_item', 'food_item_detail', 'discount_percent',
                  'starts_at', 'ends_at', 'seconds_left', 'discounted_price']

    def get_seconds_left(self, obj):
        diff = obj.ends_at - timezone.now()
        return max(0, int(diff.total_seconds()))

    def get_discounted_price(self, obj):
        price = float(obj.food_item.price)
        return round(price * (1 - obj.discount_percent / 100), 2)


class GroupOrderItemSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source='food_item.name', read_only=True)
    food_price = serializers.DecimalField(source='food_item.price', max_digits=8, decimal_places=2, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = GroupOrderItem
        fields = ['id', 'username', 'food_item', 'food_name', 'food_price', 'quantity', 'subtotal']

    def get_subtotal(self, obj):
        return obj.subtotal()


class GroupOrderSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.username', read_only=True)
    items = GroupOrderItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = GroupOrder
        fields = ['id', 'name', 'invite_code', 'status', 'creator_name',
                  'created_at', 'expires_at', 'items', 'total']
        read_only_fields = ['invite_code', 'creator']

    def get_total(self, obj):
        return round(sum(i.subtotal() for i in obj.items.all()), 2)


class PushCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushCampaign
        fields = ['id', 'title', 'message', 'created_at', 'is_sent']
        read_only_fields = ['created_by', 'created_at']


# ── VIDEO FEED ────────────────────────────────────────
from .models import FoodVideo, GroceryCategory, GroceryItem, Badge, UserBadge


class FoodVideoSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    food_name = serializers.CharField(source='food_item.name', read_only=True)
    like_count = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = FoodVideo
        fields = ['id', 'title', 'description', 'video_url', 'thumbnail_url',
                  'restaurant', 'restaurant_name', 'food_item', 'food_name',
                  'views', 'like_count', 'user_liked', 'created_at', 'is_veg']

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_user_liked(self, obj):
        req = self.context.get('request')
        if req and req.user.is_authenticated:
            return obj.likes.filter(id=req.user.id).exists()
        return False

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            return f"/media/{obj.thumbnail.name}"
        return None


# ── GROCERY ───────────────────────────────────────────
class GroceryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GroceryCategory
        fields = '__all__'


class GroceryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = GroceryItem
        fields = ['id', 'name', 'description', 'price', 'unit', 'image_url', 'emoji',
                  'stock', 'available', 'is_organic', 'category', 'category_name', 'category_icon']

    def get_image_url(self, obj):
        if obj.image:
            return f"/media/{obj.image.name}"
        return None


# ── BADGES ────────────────────────────────────────────
class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)

    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'earned_at']


# ── NOTIFICATIONS ─────────────────────────────────────
from .models import Notification, ContactMessage


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'icon', 'text', 'read', 'created_at']
        read_only_fields = ['user', 'created_at']


# ── CONTACT MESSAGE ───────────────────────────────────
class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['created_at']


# ── HERO SLIDER ───────────────────────────────────────
from .models import HeroSlide


class HeroSlideSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    video_file_url = serializers.SerializerMethodField()

    class Meta:
        model = HeroSlide
        fields = [
            'id', 'title', 'subtitle', 'slide_type',
            'image_url', 'video_file_url', 'video_url',
            'link', 'button_text', 'order', 'is_active', 'expires_at',
        ]

    def get_image_url(self, obj):
        if obj.image:
            return f"/media/{obj.image.name}"
        return None

    def get_video_file_url(self, obj):
        if obj.video:
            return f"/media/{obj.video.name}"
        return None
