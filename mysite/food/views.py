from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import viewsets, filters, generics, permissions
from rest_framework.generics import ListAPIView

from .models import Category, FoodItem, Order, Food
from .serializers import (
    CategorySerializer,
    FoodItemSerializer,
    OrderSerializer,
    RegisterSerializer,
    UserSerializer,
    FoodSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user



def home(request):
    categories = Category.objects.all()
    foods = FoodItem.objects.filter(available=True)
    return render(request, 'food/home.html', {'categories': categories, 'foods': foods})


def place_order(request):
    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        phone = request.POST.get("phone", "").strip()
        address = request.POST.get("address", "").strip()
        item_id = request.POST.get("item", "").strip()
        qty_str = request.POST.get("quantity", "1").strip()

        if not item_id or not name or not phone or not address:
            foods = FoodItem.objects.filter(available=True)
            return render(request, 'food/order.html', {
                'foods': foods,
                'error': 'All fields are required.'
            })

        try:
            qty = int(qty_str)
            if qty < 1:
                raise ValueError("Quantity must be at least 1")
        except ValueError:
            foods = FoodItem.objects.filter(available=True)
            return render(request, 'food/order.html', {
                'foods': foods,
                'error': 'Invalid quantity.'
            })

        try:
            food = FoodItem.objects.get(id=int(item_id))
        except (FoodItem.DoesNotExist, ValueError):
            foods = FoodItem.objects.filter(available=True)
            return render(request, 'food/order.html', {
                'foods': foods,
                'error': f'Food item with ID {item_id} not found.'
            })

        total = food.price * qty

        order = Order.objects.create(
            customer_name=name,
            customer_phone=phone,
            customer_address=address,
            food_item=food,
            quantity=qty,
            total_price=total
        )

        return render(request, 'food/success.html', {'order': order})

    foods = FoodItem.objects.filter(available=True)
    return render(request, 'food/order.html', {'foods': foods})


# ------------------------------------------------------
# 🔹 DRF API VIEWSETS
# ------------------------------------------------------

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class FoodItemViewSet(viewsets.ModelViewSet):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category__name']


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['customer_name', 'status', 'food_item__name']


# ------------------------------------------------------
# 📌 SIMPLE JSON FOOD LIST
# ------------------------------------------------------

def food_list(request):
    foods = list(FoodItem.objects.values())
    return JsonResponse(foods, safe=False)


# ------------------------------------------------------
# 🔥 CLEAN API VIEWS (NO DUPLICATE)
# ------------------------------------------------------

class FoodListAPIView(ListAPIView):
    queryset = Food.objects.all()
    serializer_class = FoodSerializer


class OrderListAPIView(ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
