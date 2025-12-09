from django.urls import path
from .views import home, place_order, FoodListAPIView

urlpatterns = [
    path('', home, name='home'),
    path('order/', place_order, name='order'),
    # path('foods/', FoodListAPIView.as_view(), name='foods_list'),
]
