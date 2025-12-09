from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, FoodItemViewSet, OrderViewSet, RegisterView, ProfileView
from .views import TokenObtainPairView, TokenRefreshView
from .views import FoodListAPIView, OrderListAPIView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'foods', FoodItemViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),

    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/profile/', ProfileView.as_view(), name='auth_profile'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('foods-list/', FoodListAPIView.as_view(), name='foods_api'),
    path('orders-list/', OrderListAPIView.as_view(), name='orders_api'),
]
