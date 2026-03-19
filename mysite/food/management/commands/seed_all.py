"""
python manage.py seed_all
Seeds: Categories, Restaurants, FoodItems, Coupons, FlashDeals,
       Badges, GroceryCategories, GroceryItems, FoodVideos, PushCampaigns
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from food.models import (
    Category, Restaurant, FoodItem, Coupon, FlashDeal,
    Badge, GroceryCategory, GroceryItem, FoodVideo, PushCampaign,
)
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Seed all data for the food delivery app'

    def handle(self, *args, **kwargs):
        self.seed_categories()
        self.seed_restaurants()
        self.seed_foods()
        self.seed_coupons()
        self.seed_flash_deals()
        self.seed_badges()
        self.seed_grocery()
        self.seed_videos()
        self.seed_campaigns()
        self.stdout.write(self.style.SUCCESS('✅ All data seeded successfully!'))

    # ── CATEGORIES ────────────────────────────────────
    def seed_categories(self):
        cats = [
            'Pizza', 'Burgers', 'Biryani', 'Snacks', 'Desserts',
            'Chinese', 'South Indian', 'North Indian', 'Beverages',
            'Sandwiches', 'Rolls', 'Pasta', 'Salads', 'Breakfast',
            'Seafood', 'Momos', 'Thali', 'Soups', 'Ice Cream', 'Cakes',
        ]
        for name in cats:
            Category.objects.get_or_create(name=name)
        self.stdout.write(f'  ✓ {len(cats)} categories')

    # ── RESTAURANTS ───────────────────────────────────
    def seed_restaurants(self):
        data = [
            ('Pizza Palace', 'Best pizzas in town', 'MG Road, Ahmedabad', 'Ahmedabad', 'Italian, Pizza', '25-35 min', 149),
            ('Burger Barn', 'Juicy burgers & fries', 'CG Road, Ahmedabad', 'Ahmedabad', 'American, Burgers', '20-30 min', 99),
            ('Biryani House', 'Authentic dum biryani', 'Navrangpura, Ahmedabad', 'Ahmedabad', 'Mughlai, Biryani', '35-45 min', 199),
            ('Spice Garden', 'North Indian thali & curries', 'Satellite, Ahmedabad', 'Ahmedabad', 'North Indian', '30-40 min', 149),
            ('Dragon Wok', 'Indo-Chinese fusion', 'Vastrapur, Ahmedabad', 'Ahmedabad', 'Chinese, Indo-Chinese', '25-35 min', 129),
            ('South Spice', 'Authentic South Indian', 'Paldi, Ahmedabad', 'Ahmedabad', 'South Indian', '20-30 min', 99),
            ('The Dessert Lab', 'Cakes, ice cream & more', 'Bodakdev, Ahmedabad', 'Ahmedabad', 'Desserts, Bakery', '15-25 min', 79),
            ('Wrap & Roll', 'Rolls, wraps & sandwiches', 'Maninagar, Ahmedabad', 'Ahmedabad', 'Fast Food, Snacks', '15-20 min', 79),
            ('Sea Breeze', 'Fresh seafood & coastal cuisine', 'Prahlad Nagar, Ahmedabad', 'Ahmedabad', 'Seafood, Coastal', '40-50 min', 249),
            ('Momo Magic', 'Steamed & fried momos', 'Thaltej, Ahmedabad', 'Ahmedabad', 'Tibetan, Momos', '20-25 min', 79),
        ]
        for name, desc, addr, city, cuisine, dtime, min_order in data:
            Restaurant.objects.get_or_create(
                name=name,
                defaults=dict(description=desc, address=addr, city=city,
                              cuisine=cuisine, delivery_time=dtime, min_order=min_order, is_active=True)
            )
        self.stdout.write(f'  ✓ {len(data)} restaurants')

    # ── FOOD ITEMS ────────────────────────────────────
    def seed_foods(self):
        foods = [
            # Pizza
            ('Pizza', 'Margherita Pizza', 'Classic tomato sauce with mozzarella cheese', 199, True, True, 'Pizza Palace'),
            ('Pizza', 'Pepperoni Pizza', 'Loaded with spicy pepperoni slices', 299, False, True, 'Pizza Palace'),
            ('Pizza', 'Veg Supreme Pizza', 'Bell peppers, olives, mushrooms & corn', 249, True, True, 'Pizza Palace'),
            ('Pizza', 'Paneer Tikka Pizza', 'Spicy paneer tikka on pizza base', 269, True, True, 'Pizza Palace'),
            ('Pizza', 'BBQ Chicken Pizza', 'Smoky BBQ sauce with grilled chicken', 319, False, True, 'Pizza Palace'),
            ('Pizza', 'Farmhouse Pizza', 'Fresh veggies on a crispy thin crust', 229, True, False, 'Pizza Palace'),
            # Burgers
            ('Burgers', 'Classic Burger', 'Juicy beef patty with lettuce and tomato', 149, False, True, 'Burger Barn'),
            ('Burgers', 'Cheese Burger', 'Double cheese with crispy patty', 179, False, True, 'Burger Barn'),
            ('Burgers', 'Veg Burger', 'Crispy aloo tikki with fresh veggies', 129, True, False, 'Burger Barn'),
            ('Burgers', 'Chicken Zinger', 'Spicy crispy chicken fillet burger', 199, False, True, 'Burger Barn'),
            ('Burgers', 'Paneer Burger', 'Grilled paneer with mint chutney', 159, True, False, 'Burger Barn'),
            ('Burgers', 'Double Patty Burger', 'Two patties, double the fun', 249, False, True, 'Burger Barn'),
            # Biryani
            ('Biryani', 'Veg Biryani', 'Fragrant basmati rice with mixed vegetables', 199, True, False, 'Biryani House'),
            ('Biryani', 'Hyderabadi Chicken Biryani', 'Authentic dum biryani with tender chicken', 299, False, True, 'Biryani House'),
            ('Biryani', 'Mutton Biryani', 'Slow-cooked mutton in aromatic spices', 349, False, True, 'Biryani House'),
            ('Biryani', 'Egg Biryani', 'Fluffy eggs layered with spiced rice', 229, False, False, 'Biryani House'),
            ('Biryani', 'Prawn Biryani', 'Juicy prawns with fragrant basmati', 379, False, False, 'Biryani House'),
            # North Indian
            ('North Indian', 'Dal Makhani', 'Creamy black lentils slow cooked overnight', 180, True, False, 'Spice Garden'),
            ('North Indian', 'Paneer Butter Masala', 'Soft paneer in rich tomato-butter gravy', 220, True, True, 'Spice Garden'),
            ('North Indian', 'Chicken Curry', 'Tender chicken in aromatic spices', 260, False, False, 'Spice Garden'),
            ('North Indian', 'Aloo Paratha', 'Stuffed whole wheat flatbread with butter', 120, True, False, 'Spice Garden'),
            ('North Indian', 'Rajma Chawal', 'Kidney beans curry with steamed rice', 160, True, False, 'Spice Garden'),
            ('North Indian', 'Chole Bhature', 'Spicy chickpeas with fluffy bhature', 149, True, True, 'Spice Garden'),
            ('Thali', 'Veg Thali', 'Complete meal: dal, sabzi, roti, rice, salad', 249, True, True, 'Spice Garden'),
            # Chinese
            ('Chinese', 'Veg Fried Rice', 'Wok-tossed rice with fresh vegetables', 149, True, True, 'Dragon Wok'),
            ('Chinese', 'Chicken Fried Rice', 'Classic Chinese fried rice with chicken', 179, False, True, 'Dragon Wok'),
            ('Chinese', 'Veg Hakka Noodles', 'Stir-fried noodles with veggies', 149, True, True, 'Dragon Wok'),
            ('Chinese', 'Chicken Manchurian', 'Crispy chicken in tangy Manchurian sauce', 219, False, True, 'Dragon Wok'),
            ('Chinese', 'Veg Spring Rolls', 'Crispy rolls filled with veggies', 129, True, False, 'Dragon Wok'),
            ('Chinese', 'Schezwan Paneer', 'Spicy paneer in Schezwan sauce', 199, True, False, 'Dragon Wok'),
            # South Indian
            ('South Indian', 'Masala Dosa', 'Crispy dosa with spiced potato filling', 99, True, True, 'South Spice'),
            ('South Indian', 'Idli Sambar', 'Soft idlis with sambar and chutneys', 79, True, True, 'South Spice'),
            ('South Indian', 'Vada Sambar', 'Crispy medu vada with sambar', 89, True, False, 'South Spice'),
            ('South Indian', 'Uttapam', 'Thick pancake with onion and tomato', 109, True, False, 'South Spice'),
            ('South Indian', 'Pongal', 'Comforting rice and lentil dish', 99, True, False, 'South Spice'),
            # Snacks
            ('Snacks', 'French Fries', 'Crispy golden fries with dipping sauce', 99, True, True, 'Burger Barn'),
            ('Snacks', 'Paneer Tikka', 'Grilled paneer cubes with spices', 199, True, True, 'Spice Garden'),
            ('Snacks', 'Chicken Wings', 'Spicy buffalo wings with ranch dip', 249, False, True, 'Burger Barn'),
            ('Snacks', 'Samosa (2 pcs)', 'Crispy pastry filled with spiced potatoes', 49, True, False, 'Wrap & Roll'),
            ('Snacks', 'Pav Bhaji', 'Spiced mashed veggies with buttered pav', 129, True, True, 'Wrap & Roll'),
            ('Snacks', 'Bhel Puri', 'Tangy puffed rice with chutneys', 79, True, False, 'Wrap & Roll'),
            # Momos
            ('Momos', 'Veg Steamed Momos', 'Soft steamed dumplings with veg filling', 99, True, True, 'Momo Magic'),
            ('Momos', 'Chicken Steamed Momos', 'Juicy chicken dumplings', 129, False, True, 'Momo Magic'),
            ('Momos', 'Paneer Fried Momos', 'Crispy fried momos with paneer', 119, True, False, 'Momo Magic'),
            ('Momos', 'Tandoori Momos', 'Smoky tandoor-cooked momos', 149, False, False, 'Momo Magic'),
            # Desserts
            ('Desserts', 'Gulab Jamun', 'Soft milk dumplings in sugar syrup', 79, True, True, 'The Dessert Lab'),
            ('Desserts', 'Chocolate Brownie', 'Warm fudgy brownie with ice cream', 149, True, True, 'The Dessert Lab'),
            ('Desserts', 'Rasmalai', 'Soft cottage cheese in saffron milk', 99, True, False, 'The Dessert Lab'),
            ('Desserts', 'Mango Kulfi', 'Creamy mango ice cream on a stick', 89, True, False, 'The Dessert Lab'),
            # Ice Cream
            ('Ice Cream', 'Vanilla Scoop', 'Classic creamy vanilla ice cream', 69, True, True, 'The Dessert Lab'),
            ('Ice Cream', 'Chocolate Sundae', 'Rich chocolate ice cream with fudge', 99, True, True, 'The Dessert Lab'),
            ('Ice Cream', 'Mango Sorbet', 'Refreshing mango sorbet', 79, True, False, 'The Dessert Lab'),
            # Beverages
            ('Beverages', 'Masala Chai', 'Spiced Indian tea with ginger and cardamom', 40, True, False, 'South Spice'),
            ('Beverages', 'Cold Coffee', 'Chilled coffee with milk and ice cream', 99, True, True, 'The Dessert Lab'),
            ('Beverages', 'Mango Lassi', 'Thick mango yogurt drink', 89, True, True, 'Spice Garden'),
            ('Beverages', 'Fresh Lime Soda', 'Refreshing lime with soda', 59, True, False, 'Wrap & Roll'),
            # Sandwiches
            ('Sandwiches', 'Veg Club Sandwich', 'Triple-decker with fresh veggies & cheese', 129, True, True, 'Wrap & Roll'),
            ('Sandwiches', 'Chicken Sandwich', 'Grilled chicken with mayo & lettuce', 159, False, True, 'Wrap & Roll'),
            ('Sandwiches', 'Paneer Grilled Sandwich', 'Spiced paneer with green chutney', 139, True, False, 'Wrap & Roll'),
            # Rolls
            ('Rolls', 'Paneer Kathi Roll', 'Spiced paneer wrapped in paratha', 129, True, True, 'Wrap & Roll'),
            ('Rolls', 'Chicken Kathi Roll', 'Juicy chicken in a crispy roll', 149, False, True, 'Wrap & Roll'),
            ('Rolls', 'Egg Roll', 'Egg omelette wrapped with veggies', 99, False, False, 'Wrap & Roll'),
            # Seafood
            ('Seafood', 'Fish & Chips', 'Crispy battered fish with fries', 299, False, True, 'Sea Breeze'),
            ('Seafood', 'Prawn Masala', 'Spicy prawn curry with rice', 349, False, False, 'Sea Breeze'),
            ('Seafood', 'Grilled Fish', 'Tandoor-grilled fish with mint chutney', 329, False, False, 'Sea Breeze'),
            # Breakfast
            ('Breakfast', 'Poha', 'Flattened rice with onion and spices', 79, True, False, 'South Spice'),
            ('Breakfast', 'Upma', 'Semolina cooked with veggies', 79, True, False, 'South Spice'),
            ('Breakfast', 'Bread Omelette', 'Fluffy omelette with buttered bread', 89, False, False, 'Wrap & Roll'),
            # Soups
            ('Soups', 'Tomato Soup', 'Creamy tomato soup with croutons', 99, True, True, 'Spice Garden'),
            ('Soups', 'Sweet Corn Soup', 'Chinese-style sweet corn soup', 109, True, True, 'Dragon Wok'),
            ('Soups', 'Hot & Sour Soup', 'Tangy and spicy Chinese soup', 119, False, False, 'Dragon Wok'),
            # Pasta
            ('Pasta', 'Penne Arrabbiata', 'Spicy tomato pasta', 179, True, True, 'Pizza Palace'),
            ('Pasta', 'Chicken Alfredo', 'Creamy white sauce pasta with chicken', 219, False, True, 'Pizza Palace'),
            ('Pasta', 'Veg Pesto Pasta', 'Basil pesto with fresh vegetables', 189, True, False, 'Pizza Palace'),
            # Cakes
            ('Cakes', 'Chocolate Truffle Cake', 'Rich dark chocolate layered cake', 349, True, True, 'The Dessert Lab'),
            ('Cakes', 'Red Velvet Cake', 'Classic red velvet with cream cheese frosting', 329, True, True, 'The Dessert Lab'),
            ('Cakes', 'Black Forest Cake', 'Cherry and cream layered cake', 299, True, False, 'The Dessert Lab'),
        ]

        count = 0
        for cat_name, name, desc, price, is_veg, is_bestseller, rest_name in foods:
            cat, _ = Category.objects.get_or_create(name=cat_name)
            rest = Restaurant.objects.filter(name=rest_name).first()
            if not FoodItem.objects.filter(name=name, restaurant=rest).exists():
                FoodItem.objects.create(
                    name=name, description=desc, price=price, is_veg=is_veg,
                    is_bestseller=is_bestseller, category=cat,
                    restaurant=rest, available=True
                )
                count += 1
        self.stdout.write(f'  OK {count} food items added')

    # ── COUPONS ───────────────────────────────────────
    def seed_coupons(self):
        now = timezone.now()
        coupons = [
            ('WELCOME60', 'percent', 60, 0, 200, now, now + timedelta(days=365)),
            ('SAVE20', 'percent', 20, 199, 100, now, now + timedelta(days=90)),
            ('FLAT50', 'flat', 50, 299, None, now, now + timedelta(days=60)),
            ('LOYAL100', 'flat', 100, 499, None, now, now + timedelta(days=180)),
            ('WEEKEND30', 'percent', 30, 149, 150, now, now + timedelta(days=30)),
            ('NEWUSER', 'percent', 40, 0, 120, now, now + timedelta(days=365)),
        ]
        for code, dtype, val, min_amt, max_disc, vfrom, vto in coupons:
            Coupon.objects.get_or_create(
                code=code,
                defaults=dict(discount_type=dtype, discount_value=val,
                              min_order_amount=min_amt, max_discount=max_disc,
                              valid_from=vfrom, valid_to=vto, is_active=True, usage_limit=1000)
            )
        self.stdout.write(f'  ✓ {len(coupons)} coupons')

    # ── FLASH DEALS ───────────────────────────────────
    def seed_flash_deals(self):
        now = timezone.now()
        deals = [
            ('Margherita Pizza', 40, now, now + timedelta(hours=3)),
            ('Veg Burger', 50, now, now + timedelta(hours=2)),
            ('Hyderabadi Chicken Biryani', 30, now, now + timedelta(hours=4)),
            ('Chocolate Brownie', 35, now, now + timedelta(hours=5)),
            ('Masala Dosa', 25, now, now + timedelta(hours=6)),
        ]
        count = 0
        for food_name, disc, start, end in deals:
            food = FoodItem.objects.filter(name=food_name).first()
            if food:
                _, created = FlashDeal.objects.get_or_create(
                    food_item=food,
                    defaults=dict(discount_percent=disc, starts_at=start, ends_at=end, is_active=True)
                )
                if created:
                    count += 1
        self.stdout.write(f'  ✓ {count} flash deals')

    # ── BADGES ────────────────────────────────────────
    def seed_badges(self):
        badges = [
            ('first_order', '🎉', 'First Order!', 'Placed your very first order', 50),
            ('five_orders', '🔥', 'On Fire!', 'Placed 5 orders', 100),
            ('ten_orders', '👑', 'Food King', 'Placed 10 orders', 200),
            ('reviewer', '⭐', 'Critic', 'Wrote your first review', 30),
            ('referral', '🤝', 'Referral Master', 'Referred a friend', 100),
            ('subscriber', '💎', 'Subscriber', 'Subscribed to a plan', 200),
            ('loyal', '🏆', 'Loyal Customer', 'Been with us for 30 days', 150),
            ('foodie', '🍕', 'Foodie', 'Ordered from 5 different categories', 75),
        ]
        for btype, icon, name, desc, pts in badges:
            Badge.objects.get_or_create(
                badge_type=btype,
                defaults=dict(icon=icon, name=name, description=desc, points_reward=pts)
            )
        self.stdout.write(f'  ✓ {len(badges)} badges')

    # ── GROCERY ───────────────────────────────────────
    def seed_grocery(self):
        cats = [
            ('Fruits & Vegetables', '🥦'),
            ('Dairy & Eggs', '🥛'),
            ('Beverages', '🧃'),
            ('Snacks & Munchies', '🍿'),
            ('Bakery', '🍞'),
            ('Staples', '🌾'),
            ('Personal Care', '🧴'),
        ]
        for name, icon in cats:
            GroceryCategory.objects.get_or_create(name=name, defaults={'icon': icon})

        items = [
            # (category, name, description, price, unit, organic, emoji)
            # Fruits & Vegetables
            ('Fruits & Vegetables', 'Fresh Tomatoes', 'Farm fresh red tomatoes', 29, '500g', False, '🍅'),
            ('Fruits & Vegetables', 'Onions', 'Fresh onions', 25, '1 kg', False, '🧅'),
            ('Fruits & Vegetables', 'Potatoes', 'Fresh potatoes', 35, '1 kg', False, '🥔'),
            ('Fruits & Vegetables', 'Bananas', 'Fresh yellow bananas', 49, '1 dozen', True, '🍌'),
            ('Fruits & Vegetables', 'Apples', 'Crisp red apples', 99, '4 pcs', True, '🍎'),
            ('Fruits & Vegetables', 'Spinach', 'Fresh organic spinach', 29, '250g', True, '🥬'),
            ('Fruits & Vegetables', 'Capsicum', 'Fresh green capsicum', 39, '250g', False, '🫑'),
            ('Fruits & Vegetables', 'Mango', 'Sweet Alphonso mangoes', 149, '4 pcs', True, '🥭'),
            # Dairy & Eggs
            ('Dairy & Eggs', 'Full Cream Milk', 'Fresh pasteurized milk', 62, '1L', False, '🥛'),
            ('Dairy & Eggs', 'Paneer', 'Fresh cottage cheese', 89, '200g', False, '🧀'),
            ('Dairy & Eggs', 'Curd', 'Thick creamy curd', 45, '400g', False, '🥣'),
            ('Dairy & Eggs', 'Eggs', 'Farm fresh eggs', 79, '12 pcs', False, '🥚'),
            ('Dairy & Eggs', 'Butter', 'Amul salted butter', 55, '100g', False, '🧈'),
            ('Dairy & Eggs', 'Cheese Slices', 'Processed cheese slices', 99, '10 slices', False, '🧀'),
            # Beverages
            ('Beverages', 'Coca Cola', 'Chilled Coca Cola', 45, '750ml', False, '🥤'),
            ('Beverages', 'Minute Maid Orange', 'Fresh orange juice', 35, '200ml', False, '🍊'),
            ('Beverages', 'Green Tea', 'Organic green tea bags', 149, '25 bags', True, '🍵'),
            ('Beverages', 'Coconut Water', 'Natural tender coconut water', 55, '200ml', True, '🥥'),
            # Snacks
            ('Snacks & Munchies', 'Lays Classic', 'Salted potato chips', 20, '26g', False, '🥔'),
            ('Snacks & Munchies', 'Biscuits', 'Parle-G glucose biscuits', 10, '100g', False, '🍪'),
            ('Snacks & Munchies', 'Popcorn', 'Butter flavored microwave popcorn', 79, '3 bags', False, '🍿'),
            ('Snacks & Munchies', 'Namkeen Mix', 'Spicy mixed namkeen', 49, '200g', False, '🥜'),
            # Bakery
            ('Bakery', 'Bread', 'Whole wheat sandwich bread', 45, '400g', False, '🍞'),
            ('Bakery', 'Pav', 'Soft dinner rolls', 35, '6 pcs', False, '🥖'),
            ('Bakery', 'Croissant', 'Buttery flaky croissant', 49, '2 pcs', False, '🥐'),
            # Staples
            ('Staples', 'Basmati Rice', 'Premium aged basmati rice', 149, '1 kg', False, '🍚'),
            ('Staples', 'Atta', 'Whole wheat flour', 65, '1 kg', False, '🌾'),
            ('Staples', 'Toor Dal', 'Yellow split pigeon peas', 99, '500g', False, '🫘'),
            ('Staples', 'Mustard Oil', 'Pure mustard oil', 129, '500ml', False, '🫙'),
            ('Staples', 'Sugar', 'Refined white sugar', 55, '1 kg', False, '🍬'),
        ]
        count = 0
        for cat_name, name, desc, price, unit, organic, emoji in items:
            cat = GroceryCategory.objects.filter(name=cat_name).first()
            if cat:
                obj, created = GroceryItem.objects.get_or_create(
                    name=name,
                    defaults=dict(description=desc, price=price, unit=unit,
                                  is_organic=organic, category=cat, available=True,
                                  stock=100, emoji=emoji)
                )
                if not created and obj.emoji == '🛒':
                    obj.emoji = emoji
                    obj.save(update_fields=['emoji'])
                if created:
                    count += 1
        self.stdout.write(f'  ✓ {count} grocery items')

    # ── FOOD VIDEOS ───────────────────────────────────
    def seed_videos(self):
        # Verified working YouTube video IDs — popular Indian food channels
        # Hebbars Kitchen, Kabita's Kitchen, Rajshri Food etc.
        videos = [
            # (restaurant, food_item_name, description, youtube_video_id)
            # All IDs verified valid via YouTube oembed API
            ('Biryani House', 'Hyderabadi Chicken Biryani',
             'Authentic Hyderabadi dum biryani recipe step by step',
             'noiAs97OVfQ'),   # Hebbars Kitchen - Soya Biryani in Pressure Cooker
            ('Spice Garden', 'Paneer Butter Masala',
             'Dhaba style paneer butter masala recipe',
             'Y2e2K7a-TrY'),   # Butter Chicken / Chicken Makhani
            ('Pizza Palace', 'Margherita Pizza',
             'How to make a perfect Margherita Pizza at home',
             '1-SJGQ2HLp8'),   # Gennaro Contaldo - Perfect Pizza
            ('Dragon Wok', 'Veg Fried Rice',
             'Restaurant-style Chinese fried rice',
             'qH__o17xHls'),   # 5 Minutes EASY Egg Fried Rice
            ('Pizza Palace', 'Veg Supreme Pizza',
             'The best homemade pizza you will ever make',
             'sv3TXMSv6Lw'),   # The Best Homemade Pizza You'll Ever Eat
            ('South Spice', 'Masala Dosa',
             'Perfect crispy masala dosa — restaurant style at home',
             'J75VQSxOtdo'),   # Hebbars Kitchen - Crispy Masala Dosa
            ('Spice Garden', 'Paneer Tikka',
             'Smoky tandoor paneer tikka recipe',
             'BKxGodX9NGg'),   # Tandoori Chicken Restaurant style without Oven
            ('Momo Magic', 'Veg Steamed Momos',
             'Soft steamed momos with spicy chutney',
             'ZJy1ajvMU1k'),   # Gordon Ramsay - How To Master 5 Basic Cooking Skills
        ]
        # Delete old invalid videos first
        FoodVideo.objects.all().delete()
        count = 0
        for rest_name, food_name, desc, video_id in videos:
            rest = Restaurant.objects.filter(name=rest_name).first()
            food = FoodItem.objects.filter(name=food_name).first()
            if rest:
                FoodVideo.objects.create(
                    title=f'{food_name} — {rest_name}',
                    restaurant=rest,
                    food_item=food,
                    description=desc,
                    video_url=f'https://www.youtube.com/embed/{video_id}?rel=0&modestbranding=1&autoplay=0',
                    is_active=True
                )
                count += 1
        self.stdout.write(f'  OK {count} food videos updated')

    # ── PUSH CAMPAIGNS ────────────────────────────────
    def seed_campaigns(self):
        admin_user = User.objects.filter(is_superuser=True).first()
        campaigns = [
            ('🍕 Pizza Day Special!', 'Get 40% OFF on all pizzas today. Use code PIZZA40. Valid till midnight!'),
            ('🎉 Weekend Offer', 'Free delivery on orders above ₹299 this weekend. Order now!'),
            ('🔥 Flash Sale Alert', 'Next 2 hours: 50% OFF on Biryani. Limited time only!'),
            ('👑 New on the menu', 'Try our new Tandoori Momos — crispy, smoky, delicious!'),
            ('🎁 Refer & Earn', 'Invite friends and earn ₹100 each. Share your referral code now!'),
        ]
        count = 0
        for title, msg in campaigns:
            _, created = PushCampaign.objects.get_or_create(
                title=title,
                defaults=dict(message=msg, created_by=admin_user, is_sent=False)
            )
            if created:
                count += 1
        self.stdout.write(f'  ✓ {count} push campaigns')

