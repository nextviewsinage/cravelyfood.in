"""
Built-in Indian food nutrition database.
Values per standard serving (approximate).
Format: name_keyword -> { calories, protein, carbs, fat, fiber, serving }
"""

NUTRITION_DB = {
    # ── Rice / Biryani ────────────────────────────────
    'biryani':          {'calories': 290, 'protein': 7,  'carbs': 45, 'fat': 9,  'fiber': 2, 'serving': '1 plate (250g)'},
    'veg biryani':      {'calories': 250, 'protein': 6,  'carbs': 48, 'fat': 6,  'fiber': 3, 'serving': '1 plate (250g)'},
    'fried rice':       {'calories': 220, 'protein': 5,  'carbs': 40, 'fat': 6,  'fiber': 2, 'serving': '1 plate (200g)'},
    'pulao':            {'calories': 200, 'protein': 4,  'carbs': 38, 'fat': 5,  'fiber': 2, 'serving': '1 plate (200g)'},
    # ── Bread / Roti ─────────────────────────────────
    'roti':             {'calories': 80,  'protein': 3,  'carbs': 15, 'fat': 1,  'fiber': 2, 'serving': '1 piece (40g)'},
    'naan':             {'calories': 260, 'protein': 8,  'carbs': 45, 'fat': 5,  'fiber': 2, 'serving': '1 piece (90g)'},
    'paratha':          {'calories': 200, 'protein': 4,  'carbs': 28, 'fat': 8,  'fiber': 3, 'serving': '1 piece (80g)'},
    # ── Paneer ───────────────────────────────────────
    'paneer butter masala': {'calories': 320, 'protein': 14, 'carbs': 12, 'fat': 24, 'fiber': 2, 'serving': '1 bowl (200g)'},
    'paneer tikka':     {'calories': 260, 'protein': 18, 'carbs': 8,  'fat': 18, 'fiber': 1, 'serving': '6 pieces (150g)'},
    'paneer':           {'calories': 280, 'protein': 15, 'carbs': 10, 'fat': 20, 'fiber': 1, 'serving': '1 bowl (180g)'},
    'shahi paneer':     {'calories': 350, 'protein': 14, 'carbs': 14, 'fat': 28, 'fiber': 1, 'serving': '1 bowl (200g)'},
    'matar paneer':     {'calories': 240, 'protein': 12, 'carbs': 18, 'fat': 14, 'fiber': 4, 'serving': '1 bowl (200g)'},
    # ── Pizza ────────────────────────────────────────
    'margherita pizza': {'calories': 270, 'protein': 11, 'carbs': 33, 'fat': 10, 'fiber': 2, 'serving': '2 slices (150g)'},
    'veg supreme pizza':{'calories': 290, 'protein': 12, 'carbs': 35, 'fat': 11, 'fiber': 3, 'serving': '2 slices (160g)'},
    'pizza':            {'calories': 280, 'protein': 11, 'carbs': 34, 'fat': 10, 'fiber': 2, 'serving': '2 slices (150g)'},
    # ── Burger ───────────────────────────────────────
    'veg burger':       {'calories': 310, 'protein': 9,  'carbs': 42, 'fat': 12, 'fiber': 3, 'serving': '1 burger (180g)'},
    'burger':           {'calories': 320, 'protein': 10, 'carbs': 40, 'fat': 13, 'fiber': 2, 'serving': '1 burger (180g)'},
    # ── South Indian ─────────────────────────────────
    'masala dosa':      {'calories': 210, 'protein': 5,  'carbs': 38, 'fat': 5,  'fiber': 3, 'serving': '1 dosa (150g)'},
    'plain dosa':       {'calories': 160, 'protein': 4,  'carbs': 30, 'fat': 3,  'fiber': 2, 'serving': '1 dosa (120g)'},
    'dosa':             {'calories': 180, 'protein': 4,  'carbs': 33, 'fat': 4,  'fiber': 2, 'serving': '1 dosa (130g)'},
    'idli':             {'calories': 58,  'protein': 2,  'carbs': 12, 'fat': 0,  'fiber': 1, 'serving': '2 pieces (80g)'},
    'idli sambar':      {'calories': 130, 'protein': 5,  'carbs': 24, 'fat': 2,  'fiber': 3, 'serving': '2 idli + sambar'},
    'vada':             {'calories': 180, 'protein': 5,  'carbs': 22, 'fat': 8,  'fiber': 2, 'serving': '2 pieces (80g)'},
    'uttapam':          {'calories': 200, 'protein': 5,  'carbs': 35, 'fat': 5,  'fiber': 3, 'serving': '1 piece (150g)'},
    'upma':             {'calories': 170, 'protein': 4,  'carbs': 28, 'fat': 5,  'fiber': 2, 'serving': '1 bowl (150g)'},
    'pongal':           {'calories': 190, 'protein': 5,  'carbs': 32, 'fat': 6,  'fiber': 2, 'serving': '1 bowl (180g)'},
    # ── Momos ────────────────────────────────────────
    'momos':            {'calories': 150, 'protein': 6,  'carbs': 24, 'fat': 4,  'fiber': 2, 'serving': '6 pieces (120g)'},
    'veg steamed momos':{'calories': 130, 'protein': 5,  'carbs': 22, 'fat': 3,  'fiber': 2, 'serving': '6 pieces (120g)'},
    'fried momos':      {'calories': 220, 'protein': 6,  'carbs': 26, 'fat': 10, 'fiber': 2, 'serving': '6 pieces (130g)'},
    # ── Chinese ──────────────────────────────────────
    'noodles':          {'calories': 200, 'protein': 5,  'carbs': 38, 'fat': 4,  'fiber': 2, 'serving': '1 plate (200g)'},
    'hakka noodles':    {'calories': 210, 'protein': 5,  'carbs': 40, 'fat': 5,  'fiber': 2, 'serving': '1 plate (200g)'},
    'spring rolls':     {'calories': 180, 'protein': 4,  'carbs': 24, 'fat': 8,  'fiber': 2, 'serving': '3 pieces (120g)'},
    'manchurian':       {'calories': 190, 'protein': 5,  'carbs': 22, 'fat': 9,  'fiber': 2, 'serving': '1 bowl (150g)'},
    # ── Snacks ───────────────────────────────────────
    'samosa':           {'calories': 130, 'protein': 3,  'carbs': 18, 'fat': 6,  'fiber': 2, 'serving': '2 pieces (80g)'},
    'pav bhaji':        {'calories': 350, 'protein': 8,  'carbs': 52, 'fat': 12, 'fiber': 5, 'serving': '2 pav + bhaji'},
    'bhel puri':        {'calories': 180, 'protein': 4,  'carbs': 32, 'fat': 5,  'fiber': 3, 'serving': '1 plate (150g)'},
    'french fries':     {'calories': 310, 'protein': 4,  'carbs': 40, 'fat': 15, 'fiber': 3, 'serving': '1 medium (150g)'},
    'fries':            {'calories': 310, 'protein': 4,  'carbs': 40, 'fat': 15, 'fiber': 3, 'serving': '1 medium (150g)'},
    'poha':             {'calories': 160, 'protein': 3,  'carbs': 30, 'fat': 4,  'fiber': 2, 'serving': '1 bowl (150g)'},
    # ── Dal / Curry ───────────────────────────────────
    'dal makhani':      {'calories': 220, 'protein': 10, 'carbs': 28, 'fat': 8,  'fiber': 6, 'serving': '1 bowl (200g)'},
    'dal':              {'calories': 180, 'protein': 9,  'carbs': 26, 'fat': 5,  'fiber': 5, 'serving': '1 bowl (200g)'},
    'thali':            {'calories': 650, 'protein': 20, 'carbs': 90, 'fat': 20, 'fiber': 8, 'serving': '1 full thali'},
    # ── Sandwich / Roll ───────────────────────────────
    'sandwich':         {'calories': 250, 'protein': 8,  'carbs': 35, 'fat': 9,  'fiber': 3, 'serving': '1 sandwich (150g)'},
    'kathi roll':       {'calories': 280, 'protein': 9,  'carbs': 38, 'fat': 10, 'fiber': 3, 'serving': '1 roll (160g)'},
    'roll':             {'calories': 270, 'protein': 8,  'carbs': 36, 'fat': 10, 'fiber': 3, 'serving': '1 roll (150g)'},
    # ── Soup ─────────────────────────────────────────
    'tomato soup':      {'calories': 80,  'protein': 2,  'carbs': 12, 'fat': 3,  'fiber': 2, 'serving': '1 bowl (250ml)'},
    'sweet corn soup':  {'calories': 100, 'protein': 3,  'carbs': 18, 'fat': 2,  'fiber': 2, 'serving': '1 bowl (250ml)'},
    'soup':             {'calories': 90,  'protein': 3,  'carbs': 14, 'fat': 2,  'fiber': 2, 'serving': '1 bowl (250ml)'},
    # ── Pasta ────────────────────────────────────────
    'pasta':            {'calories': 280, 'protein': 9,  'carbs': 45, 'fat': 8,  'fiber': 3, 'serving': '1 plate (200g)'},
    'penne':            {'calories': 270, 'protein': 9,  'carbs': 44, 'fat': 7,  'fiber': 3, 'serving': '1 plate (200g)'},
    # ── Desserts ─────────────────────────────────────
    'gulab jamun':      {'calories': 150, 'protein': 3,  'carbs': 28, 'fat': 4,  'fiber': 0, 'serving': '2 pieces (80g)'},
    'rasmalai':         {'calories': 160, 'protein': 5,  'carbs': 22, 'fat': 6,  'fiber': 0, 'serving': '2 pieces (100g)'},
    'chocolate brownie':{'calories': 380, 'protein': 5,  'carbs': 48, 'fat': 20, 'fiber': 2, 'serving': '1 piece (80g)'},
    'brownie':          {'calories': 380, 'protein': 5,  'carbs': 48, 'fat': 20, 'fiber': 2, 'serving': '1 piece (80g)'},
    'cake':             {'calories': 350, 'protein': 5,  'carbs': 50, 'fat': 15, 'fiber': 1, 'serving': '1 slice (100g)'},
    'ice cream':        {'calories': 200, 'protein': 4,  'carbs': 28, 'fat': 9,  'fiber': 0, 'serving': '2 scoops (100g)'},
    'kulfi':            {'calories': 180, 'protein': 4,  'carbs': 24, 'fat': 8,  'fiber': 0, 'serving': '1 stick (80g)'},
    # ── Drinks ───────────────────────────────────────
    'masala chai':      {'calories': 60,  'protein': 2,  'carbs': 10, 'fat': 2,  'fiber': 0, 'serving': '1 cup (150ml)'},
    'chai':             {'calories': 60,  'protein': 2,  'carbs': 10, 'fat': 2,  'fiber': 0, 'serving': '1 cup (150ml)'},
    'cold coffee':      {'calories': 150, 'protein': 4,  'carbs': 22, 'fat': 5,  'fiber': 0, 'serving': '1 glass (250ml)'},
    'coffee':           {'calories': 80,  'protein': 2,  'carbs': 12, 'fat': 3,  'fiber': 0, 'serving': '1 cup (200ml)'},
    'mango lassi':      {'calories': 180, 'protein': 5,  'carbs': 32, 'fat': 4,  'fiber': 1, 'serving': '1 glass (250ml)'},
    'lassi':            {'calories': 160, 'protein': 5,  'carbs': 28, 'fat': 4,  'fiber': 0, 'serving': '1 glass (250ml)'},
    'fresh lime soda':  {'calories': 40,  'protein': 0,  'carbs': 10, 'fat': 0,  'fiber': 0, 'serving': '1 glass (300ml)'},
}


def get_nutrition(food_name: str) -> dict | None:
    """
    Match food name to nutrition data.
    Returns nutrition dict or None if not found.
    """
    name = food_name.lower().strip()

    # Exact match first
    if name in NUTRITION_DB:
        return {'name': food_name, **NUTRITION_DB[name]}

    # Longest keyword match
    best_key = None
    best_len = 0
    for key in NUTRITION_DB:
        if key in name and len(key) > best_len:
            best_key = key
            best_len = len(key)

    if best_key:
        return {'name': food_name, **NUTRITION_DB[best_key]}

    return None


def get_diet_tags(nutrition: dict) -> list:
    """Return diet recommendation tags based on nutrition values."""
    tags = []
    cal = nutrition['calories']
    prot = nutrition['protein']
    fat = nutrition['fat']
    fiber = nutrition['fiber']

    if cal < 150:
        tags.append({'label': '✅ Low Calorie', 'color': '#2e7d32', 'bg': '#e8f5e9'})
    elif cal > 400:
        tags.append({'label': '⚠️ High Calorie', 'color': '#b71c1c', 'bg': '#fdecea'})

    if prot >= 12:
        tags.append({'label': '💪 High Protein', 'color': '#1565c0', 'bg': '#e3f2fd'})
    elif prot >= 7:
        tags.append({'label': '🥩 Good Protein', 'color': '#0277bd', 'bg': '#e1f5fe'})

    if fat < 5:
        tags.append({'label': '🥗 Low Fat', 'color': '#2e7d32', 'bg': '#e8f5e9'})
    elif fat > 20:
        tags.append({'label': '🧈 High Fat', 'color': '#e65100', 'bg': '#fff3e0'})

    if fiber >= 4:
        tags.append({'label': '🌾 High Fiber', 'color': '#4a148c', 'bg': '#f3e5f5'})

    if cal < 200 and prot >= 5:
        tags.append({'label': '🏋️ Gym Friendly', 'color': '#1b5e20', 'bg': '#f1f8e9'})

    if cal < 100:
        tags.append({'label': '🥦 Diet Food', 'color': '#00695c', 'bg': '#e0f2f1'})

    return tags
