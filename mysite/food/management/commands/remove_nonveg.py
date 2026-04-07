from django.core.management.base import BaseCommand
from food.models import FoodItem, Category


class Command(BaseCommand):
    help = 'Remove all non-veg categories and their food items'

    def handle(self, *args, **kwargs):
        non_veg_cats = [
            'Chicken Items', 'Mutton Dishes', 'Fish & Seafood',
            'Seafood', 'Tandoori Items', 'Kebabs'
        ]
        items = FoodItem.objects.filter(category__name__in=non_veg_cats).delete()
        cats = Category.objects.filter(name__in=non_veg_cats).delete()
        self.stdout.write(f'Deleted items: {items[0]}, categories: {cats[0]}')
