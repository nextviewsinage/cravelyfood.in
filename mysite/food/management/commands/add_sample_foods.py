from django.core.management.base import BaseCommand
from food.models import Category, FoodItem

class Command(BaseCommand):
    help = 'Add sample food items to the database'

    def handle(self, *args, **kwargs):
        # Create a default category first
        category, _ = Category.objects.get_or_create(name="General")
        self.stdout.write(self.style.SUCCESS(f'Category ready: {category.name}'))
        
        sample_foods = [
            {"name": "Burger", "price": 150, "available": True},
            {"name": "Pizza", "price": 200, "available": True},
            {"name": "Pasta", "price": 120, "available": True},
            {"name": "Fries", "price": 80, "available": True},
            {"name": "Chicken Biryani", "price": 250, "available": True},
        ]
        
        for food_data in sample_foods:
            food, created = FoodItem.objects.get_or_create(
                name=food_data["name"],
                defaults={
                   "category": category,
                    "price": food_data["price"],
                    "available": food_data["available"],
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'✅ Created: {food.name} - ₹{food.price}'))
            else:
                self.stdout.write(f'⏭️  Already exists: {food.name}')
        
        self.stdout.write(self.style.SUCCESS('\n✨ Sample foods added successfully!'))
