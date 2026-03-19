from django.core.management.base import BaseCommand
from food.models import Category, FoodItem

class Command(BaseCommand):
    help = 'Add sample food items with categories'

    def handle(self, *args, **kwargs):
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
        ]

        for cat_name, foods in data:
            cat, _ = Category.objects.get_or_create(name=cat_name)
            for name, desc, price in foods:
                food, created = FoodItem.objects.get_or_create(
                    name=name,
                    defaults={"category": cat, "description": desc, "price": price, "available": True}
                )
                status = "✅ Created" if created else "⏭️  Exists"
                self.stdout.write(f"{status}: {food.name} - ₹{food.price}")

        self.stdout.write(self.style.SUCCESS('\n✨ Sample foods ready!'))
