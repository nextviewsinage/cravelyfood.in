from rest_framework import serializers
from .models import Category, FoodItem, Order
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Food


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2", "first_name", "last_name")

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError("Passwords must match.")
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class FoodItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = FoodItem
        fields = '__all__'

    def get_image(self, obj):
        """Return relative image path instead of absolute URL"""
        if obj.image:
            # Return just the relative path: /media/food_images/...
            return f"/media/{obj.image.name}"
        return None


class OrderSerializer(serializers.ModelSerializer):
    food_item_name = serializers.CharField(source='food_item.name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'customer_name',
            'customer_address',
            'customer_phone',
            'food_item',
            'food_item_name',
            'quantity',
            'total_price',
            'status',
            'created_at',
        ]

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = '__all__'
