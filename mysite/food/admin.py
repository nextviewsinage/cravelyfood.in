from django.contrib import admin
from .models import (
    Category, FoodItem, Order, Restaurant, Review,
    DeliveryBoy, LoyaltyAccount, Subscription, FlashDeal,
    Referral, GroupOrder, GroupOrderItem, PushCampaign, Coupon,
    Wishlist, ReviewImage,
)


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'cuisine', 'delivery_time', 'is_active', 'avg_rating']
    list_filter = ['city', 'is_active']
    search_fields = ['name', 'city', 'cuisine']
    list_editable = ['is_active']


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'category', 'price', 'available', 'is_veg', 'is_bestseller']
    list_filter = ['category', 'restaurant', 'available', 'is_veg']
    search_fields = ['name', 'restaurant__name']
    list_editable = ['available', 'price', 'is_bestseller']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'food_item', 'quantity', 'total_price', 'payment_method', 'status', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['customer_name', 'customer_phone']
    list_editable = ['status']
    readonly_fields = ['total_price', 'gst_amount', 'created_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'rating', 'food_item', 'restaurant', 'created_at']
    list_filter = ['rating']


@admin.register(DeliveryBoy)
class DeliveryBoyAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'vehicle_number', 'is_available']
    list_editable = ['is_available']


@admin.register(LoyaltyAccount)
class LoyaltyAdmin(admin.ModelAdmin):
    list_display = ['user', 'points', 'total_earned', 'level']
    search_fields = ['user__username']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'started_at', 'expires_at', 'is_active']
    list_editable = ['is_active']


@admin.register(FlashDeal)
class FlashDealAdmin(admin.ModelAdmin):
    list_display = ['food_item', 'discount_percent', 'starts_at', 'ends_at', 'is_active']
    list_editable = ['is_active', 'discount_percent']


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ['referrer', 'referred', 'bonus_given', 'created_at']


@admin.register(GroupOrder)
class GroupOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'creator', 'invite_code', 'status', 'created_at']


@admin.register(PushCampaign)
class PushCampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'created_at', 'is_sent']
    list_editable = ['is_sent']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'valid_from', 'valid_to', 'is_active', 'used_count']
    list_editable = ['is_active']


# New models
from .models import FoodVideo, GroceryCategory, GroceryItem, Badge, UserBadge, HeroSlide


@admin.register(FoodVideo)
class FoodVideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'restaurant', 'food_item', 'views', 'is_active', 'created_at']
    list_editable = ['is_active']


@admin.register(GroceryCategory)
class GroceryCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']


@admin.register(GroceryItem)
class GroceryItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'unit', 'stock', 'available', 'is_organic']
    list_editable = ['available', 'price', 'stock']
    list_filter = ['category', 'is_organic']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['icon', 'name', 'badge_type', 'points_reward']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'earned_at']


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'slide_type', 'order', 'is_active', 'expires_at', 'created_at']
    list_editable = ['order', 'is_active']
    list_filter = ['slide_type', 'is_active']
    search_fields = ['title', 'subtitle']
    fieldsets = (
        ('Content', {
            'fields': ('title', 'subtitle', 'slide_type', 'image', 'video', 'video_url')
        }),
        ('Action', {
            'fields': ('link', 'button_text')
        }),
        ('Settings', {
            'fields': ('order', 'is_active', 'expires_at')
        }),
    )
