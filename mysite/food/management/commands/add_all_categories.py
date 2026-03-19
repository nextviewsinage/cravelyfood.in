from django.core.management.base import BaseCommand
from food.models import Category, FoodItem, Restaurant


FOOD_DATA = {
    # ── EXISTING (keep) ──────────────────────────────
    "Pizza": [
        ("Margherita Pizza", "Classic tomato sauce with mozzarella cheese", 199, True, True),
        ("Pepperoni Pizza", "Loaded with spicy pepperoni slices", 299, False, True),
        ("Veg Supreme Pizza", "Bell peppers, olives, mushrooms & corn", 249, True, True),
        ("Paneer Tikka Pizza", "Spicy paneer tikka on pizza base", 269, True, True),
        ("BBQ Chicken Pizza", "Smoky BBQ sauce with grilled chicken", 319, False, True),
        ("Farmhouse Pizza", "Fresh veggies on a crispy thin crust", 229, True, False),
    ],
    "Burgers": [
        ("Classic Burger", "Juicy beef patty with lettuce and tomato", 149, False, True),
        ("Cheese Burger", "Double cheese with crispy patty", 179, False, True),
        ("Veg Burger", "Crispy aloo tikki with fresh veggies", 129, True, False),
        ("Chicken Zinger", "Spicy crispy chicken fillet burger", 199, False, True),
        ("Paneer Burger", "Grilled paneer with mint chutney", 159, True, False),
        ("Double Patty Burger", "Two patties, double the fun", 249, False, True),
    ],
    "Biryani": [
        ("Veg Biryani", "Fragrant basmati rice with mixed vegetables", 199, True, False),
        ("Hyderabadi Biryani", "Authentic dum biryani with tender chicken", 299, False, True),
        ("Mutton Biryani", "Slow-cooked mutton in aromatic spices", 349, False, True),
        ("Egg Biryani", "Fluffy eggs layered with spiced rice", 229, False, False),
    ],
    "Snacks": [
        ("French Fries", "Crispy golden fries with dipping sauce", 99, True, True),
        ("Paneer Tikka", "Grilled paneer cubes with spices", 199, True, True),
        ("Chicken Wings", "Spicy buffalo wings with ranch dip", 249, False, True),
        ("Samosa (2 pcs)", "Crispy pastry filled with spiced potatoes", 49, True, False),
        ("Onion Rings", "Golden crispy onion rings", 89, True, False),
        ("Pav Bhaji", "Spiced mashed veggies with buttered pav", 129, True, True),
    ],
    "General": [
        ("Dal Makhani", "Creamy black lentils slow cooked overnight", 180, True, False),
        ("Paneer Butter Masala", "Soft paneer in rich tomato-butter gravy", 220, True, True),
        ("Chicken Curry", "Tender chicken in aromatic spices", 260, False, False),
        ("Aloo Paratha", "Stuffed whole wheat flatbread with butter", 120, True, False),
        ("Masala Chai", "Spiced Indian tea with ginger and cardamom", 40, True, False),
        ("Rajma Chawal", "Kidney beans curry with steamed rice", 160, True, False),
    ],

    # ── NEW CATEGORIES ───────────────────────────────
    "Sandwiches": [
        ("Veg Club Sandwich", "Triple-decker with fresh veggies & cheese", 129, True, True),
        ("Chicken Sandwich", "Grilled chicken with mayo & lettuce", 159, False, True),
        ("Paneer Grilled Sandwich", "Spiced paneer with green chutney", 139, True, False),
        ("BLT Sandwich", "Bacon, lettuce and tomato classic", 179, False, False),
        ("Egg Mayo Sandwich", "Creamy egg mayo on toasted bread", 99, False, False),
    ],
    "Fast Food": [
        ("Vada Pav", "Mumbai's favourite street burger", 39, True, True),
        ("Pani Puri (6 pcs)", "Crispy puris with tangy tamarind water", 59, True, True),
        ("Bhel Puri", "Puffed rice with chutneys and veggies", 69, True, False),
        ("Sev Puri", "Crispy puris topped with sev and chutney", 79, True, False),
        ("Dahi Puri", "Puris filled with yogurt and chutneys", 89, True, False),
        ("Aloo Tikki Chaat", "Crispy potato patties with chaat masala", 99, True, True),
    ],
    "Street Food": [
        ("Chole Bhature", "Spicy chickpeas with fluffy fried bread", 149, True, True),
        ("Kathi Roll", "Spiced filling wrapped in flaky paratha", 129, False, True),
        ("Dahi Bhalla", "Soft lentil dumplings in creamy yogurt", 99, True, False),
        ("Papdi Chaat", "Crispy papdi with yogurt and chutneys", 89, True, False),
        ("Corn Chaat", "Spiced sweet corn with lemon and masala", 79, True, False),
        ("Golgappa", "Crispy hollow puris with spiced water", 59, True, True),
    ],
    "Rolls & Wraps": [
        ("Paneer Kathi Roll", "Spiced paneer wrapped in soft paratha", 139, True, True),
        ("Chicken Kathi Roll", "Juicy chicken tikka in a flaky wrap", 159, False, True),
        ("Egg Roll", "Egg omelette wrapped with veggies", 119, False, True),
        ("Veg Frankie", "Spiced potato filling in a soft wrap", 109, True, False),
        ("Chicken Frankie", "Chicken tikka with onions in a wrap", 149, False, False),
    ],
    "Chinese": [
        ("Veg Fried Rice", "Wok-tossed rice with fresh vegetables", 149, True, True),
        ("Chicken Fried Rice", "Classic Chinese fried rice with chicken", 179, False, True),
        ("Veg Noodles", "Hakka noodles with stir-fried veggies", 139, True, True),
        ("Chicken Manchurian", "Crispy chicken in tangy Manchurian sauce", 199, False, True),
        ("Veg Manchurian", "Veggie balls in spicy Manchurian gravy", 169, True, False),
        ("Spring Rolls (4 pcs)", "Crispy rolls filled with veggies", 129, True, False),
        ("Chilli Paneer", "Crispy paneer in spicy chilli sauce", 189, True, True),
    ],
    "South Indian": [
        ("Masala Dosa", "Crispy dosa with spiced potato filling", 129, True, True),
        ("Plain Dosa", "Thin crispy rice crepe with sambar", 99, True, True),
        ("Idli (4 pcs)", "Soft steamed rice cakes with sambar", 89, True, True),
        ("Medu Vada (2 pcs)", "Crispy lentil donuts with coconut chutney", 79, True, False),
        ("Uttapam", "Thick rice pancake with toppings", 119, True, False),
        ("Rava Dosa", "Crispy semolina dosa with chutney", 139, True, False),
        ("Sambar Rice", "Comforting lentil soup with steamed rice", 149, True, False),
    ],
    "North Indian": [
        ("Butter Chicken", "Tender chicken in creamy tomato gravy", 299, False, True),
        ("Dal Tadka", "Yellow lentils tempered with spices", 169, True, True),
        ("Palak Paneer", "Cottage cheese in smooth spinach gravy", 229, True, True),
        ("Shahi Paneer", "Paneer in rich cashew-cream gravy", 249, True, False),
        ("Naan (2 pcs)", "Soft leavened bread from tandoor", 59, True, True),
        ("Tandoori Roti (2 pcs)", "Whole wheat bread from clay oven", 49, True, True),
        ("Jeera Rice", "Fragrant cumin-flavoured basmati rice", 129, True, False),
    ],
    "Punjabi": [
        ("Sarson Ka Saag", "Mustard greens with makki roti", 199, True, False),
        ("Makki Ki Roti", "Cornmeal flatbread with white butter", 49, True, False),
        ("Amritsari Kulcha", "Stuffed bread with chole", 149, True, True),
        ("Lassi (Sweet)", "Thick creamy yogurt drink", 79, True, True),
        ("Lassi (Salted)", "Refreshing salted yogurt drink", 69, True, False),
        ("Punjabi Thali", "Complete meal with dal, sabzi, roti & rice", 299, True, True),
    ],
    "Gujarati": [
        ("Dhokla", "Steamed fermented chickpea cake", 89, True, True),
        ("Khandvi", "Rolled gram flour snack with coconut", 99, True, False),
        ("Thepla", "Spiced fenugreek flatbread", 79, True, True),
        ("Undhiyu", "Mixed winter vegetables Gujarati style", 199, True, False),
        ("Gujarati Thali", "Full thali with dal, kadhi, sabzi & roti", 279, True, True),
        ("Fafda Jalebi", "Crispy gram flour snack with sweet jalebi", 89, True, True),
    ],
    "Thali": [
        ("Veg Thali", "Dal, 2 sabzi, rice, roti, salad & papad", 249, True, True),
        ("Non-Veg Thali", "Chicken curry, dal, rice, roti & salad", 329, False, True),
        ("Rajasthani Thali", "Dal baati churma with traditional sides", 299, True, False),
        ("South Indian Thali", "Sambar, rasam, rice, papad & pickle", 229, True, False),
        ("Mini Thali", "Dal, 1 sabzi, rice & 2 rotis", 179, True, False),
    ],

    # ── NON-VEG SPECIAL ──────────────────────────────
    "Chicken Items": [
        ("Chicken Tikka", "Marinated chicken grilled in tandoor", 279, False, True),
        ("Chicken 65", "Spicy deep-fried chicken from South India", 249, False, True),
        ("Butter Chicken Gravy", "Creamy tomato-based chicken curry", 299, False, True),
        ("Chicken Keema", "Minced chicken cooked with spices", 269, False, False),
        ("Chicken Lollipop (6 pcs)", "Crispy chicken lollipops with dip", 299, False, True),
        ("Chicken Biryani", "Aromatic basmati rice with chicken", 299, False, True),
    ],
    "Mutton Dishes": [
        ("Mutton Rogan Josh", "Kashmiri mutton in aromatic gravy", 399, False, False),
        ("Mutton Keema", "Spiced minced mutton with peas", 349, False, False),
        ("Mutton Biryani", "Slow-cooked mutton dum biryani", 349, False, True),
        ("Mutton Curry", "Tender mutton in thick spiced gravy", 379, False, False),
        ("Mutton Seekh Kebab", "Minced mutton kebabs from tandoor", 329, False, True),
    ],
    "Fish & Seafood": [
        ("Fish Fry", "Crispy spiced fish fillet", 299, False, True),
        ("Prawn Masala", "Juicy prawns in spicy masala gravy", 349, False, False),
        ("Fish Curry", "Coastal style fish in coconut gravy", 319, False, False),
        ("Prawn Biryani", "Fragrant rice with spiced prawns", 369, False, False),
        ("Grilled Fish", "Herb-marinated grilled fish fillet", 329, False, False),
    ],
    "Tandoori Items": [
        ("Tandoori Chicken (Half)", "Classic clay oven roasted chicken", 299, False, True),
        ("Tandoori Paneer", "Marinated paneer grilled in tandoor", 249, True, True),
        ("Tandoori Fish", "Spiced fish fillet from tandoor", 319, False, False),
        ("Tandoori Prawns", "Juicy prawns marinated and grilled", 349, False, False),
        ("Mixed Grill Platter", "Assorted tandoori items on one plate", 499, False, True),
    ],
    "Kebabs": [
        ("Seekh Kebab (4 pcs)", "Minced meat kebabs with mint chutney", 279, False, True),
        ("Galouti Kebab", "Melt-in-mouth Lucknowi kebabs", 299, False, False),
        ("Hara Bhara Kebab", "Spinach and pea vegetarian kebabs", 199, True, True),
        ("Shammi Kebab", "Soft minced meat patties", 259, False, False),
        ("Dahi Ke Kebab", "Creamy yogurt-based soft kebabs", 219, True, False),
    ],

    # ── VEG / HEALTHY ────────────────────────────────
    "Pure Veg": [
        ("Aloo Gobi", "Potato and cauliflower dry sabzi", 149, True, False),
        ("Baingan Bharta", "Smoky roasted eggplant mash", 159, True, False),
        ("Mix Veg Curry", "Seasonal vegetables in spiced gravy", 169, True, True),
        ("Kadai Paneer", "Paneer cooked in kadai with peppers", 239, True, True),
        ("Chana Masala", "Spiced chickpea curry", 169, True, True),
    ],
    "Jain Food": [
        ("Jain Pizza", "No onion-garlic pizza with veggies", 229, True, False),
        ("Jain Biryani", "Fragrant rice without onion-garlic", 199, True, False),
        ("Jain Thali", "Complete Jain meal without root veggies", 249, True, False),
        ("Jain Burger", "No onion-garlic veg burger", 139, True, False),
        ("Jain Dal", "Lentils cooked without onion and garlic", 149, True, False),
    ],
    "Salads": [
        ("Greek Salad", "Fresh veggies with feta cheese and olives", 179, True, True),
        ("Caesar Salad", "Romaine lettuce with Caesar dressing", 199, True, True),
        ("Fruit Salad", "Fresh seasonal fruits with honey dressing", 149, True, True),
        ("Sprouts Salad", "Protein-rich mixed sprouts with lemon", 129, True, False),
        ("Pasta Salad", "Cold pasta with veggies and Italian dressing", 169, True, False),
    ],
    "Healthy Meals": [
        ("Quinoa Bowl", "Quinoa with roasted veggies and tahini", 249, True, False),
        ("Grilled Chicken Bowl", "Lean grilled chicken with brown rice", 299, False, False),
        ("Avocado Toast", "Smashed avocado on multigrain toast", 199, True, False),
        ("Oats Porridge", "Creamy oats with nuts and honey", 129, True, False),
        ("Protein Smoothie Bowl", "Thick smoothie with granola and fruits", 219, True, False),
    ],
    "Diet Food": [
        ("Low-Cal Salad", "Mixed greens under 200 calories", 149, True, False),
        ("Steamed Veggies", "Lightly seasoned steamed vegetables", 129, True, False),
        ("Grilled Paneer Salad", "High-protein paneer with greens", 199, True, False),
        ("Egg White Omelette", "3 egg whites with spinach", 149, False, False),
        ("Brown Rice Bowl", "Brown rice with dal and sabzi", 179, True, False),
    ],

    # ── DESSERTS & BEVERAGES ─────────────────────────
    "Cakes": [
        ("Chocolate Truffle Cake", "Rich dark chocolate layered cake", 349, True, True),
        ("Red Velvet Cake", "Classic red velvet with cream cheese frosting", 329, True, True),
        ("Black Forest Cake", "Cherry and cream layered cake", 299, True, True),
        ("Butterscotch Cake", "Caramel butterscotch flavoured cake", 279, True, False),
        ("Pineapple Cake", "Fresh pineapple with whipped cream", 259, True, False),
    ],
    "Ice Cream": [
        ("Vanilla Scoop", "Classic creamy vanilla ice cream", 79, True, True),
        ("Chocolate Scoop", "Rich dark chocolate ice cream", 89, True, True),
        ("Mango Kulfi", "Traditional Indian mango kulfi", 99, True, True),
        ("Strawberry Sundae", "Strawberry ice cream with toppings", 129, True, True),
        ("Brownie with Ice Cream", "Warm brownie with vanilla scoop", 179, True, True),
    ],
    "Sweets": [
        ("Gulab Jamun (4 pcs)", "Soft milk dumplings in sugar syrup", 89, True, True),
        ("Rasgulla (4 pcs)", "Spongy cottage cheese balls in syrup", 99, True, True),
        ("Jalebi (100g)", "Crispy spiral sweets in sugar syrup", 79, True, True),
        ("Kheer", "Creamy rice pudding with cardamom", 99, True, False),
        ("Halwa", "Semolina pudding with ghee and nuts", 89, True, False),
        ("Ladoo (2 pcs)", "Traditional besan or motichoor ladoo", 69, True, True),
    ],
    "Shakes": [
        ("Chocolate Shake", "Thick creamy chocolate milkshake", 149, True, True),
        ("Strawberry Shake", "Fresh strawberry blended milkshake", 149, True, True),
        ("Mango Shake", "Thick Alphonso mango milkshake", 159, True, True),
        ("Oreo Shake", "Crushed Oreo blended with ice cream", 169, True, False),
        ("Banana Shake", "Creamy banana milkshake with honey", 139, True, False),
        ("Dry Fruit Shake", "Rich shake with almonds and cashews", 199, True, False),
    ],
    "Coffee": [
        ("Espresso", "Strong single shot of espresso", 99, True, True),
        ("Cappuccino", "Espresso with steamed milk foam", 129, True, True),
        ("Latte", "Smooth espresso with steamed milk", 139, True, True),
        ("Cold Coffee", "Chilled blended coffee with ice cream", 149, True, True),
        ("Mocha", "Espresso with chocolate and steamed milk", 149, True, False),
        ("Americano", "Espresso diluted with hot water", 109, True, False),
    ],
    "Tea": [
        ("Masala Chai", "Spiced Indian tea with ginger & cardamom", 40, True, True),
        ("Ginger Tea", "Strong tea with fresh ginger", 35, True, True),
        ("Green Tea", "Light and healthy green tea", 59, True, True),
        ("Lemon Tea", "Refreshing tea with lemon and honey", 49, True, False),
        ("Kashmiri Kahwa", "Saffron and spice infused green tea", 89, True, False),
        ("Tulsi Tea", "Holy basil herbal tea", 49, True, False),
    ],
    "Juices": [
        ("Fresh Orange Juice", "Freshly squeezed orange juice", 99, True, True),
        ("Watermelon Juice", "Chilled fresh watermelon juice", 89, True, True),
        ("Mixed Fruit Juice", "Blend of seasonal fresh fruits", 109, True, True),
        ("Sugarcane Juice", "Fresh pressed sugarcane with lemon", 59, True, True),
        ("Pomegranate Juice", "Fresh pomegranate juice", 129, True, False),
        ("Carrot Beetroot Juice", "Healthy detox juice blend", 99, True, False),
    ],
    "Cold Drinks": [
        ("Coca-Cola (300ml)", "Classic chilled Coca-Cola", 49, True, True),
        ("Pepsi (300ml)", "Chilled Pepsi cola", 49, True, True),
        ("Sprite (300ml)", "Refreshing lemon-lime soda", 49, True, True),
        ("Limca (300ml)", "Lemon and lime flavoured drink", 49, True, False),
        ("Thumbs Up (300ml)", "Strong cola flavour", 49, True, False),
        ("Aam Panna", "Raw mango summer cooler", 69, True, True),
        ("Jaljeera", "Spiced cumin water drink", 49, True, False),
    ],

    # ── BREAKFAST ────────────────────────────────────
    "Indian Breakfast": [
        ("Poha", "Flattened rice with mustard seeds and veggies", 79, True, True),
        ("Upma", "Semolina cooked with veggies and spices", 89, True, True),
        ("Idli Sambar (4 pcs)", "Soft steamed rice cakes with sambar", 89, True, True),
        ("Masala Dosa", "Crispy dosa with potato filling", 129, True, True),
        ("Vada Pav", "Mumbai's iconic street burger", 39, True, True),
        ("Thepla", "Spiced fenugreek flatbread", 79, True, True),
        ("Aloo Paratha", "Stuffed potato flatbread with butter", 99, True, True),
        ("Chole Bhature", "Spicy chickpeas with fried bread", 149, True, True),
        ("Puri Bhaji", "Fried bread with spiced potato curry", 99, True, False),
        ("Misal Pav", "Spicy sprouted lentils with pav", 109, True, True),
    ],
    "Light Breakfast": [
        ("Bread Butter Toast", "Toasted bread with butter and jam", 59, True, True),
        ("Veg Sandwich", "Fresh veggies in toasted bread", 89, True, True),
        ("Egg Omelette", "2-egg omelette with veggies", 99, False, True),
        ("Boiled Eggs (2 pcs)", "Perfectly boiled eggs with salt", 59, False, True),
        ("Cheese Toast", "Grilled bread with melted cheese", 89, True, False),
        ("Peanut Butter Toast", "Multigrain toast with peanut butter", 79, True, False),
    ],
    "Western Breakfast": [
        ("Pancakes (3 pcs)", "Fluffy pancakes with maple syrup", 149, True, True),
        ("Waffles", "Crispy waffles with butter and syrup", 169, True, True),
        ("Cornflakes with Milk", "Crunchy cornflakes with cold milk", 99, True, False),
        ("Oats Porridge", "Creamy oats with fruits and honey", 119, True, True),
        ("French Toast", "Egg-dipped bread fried golden", 129, False, True),
        ("Muesli Bowl", "Muesli with yogurt and fresh fruits", 149, True, False),
        ("Eggs Benedict", "Poached eggs on English muffin", 199, False, False),
    ],
    "Breakfast Drinks": [
        ("Hot Tea", "Classic Indian chai", 35, True, True),
        ("Hot Coffee", "Freshly brewed hot coffee", 59, True, True),
        ("Cold Milk", "Chilled full-fat milk", 49, True, True),
        ("Badam Milk", "Warm milk with almonds and saffron", 89, True, True),
        ("Fresh Orange Juice (Breakfast)", "Freshly squeezed morning OJ", 99, True, True),
        ("Banana Smoothie", "Banana blended with milk and honey", 119, True, False),
    ],
}


class Command(BaseCommand):
    help = 'Add all food categories and items to the database'

    def handle(self, *args, **kwargs):
        # Get or create a default restaurant
        restaurant, _ = Restaurant.objects.get_or_create(
            name="FoodDelivery Kitchen",
            defaults={
                'description': 'Our central kitchen serving all categories',
                'address': 'Ahmedabad, Gujarat',
                'city': 'Ahmedabad',
                'cuisine': 'Multi-Cuisine',
                'delivery_time': '25-35 min',
                'min_order': 99,
                'is_active': True,
            }
        )

        total_cats = 0
        total_foods = 0

        for cat_name, items in FOOD_DATA.items():
            cat, cat_created = Category.objects.get_or_create(name=cat_name)
            if cat_created:
                total_cats += 1
                self.stdout.write(f'  ✅ Category created: {cat_name}')
            else:
                self.stdout.write(f'  ✔  Category exists: {cat_name}')

            for (name, desc, price, is_veg, is_bestseller) in items:
                food, food_created = FoodItem.objects.get_or_create(
                    name=name,
                    category=cat,
                    defaults={
                        'description': desc,
                        'price': price,
                        'is_veg': is_veg,
                        'is_bestseller': is_bestseller,
                        'available': True,
                        'restaurant': restaurant,
                    }
                )
                if food_created:
                    total_foods += 1

        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Done! Added {total_cats} new categories, {total_foods} new food items.'
        ))
        self.stdout.write(f'   Total categories: {Category.objects.count()}')
        self.stdout.write(f'   Total food items: {FoodItem.objects.count()}')
