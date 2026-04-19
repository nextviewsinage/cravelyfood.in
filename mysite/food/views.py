from django.db.models import Q, Sum, Count
from django.db.models.functions import TruncDate
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import viewsets, filters, generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    Category, FoodItem, Order, Restaurant, Review, Coupon, Wishlist, DeliveryBoy,
    LoyaltyAccount, Subscription, FlashDeal, Referral, GroupOrder, GroupOrderItem,
    MOOD_TAGS, PushCampaign,
)
from .serializers import (
    CategorySerializer, FoodItemSerializer, OrderSerializer,
    RestaurantSerializer, ReviewSerializer, CouponSerializer,
    WishlistSerializer, RegisterSerializer, UserSerializer,
    LoyaltySerializer, SubscriptionSerializer, FlashDealSerializer,
    GroupOrderSerializer, GroupOrderItemSerializer, PushCampaignSerializer,
)


# ── AUTH ──────────────────────────────────────────────
# ── AUTH ──────────────────────────────────────────────
class EmailOrUsernameTokenSerializer(TokenObtainPairSerializer):
    """Allow login with email OR username, add role to token"""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add role to JWT payload
        try:
            token['role'] = user.profile.role
        except Exception:
            token['role'] = 'admin' if (user.is_staff or user.is_superuser) else 'customer'
        token['username'] = user.username
        token['email'] = user.email
        return token

    def validate(self, attrs):
        login_input = attrs.get('username', '')
        if '@' in login_input:
            try:
                user = User.objects.get(email__iexact=login_input)
                attrs['username'] = user.username
            except User.DoesNotExist:
                pass
        return super().validate(attrs)


class EmailOrUsernameTokenView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)    


# ── PHONE OTP LOGIN ───────────────────────────────────
class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        if not phone or len(phone) < 10:
            return Response({'error': 'Valid phone number required'}, status=400)

        import random, os
        from .models import PhoneOTP

        PhoneOTP.objects.filter(phone=phone).delete()
        otp = str(random.randint(100000, 999999))
        PhoneOTP.objects.create(phone=phone, otp=otp)

        # Twilio Verify SMS
        account_sid = os.environ.get('TWILIO_ACCOUNT_SID', '')
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN', '')
        verify_sid = os.environ.get('TWILIO_VERIFY_SID', '')

        sms_sent = False
        if account_sid and auth_token and verify_sid:
            try:
                from twilio.rest import Client
                client = Client(account_sid, auth_token)
                client.verify.v2.services(verify_sid).verifications.create(
                    to=f'+91{phone}',
                    channel='sms'
                )
                sms_sent = True
            except Exception as e:
                print(f'Twilio error: {e}')

        if sms_sent:
            return Response({'message': f'OTP sent to +91{phone}'})
        else:
            # Twilio not configured — show OTP on screen + log it
            print(f'[DEV OTP] Phone: +91{phone} | OTP: {otp}')
            return Response({'message': f'OTP sent to +91{phone}', 'dev_otp': otp})


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        otp = request.data.get('otp', '').strip()

        import os
        from rest_framework_simplejwt.tokens import RefreshToken

        account_sid = os.environ.get('TWILIO_ACCOUNT_SID', '')
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN', '')
        verify_sid = os.environ.get('TWILIO_VERIFY_SID', '')

        verified = False
        if account_sid and auth_token and verify_sid:
            try:
                from twilio.rest import Client
                client = Client(account_sid, auth_token)
                result = client.verify.v2.services(verify_sid).verification_checks.create(
                    to=f'+91{phone}',
                    code=otp
                )
                verified = result.status == 'approved'
            except Exception as e:
                print(f'Twilio verify error: {e}')

        # Fallback: check local DB OTP
        if not verified:
            from .models import PhoneOTP
            record = PhoneOTP.objects.filter(phone=phone, otp=otp).last()
            if record and record.is_valid():
                record.is_used = True
                record.save()
                verified = True

        if not verified:
            return Response({'error': 'Invalid or expired OTP'}, status=400)

        # Find or create user by phone
        user = User.objects.filter(username=f'phone_{phone}').first()
        if not user:
            user = User.objects.create_user(
                username=f'phone_{phone}',
                password=User.objects.make_random_password(),
            )
            from .models import UserProfile
            UserProfile.objects.get_or_create(user=user, defaults={'phone': phone, 'role': 'customer'})
        else:
            try:
                user.profile.phone = phone
                user.profile.save()
            except Exception:
                pass

        refresh = RefreshToken.for_user(user)
        try:
            refresh['role'] = user.profile.role
        except Exception:
            refresh['role'] = 'customer'
        refresh['username'] = user.username

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'username': user.username,
        })


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


# ── CATEGORY ──────────────────────────────────────────
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


# ── RESTAURANT ────────────────────────────────────────
class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.filter(is_active=True)
    serializer_class = RestaurantSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'city', 'cuisine']

    def get_queryset(self):
        qs = Restaurant.objects.filter(is_active=True)
        city = self.request.query_params.get('city')
        search = self.request.query_params.get('search')
        if city:
            # Try full city name first
            city_qs = qs.filter(city__icontains=city)
            if not city_qs.exists():
                # Try first word only (e.g. "Gandhinagar Taluk" → "Gandhinagar")
                first_word = city.strip().split()[0]
                city_qs = qs.filter(city__icontains=first_word)
            # Always respect the city filter — don't fall back to all restaurants
            qs = city_qs
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(cuisine__icontains=search) |
                Q(city__icontains=search)
            )
        return qs

    @action(detail=True, methods=['get'])
    def menu(self, request, pk=None):
        restaurant = self.get_object()
        foods = FoodItem.objects.filter(restaurant=restaurant, available=True)
        return Response(FoodItemSerializer(foods, many=True).data)


# ── FOOD ITEM ─────────────────────────────────────────
class FoodItemViewSet(viewsets.ModelViewSet):
    queryset = FoodItem.objects.filter(available=True).select_related('category', 'restaurant')
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category__name', 'restaurant__name']

    def get_queryset(self):
        qs = FoodItem.objects.filter(available=True).select_related('category', 'restaurant')
        category = self.request.query_params.get('category')
        restaurant = self.request.query_params.get('restaurant')
        search = self.request.query_params.get('search')
        if category:
            qs = qs.filter(category__name__icontains=category)
        if restaurant:
            qs = qs.filter(restaurant_id=restaurant)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        return qs


# ── ORDER ─────────────────────────────────────────────
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Order.objects.filter(user=user).order_by('-created_at')
        phone = self.request.query_params.get('phone')
        if phone:
            return Order.objects.filter(customer_phone=phone).order_by('-created_at')
        return Order.objects.none()

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user)


# ── REVIEW ────────────────────────────────────────────
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related('user').prefetch_related('images')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Review.objects.all().select_related('user').prefetch_related('images')
        food_item = self.request.query_params.get('food_item')
        restaurant = self.request.query_params.get('restaurant')
        if food_item:
            qs = qs.filter(food_item_id=food_item)
        if restaurant:
            qs = qs.filter(restaurant_id=restaurant)
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        review = self.get_object()
        user = request.user
        if user in review.likes.all():
            review.likes.remove(user)
            liked = False
        else:
            review.likes.add(user)
            review.dislikes.remove(user)
            liked = True
        return Response({'liked': liked, 'like_count': review.likes.count(), 'dislike_count': review.dislikes.count()})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def dislike(self, request, pk=None):
        review = self.get_object()
        user = request.user
        if user in review.dislikes.all():
            review.dislikes.remove(user)
            disliked = False
        else:
            review.dislikes.add(user)
            review.likes.remove(user)
            disliked = True
        return Response({'disliked': disliked, 'like_count': review.likes.count(), 'dislike_count': review.dislikes.count()})


# ── COUPON ────────────────────────────────────────────
class CouponValidateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        order_total = float(request.data.get('order_total', 0))

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({'valid': False, 'message': 'Invalid coupon code'}, status=400)

        if not coupon.is_valid():
            return Response({'valid': False, 'message': 'Coupon expired or usage limit reached'}, status=400)

        if order_total < float(coupon.min_order_amount):
            return Response({
                'valid': False,
                'message': f'Minimum order ₹{coupon.min_order_amount} required'
            }, status=400)

        # Per-user limit: check if logged-in user already used this coupon
        if request.user.is_authenticated:
            already_used = Order.objects.filter(user=request.user, coupon=coupon).exists()
            if already_used:
                return Response({'valid': False, 'message': 'You have already used this coupon'}, status=400)

        if coupon.discount_type == 'percent':
            discount = order_total * float(coupon.discount_value) / 100
            if coupon.max_discount:
                discount = min(discount, float(coupon.max_discount))
        else:
            discount = float(coupon.discount_value)

        return Response({
            'valid': True,
            'discount': round(discount, 2),
            'discount_type': coupon.discount_type,
            'discount_value': float(coupon.discount_value),
            'message': f'Coupon applied! You save ₹{round(discount, 2)}',
        })


class CouponUseView(APIView):
    """Called after order is placed — increments used_count"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        try:
            coupon = Coupon.objects.get(code=code)
            coupon.used_count += 1
            coupon.save(update_fields=['used_count'])
            return Response({'status': 'ok'})
        except Coupon.DoesNotExist:
            return Response({'status': 'not found'}, status=404)


# ── WISHLIST ──────────────────────────────────────────
class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('food_item', 'restaurant')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        food_id = request.data.get('food_item')
        rest_id = request.data.get('restaurant')
        user = request.user

        if food_id:
            obj = Wishlist.objects.filter(user=user, food_item_id=food_id).first()
        elif rest_id:
            obj = Wishlist.objects.filter(user=user, restaurant_id=rest_id).first()
        else:
            return Response({'error': 'Provide food_item or restaurant'}, status=400)

        if obj:
            obj.delete()
            return Response({'wishlisted': False})
        else:
            data = {'food_item': food_id, 'restaurant': rest_id}
            serializer = WishlistSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save(user=user)
            return Response({'wishlisted': True})


# ── NOTIFICATIONS ─────────────────────────────────────
class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .models import Notification
        from .serializers import NotificationSerializer
        notifs = Notification.objects.filter(user=request.user)
        return Response(NotificationSerializer(notifs, many=True).data)

    def post(self, request):
        """Mark all as read: POST /notifications/read/"""
        from .models import Notification
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'status': 'ok'})


# ── ADMIN DASHBOARD ───────────────────────────────────
class IsAdminOrStaff(permissions.BasePermission):
    """Allow access to superusers, staff, or users with role='admin'."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        try:
            return request.user.profile.role == 'admin'
        except Exception:
            return False


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # any logged-in user for now

    def get(self, request):
        total_orders = Order.objects.count()
        total_revenue = Order.objects.aggregate(r=Sum('total_price'))['r'] or 0
        pending_orders = Order.objects.filter(status='Pending').count()
        delivered_orders = Order.objects.filter(status='Delivered').count()
        total_users = User.objects.count()
        total_foods = FoodItem.objects.count()

        # Popular foods (top 5 by order count)
        popular = (
            Order.objects.values('food_item__id', 'food_item__name')
            .annotate(order_count=Count('id'), revenue=Sum('total_price'))
            .order_by('-order_count')[:5]
        )

        # Recent 5 orders
        recent_orders = OrderSerializer(
            Order.objects.order_by('-created_at')[:5], many=True
        ).data

        # Delivery boys
        delivery_boys = DeliveryBoy.objects.select_related('user').annotate(
            total_delivered=Count('assigned_orders', filter=Q(assigned_orders__status='Delivered')),
            active_orders=Count('assigned_orders', filter=Q(assigned_orders__status__in=['On the way', 'Preparing', 'Confirmed'])),
        )
        delivery_boys_data = [
            {
                'id': db.id,
                'username': db.user.username,
                'phone': db.phone,
                'vehicle': db.vehicle_number,
                'is_available': db.is_available,
                'total_delivered': db.total_delivered,
                'active_orders': db.active_orders,
            }
            for db in delivery_boys
        ]

        return Response({
            'total_orders': total_orders,
            'total_revenue': round(float(total_revenue), 2),
            'pending_orders': pending_orders,
            'delivered_orders': delivered_orders,
            'total_users': total_users,
            'total_foods': total_foods,
            'popular_foods': list(popular),
            'recent_orders': recent_orders,
            'delivery_boys': delivery_boys_data,
        })


# ── ANALYTICS ─────────────────────────────────────────
class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # any logged-in user for now

    def get(self, request):
        # Daily sales — last 30 days
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        daily_sales = (
            Order.objects.filter(created_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(orders=Count('id'), revenue=Sum('total_price'))
            .order_by('date')
        )

        # Top 10 items by revenue
        top_items = (
            Order.objects.values('food_item__name')
            .annotate(total_orders=Count('id'), total_revenue=Sum('total_price'))
            .order_by('-total_revenue')[:10]
        )

        # Orders by status
        status_breakdown = (
            Order.objects.values('status')
            .annotate(count=Count('id'))
        )

        return Response({
            'daily_sales': [
                {
                    'date': str(d['date']),
                    'orders': d['orders'],
                    'revenue': round(float(d['revenue'] or 0), 2),
                }
                for d in daily_sales
            ],
            'top_items': [
                {
                    'name': t['food_item__name'],
                    'orders': t['total_orders'],
                    'revenue': round(float(t['total_revenue'] or 0), 2),
                }
                for t in top_items
            ],
            'status_breakdown': list(status_breakdown),
        })


# ── SEARCH ────────────────────────────────────────────
class SearchView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        city = request.query_params.get('city', '').strip()

        if not q and not city:
            return Response({'restaurants': [], 'foods': []})

        restaurants = Restaurant.objects.filter(is_active=True)
        foods = FoodItem.objects.filter(available=True)

        if q:
            restaurants = restaurants.filter(
                Q(name__icontains=q) | Q(cuisine__icontains=q) | Q(city__icontains=q)
            )
            foods = foods.filter(
                Q(name__icontains=q) | Q(description__icontains=q) | Q(category__name__icontains=q)
            )
        if city:
            restaurants = restaurants.filter(city__icontains=city)

        return Response({
            'restaurants': RestaurantSerializer(restaurants[:10], many=True).data,
            'foods': FoodItemSerializer(foods[:20], many=True).data,
        })


# ── DELIVERY BOY ──────────────────────────────────────
class DeliveryRegisterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        phone = request.data.get('phone', '')
        vehicle = request.data.get('vehicle_number', '')
        obj, created = DeliveryBoy.objects.get_or_create(
            user=request.user,
            defaults={'phone': phone, 'vehicle_number': vehicle}
        )
        if not created:
            obj.phone = phone
            obj.vehicle_number = vehicle
            obj.save()
        return Response({'id': obj.id, 'message': 'Registered as delivery partner'})


class DeliveryOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get orders — only if user is a registered delivery boy"""
        if not DeliveryBoy.objects.filter(user=request.user).exists():
            return Response({'registered': False}, status=403)

        # Show all orders that need delivery (any status except Cancelled)
        orders = Order.objects.exclude(
            status='Cancelled'
        ).order_by('-created_at')[:30]
        return Response(OrderSerializer(orders, many=True).data)


class DeliveryUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=404)

        new_status = request.data.get('status')
        lat = request.data.get('lat')
        lng = request.data.get('lng')

        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()

        # Update delivery boy location
        try:
            db = DeliveryBoy.objects.get(user=request.user)
            if lat: db.current_lat = lat
            if lng: db.current_lng = lng
            db.save()
        except DeliveryBoy.DoesNotExist:
            pass

        return Response({'status': order.status, 'message': 'Updated'})


# ── CALORIE & HEALTH AI ───────────────────────────────
class NutritionView(APIView):
    """
    GET  /ai/nutrition/?food=Paneer Tikka
    POST /ai/nutrition/  { "food_ids": [1,2,3] }  — bulk for cart
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .nutrition_db import get_nutrition, get_diet_tags
        food_name = request.query_params.get('food', '').strip()
        if not food_name:
            return Response({'error': 'food param required'}, status=400)

        nutrition = get_nutrition(food_name)
        if not nutrition:
            return Response({'error': f'Nutrition data not found for "{food_name}"'}, status=404)

        tags = get_diet_tags(nutrition)
        recommendation = self._recommend(nutrition)

        return Response({
            'nutrition': nutrition,
            'tags': tags,
            'recommendation': recommendation,
        })

    def post(self, request):
        """Bulk nutrition for multiple food items (cart use)."""
        from .nutrition_db import get_nutrition, get_diet_tags
        food_ids = request.data.get('food_ids', [])
        results = []
        total = {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0, 'fiber': 0}

        foods = FoodItem.objects.filter(id__in=food_ids)
        for food in foods:
            n = get_nutrition(food.name)
            if n:
                results.append({
                    'id': food.id,
                    'name': food.name,
                    'nutrition': n,
                    'tags': get_diet_tags(n),
                })
                for k in total:
                    total[k] += n.get(k, 0)

        return Response({
            'items': results,
            'total': total,
            'recommendation': self._recommend(total),
        })

    def _recommend(self, n):
        cal = n.get('calories', 0)
        prot = n.get('protein', 0)
        fat = n.get('fat', 0)

        if cal < 150 and prot >= 5:
            return {'text': 'Perfect for weight loss & gym diet! 💪', 'icon': '🏋️', 'color': '#1b5e20'}
        if prot >= 15:
            return {'text': 'Excellent protein source — great for muscle building! 💪', 'icon': '💪', 'color': '#1565c0'}
        if cal < 200:
            return {'text': 'Light & healthy choice — ideal for diet! 🥗', 'icon': '🥗', 'color': '#2e7d32'}
        if cal > 500:
            return {'text': 'High calorie — best as a cheat meal or post-workout! 🔥', 'icon': '🔥', 'color': '#e65100'}
        if fat > 20:
            return {'text': 'Rich & indulgent — enjoy in moderation 😋', 'icon': '😋', 'color': '#f57c00'}
        return {'text': 'Balanced meal — good for everyday diet! ✅', 'icon': '✅', 'color': '#388e3c'}


# ── AI CHATBOT ────────────────────────────────────────
class AIChatbotView(APIView):
    """
    POST /ai/chatbot/
    Body: { "message": "mujhe spicy veg chahiye under 200" }
    Returns: { "reply": "...", "foods": [...], "quick_replies": [...] }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        msg = (request.data.get('message') or '').strip().lower()
        if not msg:
            return Response({'reply': 'Kuch toh poocho! 😄', 'foods': [], 'quick_replies': []})

        # ── Parse intent ──────────────────────────────
        # Price filter
        import re
        price_limit = None
        price_match = re.search(r'under\s*₹?\s*(\d+)|below\s*₹?\s*(\d+)|(\d+)\s*se\s*kam|(\d+)\s*ke\s*andar|less\s*than\s*₹?\s*(\d+)', msg)
        if price_match:
            price_limit = int(next(g for g in price_match.groups() if g))

        # Veg intent
        wants_veg = any(w in msg for w in ['veg', 'vegetarian', 'no meat', 'pure veg', 'sabzi'])
        wants_nonveg = any(w in msg for w in ['non veg', 'nonveg', 'chicken', 'mutton', 'fish', 'egg', 'meat'])

        # Taste/type intent
        wants_spicy   = any(w in msg for w in ['spicy', 'teekha', 'hot', 'masaledar', 'tikha'])
        wants_sweet   = any(w in msg for w in ['sweet', 'meetha', 'dessert', 'mithai'])
        wants_light   = any(w in msg for w in ['light', 'healthy', 'diet', 'low cal', 'salad'])
        wants_popular = any(w in msg for w in ['popular', 'bestseller', 'best', 'trending', 'famous'])
        wants_cheap   = any(w in msg for w in ['cheap', 'budget', 'affordable', 'sasta', 'kam price'])

        # Category keywords
        CAT_MAP = {
            'pizza':      ['pizza'],
            'burger':     ['burger'],
            'biryani':    ['biryani', 'biriyani'],
            'dosa':       ['dosa', 'idli', 'south indian', 'uttapam', 'vada'],
            'momos':      ['momo', 'dumpling'],
            'noodles':    ['noodle', 'hakka', 'chowmein', 'chinese'],
            'paneer':     ['paneer', 'cottage cheese'],
            'snacks':     ['snack', 'samosa', 'fries', 'bhel', 'pav bhaji'],
            'dessert':    ['dessert', 'cake', 'ice cream', 'gulab', 'sweet', 'brownie'],
            'drinks':     ['drink', 'juice', 'lassi', 'chai', 'coffee', 'beverage'],
            'sandwich':   ['sandwich', 'sub'],
            'roll':       ['roll', 'wrap', 'kathi'],
            'thali':      ['thali', 'meal'],
        }
        detected_cats = []
        for cat, keywords in CAT_MAP.items():
            if any(k in msg for k in keywords):
                detected_cats.append(cat)

        # ── Build queryset ────────────────────────────
        qs = FoodItem.objects.filter(available=True).select_related('category', 'restaurant')

        # Always veg-only (app is veg)
        qs = qs.filter(is_veg=True)

        if price_limit:
            qs = qs.filter(price__lte=price_limit)

        if wants_popular:
            qs = qs.filter(is_bestseller=True)

        if wants_sweet:
            qs = qs.filter(
                Q(category__name__icontains='dessert') |
                Q(category__name__icontains='sweet') |
                Q(category__name__icontains='cake') |
                Q(name__icontains='gulab') | Q(name__icontains='halwa') |
                Q(name__icontains='brownie') | Q(name__icontains='ice cream')
            )
        elif detected_cats:
            q = Q()
            for cat in detected_cats:
                q |= Q(name__icontains=cat) | Q(category__name__icontains=cat)
            qs = qs.filter(q)
        elif wants_spicy:
            qs = qs.filter(
                Q(name__icontains='spicy') | Q(name__icontains='masala') |
                Q(name__icontains='tikka') | Q(name__icontains='schezwan') |
                Q(name__icontains='tandoori') | Q(description__icontains='spicy') |
                Q(description__icontains='spiced')
            )
        elif wants_light:
            qs = qs.filter(
                Q(category__name__icontains='salad') | Q(category__name__icontains='soup') |
                Q(name__icontains='salad') | Q(name__icontains='soup') |
                Q(name__icontains='idli') | Q(name__icontains='poha') | Q(name__icontains='upma')
            )
        elif wants_cheap:
            qs = qs.order_by('price')

        foods = qs.order_by('-is_bestseller', 'price')[:6]

        # Fallback if nothing found
        if not foods.exists():
            foods = FoodItem.objects.filter(available=True, is_veg=True).order_by('-is_bestseller')[:6]

        foods_data = FoodItemSerializer(foods, many=True, context={'request': request}).data

        # ── Build reply message ───────────────────────
        reply = self._build_reply(msg, foods_data, price_limit, wants_spicy, wants_veg,
                                  wants_sweet, wants_light, wants_popular, wants_cheap, detected_cats)

        # ── Quick reply chips ─────────────────────────
        quick_replies = ['🔥 Bestsellers', '💰 Under ₹100', '🌶️ Spicy food',
                         '🍕 Pizza', '🍛 Biryani', '🥟 Momos', '🍰 Desserts']

        return Response({
            'reply': reply,
            'foods': foods_data,
            'quick_replies': quick_replies,
        })

    def _build_reply(self, msg, foods, price_limit, spicy, veg, sweet,
                     light, popular, cheap, cats):
        count = len(foods)
        if count == 0:
            return "😔 Sorry, koi item nahi mila. Kuch aur try karo!"

        parts = []
        if popular:
            parts.append("🔥 Yeh hain hamare bestsellers")
        elif spicy:
            parts.append("🌶️ Spicy options mil gaye")
        elif sweet:
            parts.append("🍰 Meethe options yeh hain")
        elif light:
            parts.append("🥗 Light & healthy options")
        elif cheap:
            parts.append("💰 Sabse saste options")
        elif cats:
            emoji_map = {'pizza':'🍕','burger':'🍔','biryani':'🍛','dosa':'🥞',
                         'momos':'🥟','noodles':'🍜','paneer':'🧀','snacks':'🍟',
                         'dessert':'🍰','drinks':'🥤','sandwich':'🥪','roll':'🌯','thali':'🍱'}
            e = emoji_map.get(cats[0], '🍽️')
            parts.append(f"{e} {cats[0].title()} options yeh hain")
        else:
            parts.append("🍽️ Yeh items tumhare liye")

        if price_limit:
            parts.append(f"₹{price_limit} ke andar")

        parts.append(f"— {count} options mile! 👇")
        return ' '.join(parts)


# ── AI FEED (Hyper-Personalized) ──────────────────────
class AIFeedView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        hour = timezone.localtime().hour
        if 6 <= hour < 11:
            tags = ['breakfast', 'idli', 'dosa', 'poha', 'upma', 'paratha', 'egg']
            label = 'Perfect for Breakfast 🌅'
        elif 11 <= hour < 15:
            tags = ['lunch', 'rice', 'biryani', 'thali', 'dal', 'roti', 'sabzi']
            label = 'Great Lunch Picks ☀️'
        elif 15 <= hour < 18:
            tags = ['snack', 'samosa', 'pakoda', 'chai', 'sandwich', 'maggi', 'rolls']
            label = 'Evening Snack Time 🍟'
        else:
            tags = ['dinner', 'biryani', 'pizza', 'burger', 'pasta', 'noodles', 'curry']
            label = 'Dinner Recommendations 🌙'

        q = Q()
        for t in tags:
            q |= Q(name__icontains=t) | Q(category__name__icontains=t)

        foods = FoodItem.objects.filter(available=True).filter(q)[:8]
        if foods.count() < 4:
            foods = FoodItem.objects.filter(available=True).order_by('?')[:8]

        return Response({
            'label': label,
            'foods': FoodItemSerializer(foods, many=True).data,
        })


# ── MOOD ORDERING ─────────────────────────────────────
class MoodFoodView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        mood = request.query_params.get('mood', 'happy').lower()
        tags = MOOD_TAGS.get(mood, MOOD_TAGS['happy'])

        q = Q()
        for t in tags:
            q |= Q(name__icontains=t) | Q(category__name__icontains=t)

        foods = FoodItem.objects.filter(available=True).filter(q)[:8]
        if foods.count() < 3:
            foods = FoodItem.objects.filter(available=True).order_by('?')[:8]

        return Response({
            'mood': mood,
            'foods': FoodItemSerializer(foods, many=True).data,
        })


# ── FLASH DEALS ───────────────────────────────────────
class FlashDealViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FlashDealSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        now = timezone.now()
        return FlashDeal.objects.filter(
            is_active=True, starts_at__lte=now, ends_at__gte=now
        ).select_related('food_item')


# ── LOYALTY ───────────────────────────────────────────
class LoyaltyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        acc, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        return Response(LoyaltySerializer(acc).data)

    def post(self, request):
        """Redeem points: POST { "points": 100 }"""
        acc, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        pts = int(request.data.get('points', 0))
        if acc.redeem_points(pts):
            discount = pts // 10  # 100 pts = ₹10
            return Response({'success': True, 'discount': discount, 'remaining': acc.points})
        return Response({'success': False, 'message': 'Insufficient points'}, status=400)


# ── SUBSCRIPTION ──────────────────────────────────────
class SubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            sub = request.user.subscription
            return Response(SubscriptionSerializer(sub).data)
        except Subscription.DoesNotExist:
            return Response({'active': False})

    def post(self, request):
        plan = request.data.get('plan', 'basic')
        expires = timezone.now() + timezone.timedelta(days=30)
        sub, _ = Subscription.objects.update_or_create(
            user=request.user,
            defaults={'plan': plan, 'expires_at': expires, 'is_active': True}
        )
        # Give loyalty points for subscribing
        acc, _ = LoyaltyAccount.objects.get_or_create(user=request.user)
        acc.add_points(200)
        return Response(SubscriptionSerializer(sub).data)


# ── REFERRAL ──────────────────────────────────────────
class ReferralView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get my referral code (username-based)"""
        username = request.user.username
        # Clean up phone-based usernames
        if username.startswith('phone_'):
            code = f"REF{username[6:]}"  # REF + phone number
        else:
            code = f"REF{username.upper()}"
        count = Referral.objects.filter(referrer=request.user).count()
        return Response({'code': code, 'referrals': count, 'bonus_per_referral': 100})

    def post(self, request):
        """Apply referral code on registration"""
        code = request.data.get('code', '').strip().upper()
        if not code.startswith('REF'):
            return Response({'error': 'Invalid code'}, status=400)

        username = code[3:].lower()
        try:
            referrer = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            return Response({'error': 'Referrer not found'}, status=400)

        if referrer == request.user:
            return Response({'error': 'Cannot refer yourself'}, status=400)

        ref, created = Referral.objects.get_or_create(
            referred=request.user,
            defaults={'referrer': referrer}
        )
        if created and not ref.bonus_given:
            # Give ₹100 bonus as loyalty points to both
            for u in [referrer, request.user]:
                acc, _ = LoyaltyAccount.objects.get_or_create(user=u)
                acc.add_points(100)
            ref.bonus_given = True
            ref.save()
            return Response({'success': True, 'message': '₹100 bonus added for both!'})
        return Response({'error': 'Referral already applied'}, status=400)


# ── GROUP ORDER ───────────────────────────────────────
class GroupOrderViewSet(viewsets.ModelViewSet):
    serializer_class = GroupOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GroupOrder.objects.filter(creator=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            creator=self.request.user,
            expires_at=timezone.now() + timezone.timedelta(hours=2)
        )

    @action(detail=False, methods=['get'], url_path='join/(?P<code>[A-Z0-9]+)')
    def join(self, request, code=None):
        try:
            group = GroupOrder.objects.get(invite_code=code, status='open')
            return Response(GroupOrderSerializer(group).data)
        except GroupOrder.DoesNotExist:
            return Response({'error': 'Invalid or expired group order'}, status=404)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        group = self.get_object()
        if group.status != 'open':
            return Response({'error': 'Group order is closed'}, status=400)
        item = GroupOrderItem.objects.create(
            group_order=group,
            user=request.user,
            food_item_id=request.data.get('food_item'),
            quantity=request.data.get('quantity', 1),
        )
        return Response(GroupOrderItemSerializer(item).data)

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        group = self.get_object()
        items = group.items.select_related('user', 'food_item').all()
        total = sum(i.subtotal() for i in items)
        per_person = {}
        for i in items:
            per_person.setdefault(i.user.username, 0)
            per_person[i.user.username] += i.subtotal()
        return Response({
            'group': GroupOrderSerializer(group).data,
            'items': GroupOrderItemSerializer(items, many=True).data,
            'total': round(total, 2),
            'split': per_person,
        })


# ── SMART DELIVERY ETA ────────────────────────────────
class DeliveryETAView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        import math, datetime

        restaurant_id = request.query_params.get('restaurant_id')
        user_lat = request.query_params.get('lat')
        user_lng = request.query_params.get('lng')

        # Restaurant load: active orders being prepared
        if restaurant_id:
            pending = Order.objects.filter(
                food_item__restaurant_id=restaurant_id,
                status__in=['Pending', 'Confirmed', 'Preparing']
            ).count()
        else:
            pending = Order.objects.filter(status__in=['Pending', 'Confirmed', 'Preparing']).count()

        # Base prep time
        base_time = 15

        # Restaurant load factor (each active order adds ~1.5 min, max +15)
        load_time = min(round(pending * 1.5), 15)

        # Distance-based time (if coords provided)
        distance_time = 10  # default 10 min
        distance_km = None
        if user_lat and user_lng and restaurant_id:
            try:
                rest = Restaurant.objects.get(id=restaurant_id)
                # Haversine formula
                R = 6371
                lat1, lon1 = math.radians(float(user_lat)), math.radians(float(user_lng))
                # Use fixed restaurant coords (Ahmedabad center as default)
                lat2, lon2 = math.radians(23.0225), math.radians(72.5714)
                dlat = lat2 - lat1
                dlon = lon2 - lon1
                a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
                distance_km = round(R * 2 * math.asin(math.sqrt(a)), 1)
                # Avg delivery speed ~20 km/h in city
                distance_time = round((distance_km / 20) * 60)
                distance_time = max(5, min(distance_time, 45))
            except Exception:
                pass

        # Time-of-day traffic factor
        hour = datetime.datetime.now().hour
        if 8 <= hour <= 10 or 17 <= hour <= 20:
            traffic_label = 'Heavy traffic'
            traffic_extra = 8
        elif 12 <= hour <= 14:
            traffic_label = 'Moderate traffic'
            traffic_extra = 4
        else:
            traffic_label = 'Light traffic'
            traffic_extra = 0

        eta = base_time + load_time + distance_time + traffic_extra

        # Build breakdown
        breakdown = [
            {'label': '👨‍🍳 Preparation', 'minutes': base_time + load_time},
            {'label': '🛵 Delivery', 'minutes': distance_time + traffic_extra},
        ]

        return Response({
            'eta_minutes': eta,
            'label': f'Delivery in ~{eta} min',
            'load': 'High' if pending > 8 else 'Normal',
            'traffic': traffic_label,
            'distance_km': distance_km,
            'breakdown': breakdown,
            'pending_orders': pending,
        })


# ── PREDICTIVE ORDERING (AI) ──────────────────────────
class PredictiveOrderingView(APIView):
    """
    GET /ai/predictive/
    Analyzes user's order history and returns:
    - Personalized insight messages ("You usually order pizza on Fridays 🍕")
    - Predicted food suggestions based on patterns
    - Deal-boosted items (flash deals on predicted items)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from collections import Counter
        from django.utils import timezone

        user = request.user
        now = timezone.localtime()
        today_name = now.strftime('%A')   # e.g. "Friday"
        today_num  = now.weekday()        # 0=Mon … 6=Sun
        hour       = now.hour

        # ── Fetch last 60 orders ──────────────────────
        orders = (
            Order.objects
            .filter(user=user, status='Delivered')
            .select_related('food_item__category')
            .order_by('-created_at')[:60]
        )

        if not orders:
            # Cold start — return time-based popular items
            return self._cold_start(hour)

        # ── Pattern analysis ──────────────────────────
        day_items   = Counter()   # (weekday, food_id) → count
        cat_counts  = Counter()   # category_name → count
        item_counts = Counter()   # food_id → count
        item_names  = {}          # food_id → name
        item_objs   = {}          # food_id → FoodItem

        for o in orders:
            fi = o.food_item
            day = o.created_at.weekday()
            day_items[(day, fi.id)] += 1
            cat_counts[fi.category.name if fi.category else 'General'] += 1
            item_counts[fi.id] += 1
            item_names[fi.id] = fi.name
            item_objs[fi.id] = fi

        # ── Build insight messages ────────────────────
        insights = []
        DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

        # Top item on today's weekday
        today_top = sorted(
            [(cnt, fid) for (day, fid), cnt in day_items.items() if day == today_num],
            reverse=True
        )
        if today_top:
            top_cnt, top_fid = today_top[0]
            if top_cnt >= 2:
                insights.append({
                    'type': 'habit',
                    'message': f"You usually order {item_names[top_fid]} on {today_name}s 🍽️",
                    'food_id': top_fid,
                })

        # Most ordered item overall
        if item_counts:
            fav_id, fav_cnt = item_counts.most_common(1)[0]
            if fav_cnt >= 3:
                insights.append({
                    'type': 'favourite',
                    'message': f"Your all-time favourite: {item_names[fav_id]} ❤️ (ordered {fav_cnt}x)",
                    'food_id': fav_id,
                })

        # Top category
        if cat_counts:
            fav_cat, cat_cnt = cat_counts.most_common(1)[0]
            if cat_cnt >= 2:
                insights.append({
                    'type': 'category',
                    'message': f"You love {fav_cat} — here are today's best picks 🤩",
                    'category': fav_cat,
                })

        # Time-based nudge
        time_nudge = self._time_nudge(hour)
        if time_nudge:
            insights.append(time_nudge)

        # ── Build food suggestions ────────────────────
        suggested_ids = set()

        # 1. Today's habit items
        for _, fid in today_top[:3]:
            suggested_ids.add(fid)

        # 2. Top overall items
        for fid, _ in item_counts.most_common(5):
            suggested_ids.add(fid)

        # 3. Top category items (new items user hasn't tried)
        if cat_counts:
            top_cat = cat_counts.most_common(1)[0][0]
            cat_foods = FoodItem.objects.filter(
                available=True,
                category__name=top_cat
            ).exclude(id__in=item_counts.keys())[:4]
            for f in cat_foods:
                suggested_ids.add(f.id)

        # Fetch all suggested food items
        foods = FoodItem.objects.filter(
            id__in=suggested_ids, available=True
        ).select_related('category', 'restaurant')[:8]

        # ── Flash deal boost ──────────────────────────
        now_utc = timezone.now()
        live_deals = {
            fd.food_item_id: fd.discount_percent
            for fd in FlashDeal.objects.filter(
                is_active=True,
                starts_at__lte=now_utc,
                ends_at__gte=now_utc,
                food_item_id__in=suggested_ids,
            )
        }

        foods_data = FoodItemSerializer(foods, many=True, context={'request': request}).data
        for f in foods_data:
            if f['id'] in live_deals:
                f['deal_discount'] = live_deals[f['id']]
                f['deal_label'] = f"🔥 {live_deals[f['id']]}% OFF today!"

        # ── Reorder suggestions (deals first) ─────────
        foods_data = sorted(
            foods_data,
            key=lambda f: (-(f.get('deal_discount') or 0), -item_counts.get(f['id'], 0))
        )

        return Response({
            'insights': insights,
            'suggestions': foods_data,
            'based_on': len(orders),
        })

    def _cold_start(self, hour):
        """No order history — return popular time-based items."""
        if 6 <= hour < 11:
            cats = ['Indian Breakfast', 'Light Breakfast', 'Tea', 'Coffee']
            msg = "Good morning! Start your day right ☀️"
        elif 11 <= hour < 15:
            cats = ['Biryani', 'Thali', 'North Indian', 'South Indian']
            msg = "Lunch time! Here are today's top picks 🍛"
        elif 15 <= hour < 18:
            cats = ['Snacks', 'Fast Food', 'Street Food', 'Cold Drinks']
            msg = "Evening snack time! 🍟"
        else:
            cats = ['Pizza', 'Biryani', 'Chicken Items', 'Burgers']
            msg = "Dinner time! What are you craving? 🌙"

        q = Q()
        for c in cats:
            q |= Q(category__name__icontains=c)
        foods = FoodItem.objects.filter(available=True).filter(q)[:8]
        if foods.count() < 4:
            foods = FoodItem.objects.filter(available=True).order_by('?')[:8]

        return Response({
            'insights': [{'type': 'time', 'message': msg}],
            'suggestions': FoodItemSerializer(foods, many=True).data,
            'based_on': 0,
        })

    def _time_nudge(self, hour):
        if 11 <= hour < 14:
            return {'type': 'time', 'message': "Lunch rush! Order now for faster delivery 🚀"}
        if 19 <= hour < 22:
            return {'type': 'time', 'message': "Dinner time is here — your favourites await 🌆"}
        if hour >= 23 or hour < 5:
            return {'type': 'time', 'message': "Late night cravings? We've got you 🌙"}
        return None


# ── HYPERLOCAL BATCH DELIVERY ─────────────────────────
class BatchOptimizeView(APIView):
    """
    GET /delivery/batch/optimize/?status=Confirmed
    Returns AI-optimized route for all pending/confirmed orders.
    Delivery boy or admin only.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .route_optimizer import build_batch
        status_filter = request.query_params.get('status', 'Confirmed')
        origin_lat = float(request.query_params.get('lat', 23.0225))
        origin_lng = float(request.query_params.get('lng', 72.5714))

        orders = Order.objects.filter(
            status__in=[status_filter, 'Preparing']
        ).select_related('food_item', 'delivery_boy').order_by('created_at')[:20]

        if not orders:
            return Response({'route': [], 'total_orders': 0, 'message': 'No orders to optimize'})

        result = build_batch(list(orders), origin=(origin_lat, origin_lng))
        return Response(result)


class AssignBatchView(APIView):
    """
    POST /delivery/batch/assign/
    Body: { "order_ids": [1,2,3], "batch_id": "ABC123" }
    Assigns orders to the requesting delivery boy + marks batch_id.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_ids = request.data.get('order_ids', [])
        batch_id = request.data.get('batch_id', '')

        try:
            delivery_boy = request.user.delivery_profile
        except Exception:
            return Response({'error': 'Not a registered delivery partner'}, status=403)

        updated = Order.objects.filter(
            id__in=order_ids,
            status__in=['Confirmed', 'Preparing', 'Pending']
        ).update(delivery_boy=delivery_boy, batch_id=batch_id, status='On the way')

        return Response({
            'assigned': updated,
            'batch_id': batch_id,
            'message': f'{updated} orders assigned to you and marked On the way',
        })


# ── SURGE PRICING ─────────────────────────────────────
class SurgePricingView(APIView):
    """Returns current surge info so the frontend can show a banner."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .dynamic_pricing import get_surge_info
        surge = get_surge_info(request)
        if surge:
            return Response(surge)
        return Response({'active': False, 'multiplier': 1.0, 'label': None, 'emoji': None, 'reason': None})


# ── DYNAMIC OFFERS ────────────────────────────────────
class DynamicOfferView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user
        if user.is_authenticated:
            order_count = Order.objects.filter(user=user).count()
            if order_count == 0:
                return Response({'code': 'WELCOME60', 'discount': 60, 'label': '60% OFF for new users! 🎉', 'type': 'percent'})
            elif order_count < 5:
                return Response({'code': 'BACK20', 'discount': 20, 'label': '20% cashback for you! 💰', 'type': 'percent'})
            else:
                return Response({'code': 'LOYAL50', 'discount': 50, 'label': 'Loyal user special: ₹50 OFF! 🏆', 'type': 'flat'})
        return Response({'code': 'FIRST60', 'discount': 60, 'label': '60% OFF on first order! 🎉', 'type': 'percent'})


# ── PUSH CAMPAIGN ─────────────────────────────────────
class PushCampaignView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        campaigns = PushCampaign.objects.order_by('-created_at')[:20]
        return Response(PushCampaignSerializer(campaigns, many=True).data)

    def post(self, request):
        s = PushCampaignSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        s.save(created_by=request.user)
        return Response(s.data, status=201)


# ── VIDEO FEED ────────────────────────────────────────
from .models import FoodVideo, GroceryCategory, GroceryItem, Badge, UserBadge
from .serializers import (
    FoodVideoSerializer, GroceryCategorySerializer,
    GroceryItemSerializer, BadgeSerializer, UserBadgeSerializer,
)


class FoodVideoViewSet(viewsets.ModelViewSet):
    serializer_class = FoodVideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = FoodVideo.objects.filter(is_active=True, is_veg=True).prefetch_related('likes')
        restaurant = self.request.query_params.get('restaurant')
        if restaurant:
            qs = qs.filter(restaurant_id=restaurant)
        return qs

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.views += 1
        obj.save(update_fields=['views'])
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        video = self.get_object()
        user = request.user
        if user in video.likes.all():
            video.likes.remove(user)
            liked = False
        else:
            video.likes.add(user)
            liked = True
        return Response({'liked': liked, 'like_count': video.likes.count()})


# ── GROCERY ───────────────────────────────────────────
class GroceryCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GroceryCategory.objects.all()
    serializer_class = GroceryCategorySerializer
    permission_classes = [permissions.AllowAny]


class GroceryItemViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GroceryItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = GroceryItem.objects.filter(available=True).select_related('category')
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        organic = self.request.query_params.get('organic')
        if category:
            qs = qs.filter(category__name__icontains=category)
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(description__icontains=search))
        if organic == 'true':
            qs = qs.filter(is_organic=True)
        return qs


# ── IMAGE SEARCH ──────────────────────────────────────
class ImageSearchView(APIView):
    """
    Keyword-based image search: user uploads image name/description,
    we match against food names. For real AI, integrate Google Vision API.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        query = request.data.get('query', '').strip()
        if not query:
            return Response({'foods': [], 'message': 'No query provided'}, status=400)

        words = query.lower().split()
        q = Q()
        for w in words:
            q |= Q(name__icontains=w) | Q(category__name__icontains=w) | Q(description__icontains=w)

        foods = FoodItem.objects.filter(available=True).filter(q)[:12]
        return Response({
            'query': query,
            'foods': FoodItemSerializer(foods, many=True).data,
            'count': foods.count(),
        })


# ── BADGES / GAMIFICATION ─────────────────────────────
def award_badge(user, badge_type):
    """Award a badge to user if not already earned. Also give loyalty points."""
    try:
        badge = Badge.objects.get(badge_type=badge_type)
        _, created = UserBadge.objects.get_or_create(user=user, badge=badge)
        if created:
            acc, _ = LoyaltyAccount.objects.get_or_create(user=user)
            acc.add_points(badge.points_reward)
        return created
    except Badge.DoesNotExist:
        return False


class BadgeListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        badges = Badge.objects.all()
        return Response(BadgeSerializer(badges, many=True).data)


class UserBadgeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_badges = UserBadge.objects.filter(user=request.user).select_related('badge')
        all_badges = Badge.objects.all()
        earned_types = set(ub.badge.badge_type for ub in user_badges)
        return Response({
            'earned': UserBadgeSerializer(user_badges, many=True).data,
            'total_badges': all_badges.count(),
            'earned_count': user_badges.count(),
            'locked': [
                {'badge_type': b.badge_type, 'name': b.name, 'icon': b.icon, 'description': b.description}
                for b in all_badges if b.badge_type not in earned_types
            ],
        })


class LeaderboardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        top = LoyaltyAccount.objects.select_related('user').order_by('-total_earned')[:10]
        return Response([
            {
                'rank': i + 1,
                'username': acc.user.username,
                'points': acc.total_earned,
                'level': acc.level,
                'badges': UserBadge.objects.filter(user=acc.user).count(),
            }
            for i, acc in enumerate(top)
        ])


# ── VOICE SEARCH ──────────────────────────────────────
class VoiceSearchView(APIView):
    """Process voice transcript and return matching foods."""
    permission_classes = [permissions.AllowAny]

    # Common voice command patterns
    STOP_WORDS = {'mujhe', 'chahiye', 'do', 'order', 'karo', 'lao', 'dena', 'please',
                  'i', 'want', 'need', 'get', 'me', 'a', 'an', 'the', 'some'}

    def post(self, request):
        transcript = request.data.get('transcript', '').strip().lower()
        if not transcript:
            return Response({'foods': [], 'restaurants': []})

        # Extract keywords
        words = [w for w in transcript.split() if w not in self.STOP_WORDS and len(w) > 2]

        q = Q()
        for w in words:
            q |= Q(name__icontains=w) | Q(category__name__icontains=w) | Q(description__icontains=w)

        foods = FoodItem.objects.filter(available=True).filter(q)[:8] if words else FoodItem.objects.none()
        restaurants = Restaurant.objects.filter(is_active=True).filter(
            Q(name__icontains=transcript) | Q(cuisine__icontains=transcript)
        )[:4]

        return Response({
            'transcript': transcript,
            'keywords': words,
            'foods': FoodItemSerializer(foods, many=True).data,
            'restaurants': RestaurantSerializer(restaurants, many=True).data,
        })


# ── CONTACT MESSAGE ───────────────────────────────────
class ContactMessageView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from .serializers import ContactMessageSerializer
        s = ContactMessageSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        s.save()
        return Response({'success': True, 'message': 'Message received!'}, status=201)


# ── SMART COMBO BUILDER (AI) ──────────────────────────
class SmartComboView(APIView):
    """
    POST { "query": "burger" }
    Returns a smart combo suggestion: main + sides + drink
    """
    permission_classes = [permissions.AllowAny]

    # Combo rules: keyword → [main_tags, side_tags, drink_tags]
    COMBO_RULES = {
        'burger':   (['burger'],                    ['fries', 'french fries', 'nuggets'],          ['cold coffee', 'cola', 'shake', 'lassi']),
        'pizza':    (['pizza'],                     ['garlic bread', 'fries', 'spring rolls'],     ['cold coffee', 'cola', 'juice']),
        'biryani':  (['biryani', 'veg biryani'],    ['raita', 'salad', 'papad'],                   ['lassi', 'cola', 'lime soda']),
        'dosa':     (['dosa', 'masala dosa'],       ['vada', 'idli', 'sambar'],                    ['chai', 'coffee', 'juice']),
        'momos':    (['momos', 'dumpling'],         ['spring rolls', 'fries', 'soup'],             ['cola', 'lime soda', 'tea']),
        'noodles':  (['noodles', 'hakka'],          ['spring rolls', 'manchurian', 'soup'],        ['cola', 'lime soda']),
        'paneer':   (['paneer'],                    ['naan', 'roti', 'rice', 'dal'],               ['lassi', 'chai', 'lime soda']),
        'pasta':    (['pasta'],                     ['garlic bread', 'soup', 'salad'],             ['cold coffee', 'juice', 'cola']),
        'sandwich': (['sandwich'],                  ['fries', 'soup', 'salad'],                    ['cold coffee', 'juice', 'shake']),
    }

    def _find_items(self, tags, exclude_ids=None, limit=1):
        exclude_ids = exclude_ids or []
        q = Q()
        for t in tags:
            q |= Q(name__icontains=t) | Q(category__name__icontains=t)
        return list(
            FoodItem.objects.filter(available=True, is_veg=True).filter(q)
            .exclude(id__in=exclude_ids)[:limit]
        )

    def post(self, request):
        query = request.data.get('query', '').strip().lower()
        if not query:
            return Response({'error': 'Query required'}, status=400)

        # Match query to a combo rule
        rule_key = None
        for key in self.COMBO_RULES:
            if key in query or query in key:
                rule_key = key
                break

        # Fallback: use query directly
        if not rule_key:
            main_tags = [query]
            side_tags = ['fries', 'salad', 'soup', 'bread']
            drink_tags = ['cola', 'juice', 'lassi', 'shake', 'coffee']
        else:
            main_tags, side_tags, drink_tags = self.COMBO_RULES[rule_key]

        # Find main item
        mains = self._find_items(main_tags, limit=1)
        if not mains:
            return Response({'found': False, 'message': f'No items found for "{query}"'})

        main = mains[0]
        used_ids = [main.id]

        # Find side
        sides = self._find_items(side_tags, exclude_ids=used_ids, limit=1)
        side = sides[0] if sides else None
        if side:
            used_ids.append(side.id)

        # Find drink
        drinks = self._find_items(drink_tags, exclude_ids=used_ids, limit=1)
        drink = drinks[0] if drinks else None

        # Build combo
        items = [main]
        if side:
            items.append(side)
        if drink:
            items.append(drink)

        total = sum(float(i.price) for i in items)
        combo_price = round(total * 0.85, 2)  # 15% combo discount
        savings = round(total - combo_price, 2)

        return Response({
            'found': True,
            'query': query,
            'combo': FoodItemSerializer(items, many=True).data,
            'original_price': round(total, 2),
            'combo_price': combo_price,
            'savings': savings,
            'discount_percent': 15,
            'label': f'🎯 Perfect combo for "{query}"',
        })


# ── HERO SLIDER ───────────────────────────────────────
from .models import HeroSlide
from .serializers import HeroSlideSerializer


class HeroSlideViewSet(viewsets.ModelViewSet):
    serializer_class = HeroSlideSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        if self.request.method == 'GET' and not (
            self.request.user and self.request.user.is_staff
        ):
            now = timezone.now()
            return HeroSlide.objects.filter(is_active=True).filter(
                Q(expires_at__isnull=True) | Q(expires_at__gt=now)
            )
        return HeroSlide.objects.all()


# ── WHATSAPP MENU ─────────────────────────────────────


class WhatsAppMenuView(APIView):
    """
    GET /api/whatsapp/menu/
    Returns top food items formatted for WhatsApp message
    """
    permission_classes = [permissions.AllowAny]

    WHATSAPP_NUMBER = '916354203030'  # Cravely Food business number

    def get(self, request):
        # Get top 10 bestseller items
        items = FoodItem.objects.filter(available=True, is_bestseller=True)[:10]
        if not items:
            items = FoodItem.objects.filter(available=True)[:10]

        # Build WhatsApp message text
        lines = ['🍽️ *Cravely Food Menu*', '']
        for i, item in enumerate(items, 1):
            veg = '🟢' if item.is_veg else '🔴'
            lines.append(f'{i}. {veg} *{item.name}* — ₹{item.price}')
            if item.description:
                lines.append(f'   _{item.description[:60]}_')

        lines += [
            '',
            '📦 To order, reply with item number(s)',
            'e.g. "Order 1, 3, 5"',
            '',
            '🚀 Fast delivery | 💳 COD available',
        ]

        message = '\n'.join(lines)
        wa_url = f'https://wa.me/{self.WHATSAPP_NUMBER}?text={message.replace(" ", "%20").replace("\n", "%0A")}'

        return Response({
            'whatsapp_number': self.WHATSAPP_NUMBER,
            'wa_url': wa_url,
            'menu_text': message,
            'items': FoodItemSerializer(items, many=True).data,
        })
