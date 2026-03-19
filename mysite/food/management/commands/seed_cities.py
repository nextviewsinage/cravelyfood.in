"""
python manage.py seed_cities
Adds restaurants for major Indian cities so city-based search works.
"""
from django.core.management.base import BaseCommand
from food.models import Restaurant, FoodItem, Category


CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Pune', 'Kolkata', 'Surat', 'Jaipur', 'Gandhinagar',
    'Vadodara', 'Rajkot', 'Indore', 'Bhopal', 'Nagpur',
    'Lucknow', 'Kanpur', 'Patna', 'Chandigarh', 'Kochi',
]

RESTAURANT_TEMPLATES = [
    ('Biryani House',    'Authentic dum biryani',          'Mughlai, Biryani',    '35-45 min', 199),
    ('Pizza Palace',     'Best pizzas in town',            'Italian, Pizza',      '25-35 min', 149),
    ('Burger Barn',      'Juicy burgers & fries',          'American, Burgers',   '20-30 min', 99),
    ('Spice Garden',     'North Indian thali & curries',   'North Indian',        '30-40 min', 149),
    ('Dragon Wok',       'Indo-Chinese fusion',            'Chinese, Indo-Chinese','25-35 min', 129),
    ('South Spice',      'Authentic South Indian',         'South Indian',        '20-30 min', 99),
    ('Momo Magic',       'Steamed & fried momos',          'Tibetan, Momos',      '20-25 min', 79),
    ('The Dessert Lab',  'Cakes, ice cream & more',        'Desserts, Bakery',    '15-25 min', 79),
]

FOOD_TEMPLATES = [
    # (category, name, desc, price, is_veg, is_bestseller)
    ('Biryani',      'Hyderabadi Chicken Biryani', 'Authentic dum biryani with tender chicken', 299, False, True),
    ('Pizza',        'Margherita Pizza',           'Classic tomato sauce with mozzarella',      199, True,  True),
    ('Burgers',      'Classic Burger',             'Juicy patty with lettuce and tomato',       149, False, True),
    ('North Indian', 'Paneer Butter Masala',       'Soft paneer in rich tomato-butter gravy',   220, True,  True),
    ('Chinese',      'Veg Fried Rice',             'Wok-tossed rice with fresh vegetables',     149, True,  True),
    ('South Indian', 'Masala Dosa',                'Crispy dosa with spiced potato filling',    99,  True,  True),
    ('Momos',        'Veg Steamed Momos',          'Soft steamed dumplings with veg filling',   99,  True,  True),
    ('Desserts',     'Gulab Jamun',                'Soft milk dumplings in sugar syrup',        79,  True,  True),
]


class Command(BaseCommand):
    help = 'Seed restaurants for major Indian cities'

    def handle(self, *args, **kwargs):
        total_rest = 0
        total_food = 0

        for city in CITIES:
            for rest_name, desc, cuisine, dtime, min_order in RESTAURANT_TEMPLATES:
                rest, created = Restaurant.objects.get_or_create(
                    name=rest_name,
                    city=city,
                    defaults=dict(
                        description=desc,
                        address=f'Main Road, {city}',
                        cuisine=cuisine,
                        delivery_time=dtime,
                        min_order=min_order,
                        is_active=True,
                    )
                )
                if created:
                    total_rest += 1
                    # Add food items for this restaurant
                    for cat_name, fname, fdesc, price, is_veg, is_best in FOOD_TEMPLATES:
                        cat, _ = Category.objects.get_or_create(name=cat_name)
                        if not FoodItem.objects.filter(name=fname, restaurant=rest).exists():
                            FoodItem.objects.create(
                                name=fname, description=fdesc, price=price,
                                is_veg=is_veg, is_bestseller=is_best,
                                category=cat, restaurant=rest, available=True
                            )
                            total_food += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ Added {total_rest} restaurants and {total_food} food items across {len(CITIES)} cities'
        ))
