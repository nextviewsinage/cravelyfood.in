from django.core.management.base import BaseCommand
from food.models import FoodItem, Category


class Command(BaseCommand):
    help = 'Remove ALL non-veg food items and non-veg categories'

    def handle(self, *args, **kwargs):
        # Delete all food items where is_veg=False
        deleted_items, _ = FoodItem.objects.filter(is_veg=False).delete()

        # Delete non-veg categories
        non_veg_cats = [
            'Chicken Items', 'Mutton Dishes', 'Fish & Seafood',
            'Seafood', 'Tandoori Items', 'Kebabs', 'Rolls',
        ]
        deleted_cats, _ = Category.objects.filter(name__in=non_veg_cats).delete()

        self.stdout.write(self.style.SUCCESS(
            f'✅ Removed {deleted_items} non-veg food items, {deleted_cats} non-veg categories'
        ))
