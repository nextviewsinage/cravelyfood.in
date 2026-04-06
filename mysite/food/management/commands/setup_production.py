import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from food.models import Category, FoodItem


class Command(BaseCommand):
    help = 'Setup production: create superuser + seed sample data'

    def handle(self, *args, **kwargs):
        # ── Superuser ──────────────────────────────────
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@cravelyfood.in')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'Admin@1234')

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'✅ Superuser created: {username}'))
        else:
            self.stdout.write(f'⏭️  Superuser already exists: {username}')

        # ── Sample Data ────────────────────────────────
        data = [
            ("Burgers", [
                ("Classic Burger", "Juicy beef patty with lettuce, tomato and cheese", 149),
                ("Cheese Burger", "Double cheese with crispy onions and special sauce", 179),
                ("Veg Burger", "Crispy veggie patty with fresh veggies", 129),
            ]),
            ("Pizza", [
                ("Margherita Pizza", "Classic tomato sauce with mozzarella cheese", 249),
                ("Pepperoni Pizza", "Loaded with pepperoni and extra cheese", 299),
                ("Veg Supreme Pizza", "Bell peppers, mushrooms, olives and onions", 279),
            ]),
            ("Biryani", [
                ("Chicken Biryani", "Aromatic basmati rice with tender chicken", 249),
                ("Veg Biryani", "Fragrant rice with mixed vegetables and spices", 199),
                ("Hyderabadi Biryani", "Authentic dum biryani with saffron", 299),
            ]),
            ("Snacks", [
                ("French Fries", "Crispy golden fries with dipping sauce", 89),
                ("Paneer Tikka", "Grilled cottage cheese with spices", 199),
                ("Spring Rolls", "Crispy rolls with vegetable filling", 129),
            ]),
            ("Drinks", [
                ("Mango Lassi", "Fresh mango blended with yogurt", 79),
                ("Cold Coffee", "Chilled coffee with milk and ice cream", 99),
                ("Fresh Lime Soda", "Refreshing lime with soda water", 59),
            ]),
            ("Desserts", [
                ("Gulab Jamun", "Soft milk dumplings in sugar syrup", 69),
                ("Ice Cream", "Creamy vanilla ice cream with toppings", 89),
                ("Chocolate Brownie", "Warm fudgy brownie with ice cream", 129),
            ]),
        ]

        count = 0
        for cat_name, foods in data:
            cat, _ = Category.objects.get_or_create(name=cat_name)
            for name, desc, price in foods:
                _, created = FoodItem.objects.get_or_create(
                    name=name,
                    defaults={"category": cat, "description": desc, "price": price, "available": True}
                )
                if created:
                    count += 1

        self.stdout.write(self.style.SUCCESS(f'✅ {count} food items seeded!'))
