from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CategoryViewSet, FoodItemViewSet, OrderViewSet,
    RestaurantViewSet, ReviewViewSet, WishlistViewSet,
    RegisterView, ProfileView, SearchView,
    CouponValidateView, CouponUseView, NotificationListView,
    AdminDashboardView, AnalyticsView,
    DeliveryRegisterView, DeliveryOrdersView, DeliveryUpdateView,
    AIFeedView, MoodFoodView, FlashDealViewSet, LoyaltyView,
    SubscriptionView, ReferralView, GroupOrderViewSet,
    DeliveryETAView, DynamicOfferView, PushCampaignView,
    EmailOrUsernameTokenView,
    SendOTPView, VerifyOTPView,
    # New
    FoodVideoViewSet, GroceryCategoryViewSet, GroceryItemViewSet,
    ImageSearchView, BadgeListView, UserBadgeView, LeaderboardView, VoiceSearchView,
    ContactMessageView, SmartComboView, WhatsAppMenuView,
    HeroSlideViewSet,
    SurgePricingView,
    BatchOptimizeView, AssignBatchView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'foods', FoodItemViewSet)
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'restaurants', RestaurantViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'flash-deals', FlashDealViewSet, basename='flash-deals')
router.register(r'group-orders', GroupOrderViewSet, basename='group-orders')
router.register(r'videos', FoodVideoViewSet, basename='videos')
router.register(r'grocery/categories', GroceryCategoryViewSet, basename='grocery-categories')
router.register(r'grocery/items', GroceryItemViewSet, basename='grocery-items')
router.register(r'slides', HeroSlideViewSet, basename='slides')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/profile/', ProfileView.as_view(), name='auth_profile'),
    path('auth/token/', EmailOrUsernameTokenView.as_view(), name='token_obtain_pair'),
    path('auth/otp/send/', SendOTPView.as_view(), name='otp_send'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='otp_verify'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('search/', SearchView.as_view(), name='search'),
    path('coupons/validate/', CouponValidateView.as_view(), name='coupon_validate'),
    path('coupons/use/', CouponUseView.as_view(), name='coupon_use'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('admin/analytics/', AnalyticsView.as_view(), name='admin_analytics'),
    path('delivery/register/', DeliveryRegisterView.as_view(), name='delivery_register'),
    path('delivery/orders/', DeliveryOrdersView.as_view(), name='delivery_orders'),
    path('delivery/update/<int:order_id>/', DeliveryUpdateView.as_view(), name='delivery_update'),
    path('ai/feed/', AIFeedView.as_view(), name='ai_feed'),
    path('ai/mood/', MoodFoodView.as_view(), name='mood_food'),
    path('ai/image-search/', ImageSearchView.as_view(), name='image_search'),
    path('ai/voice-search/', VoiceSearchView.as_view(), name='voice_search'),
    path('loyalty/', LoyaltyView.as_view(), name='loyalty'),
    path('subscription/', SubscriptionView.as_view(), name='subscription'),
    path('referral/', ReferralView.as_view(), name='referral'),
    path('delivery/eta/', DeliveryETAView.as_view(), name='delivery_eta'),
    path('delivery/batch/optimize/', BatchOptimizeView.as_view(), name='batch_optimize'),
    path('delivery/batch/assign/', AssignBatchView.as_view(), name='batch_assign'),
    path('offers/dynamic/', DynamicOfferView.as_view(), name='dynamic_offer'),
    path('pricing/surge/', SurgePricingView.as_view(), name='surge_pricing'),
    path('campaigns/', PushCampaignView.as_view(), name='push_campaigns'),
    path('badges/', BadgeListView.as_view(), name='badges'),
    path('badges/mine/', UserBadgeView.as_view(), name='user_badges'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('notifications/read/', NotificationListView.as_view(), name='notifications_read'),
    path('contact/', ContactMessageView.as_view(), name='contact'),
    path('ai/combo/', SmartComboView.as_view(), name='smart_combo'),
    path('whatsapp/menu/', WhatsAppMenuView.as_view(), name='whatsapp_menu'),
]
