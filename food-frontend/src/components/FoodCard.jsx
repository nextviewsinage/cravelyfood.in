import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import WishlistButton from './WishlistButton';

const BACKEND = 'http://127.0.0.1:8000';

// ── Category-level fallback images ──────────────────────────────────────────
const CAT_IMAGES = {
  'Pizza':             'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop',
  'Burgers':           'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=250&fit=crop',
  'Biryani':           'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=250&fit=crop',
  'Sandwiches':        'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=250&fit=crop',
  'Fast Food':         'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=250&fit=crop',
  'Street Food':       'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'Snacks':            'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&h=250&fit=crop',
  'Rolls & Wraps':     'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=250&fit=crop',
  'Chinese':           'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=250&fit=crop',
  'South Indian':      'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=250&fit=crop',
  'North Indian':      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=250&fit=crop',
  'Punjabi':           'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=250&fit=crop',
  'Gujarati':          'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&h=250&fit=crop',
  'Thali':             'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=250&fit=crop',
  'General':           'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop',
  // Non-Veg
  'Chicken Items':     'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400&h=250&fit=crop',
  'Mutton Dishes':     'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&h=250&fit=crop',
  'Fish & Seafood':    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=250&fit=crop',
  'Tandoori Items':    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=250&fit=crop',
  'Kebabs':            'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=250&fit=crop',
  // Veg / Healthy
  'Pure Veg':          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop',
  'Jain Food':         'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=250&fit=crop',
  'Salads':            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop',
  'Healthy Meals':     'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop',
  'Diet Food':         'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=250&fit=crop',
  // Desserts
  'Cakes':             'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop',
  'Ice Cream':         'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=250&fit=crop',
  'Sweets':            'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=250&fit=crop',
  // Drinks
  'Shakes':            'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=250&fit=crop',
  'Coffee':            'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=250&fit=crop',
  'Tea':               'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=250&fit=crop',
  'Juices':            'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=250&fit=crop',
  'Cold Drinks':       'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=250&fit=crop',
  // Breakfast
  'Indian Breakfast':  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=250&fit=crop',
  'Light Breakfast':   'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=250&fit=crop',
  'Western Breakfast': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop',
  'Breakfast Drinks':  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=250&fit=crop',
};

// ── Per-item name keyword → specific image ───────────────────────────────────
const ITEM_IMAGES = {
  // Pizza
  'margherita':     'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=250&fit=crop',
  'pepperoni':      'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=250&fit=crop',
  'farmhouse':      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop',
  // Burgers
  'cheese burger':  'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&h=250&fit=crop',
  'veg burger':     'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&h=250&fit=crop',
  'zinger':         'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=250&fit=crop',
  // Biryani
  'biryani':        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=250&fit=crop',
  'hyderabadi':     'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=250&fit=crop',
  // Indian
  'butter chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=250&fit=crop',
  'paneer':         'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=250&fit=crop',
  'dal':            'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=250&fit=crop',
  'naan':           'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'roti':           'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=250&fit=crop',
  'paratha':        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=250&fit=crop',
  'chole':          'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=250&fit=crop',
  'rajma':          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=250&fit=crop',
  // South Indian
  'dosa':           'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=250&fit=crop',
  'idli':           'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=250&fit=crop',
  'vada':           'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=250&fit=crop',
  'uttapam':        'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=250&fit=crop',
  'sambar':         'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=250&fit=crop',
  // Chinese
  'fried rice':     'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=250&fit=crop',
  'noodles':        'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=250&fit=crop',
  'manchurian':     'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=250&fit=crop',
  'spring roll':    'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=400&h=250&fit=crop',
  'chilli paneer':  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=250&fit=crop',
  // Snacks / Street
  'samosa':         'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'pav bhaji':      'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=250&fit=crop',
  'vada pav':       'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=250&fit=crop',
  'pani puri':      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'bhel':           'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'chaat':          'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=250&fit=crop',
  'fries':          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=250&fit=crop',
  // Non-Veg
  'chicken tikka':  'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=250&fit=crop',
  'chicken 65':     'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400&h=250&fit=crop',
  'tandoori':       'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=250&fit=crop',
  'kebab':          'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=250&fit=crop',
  'seekh':          'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=250&fit=crop',
  'fish':           'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=250&fit=crop',
  'prawn':          'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=250&fit=crop',
  'mutton':         'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&h=250&fit=crop',
  // Breakfast
  'poha':           'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=250&fit=crop',
  'upma':           'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&h=250&fit=crop',
  'omelette':       'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&h=250&fit=crop',
  'egg':            'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&h=250&fit=crop',
  'pancake':        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=250&fit=crop',
  'waffle':         'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&h=250&fit=crop',
  'toast':          'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=250&fit=crop',
  'oats':           'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=250&fit=crop',
  'cornflake':      'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=250&fit=crop',
  // Desserts
  'cake':           'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop',
  'ice cream':      'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=250&fit=crop',
  'kulfi':          'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=250&fit=crop',
  'gulab jamun':    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=250&fit=crop',
  'jalebi':         'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=250&fit=crop',
  'halwa':          'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=250&fit=crop',
  'kheer':          'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=250&fit=crop',
  'brownie':        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=250&fit=crop',
  // Drinks
  'coffee':         'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=250&fit=crop',
  'chai':           'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=250&fit=crop',
  'tea':            'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=250&fit=crop',
  'lassi':          'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=250&fit=crop',
  'shake':          'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=250&fit=crop',
  'juice':          'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=250&fit=crop',
  'smoothie':       'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=250&fit=crop',
  'milk':           'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=250&fit=crop',
  'cola':           'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=250&fit=crop',
  'cold drink':     'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=250&fit=crop',
  // Salads / Healthy
  'salad':          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop',
  'quinoa':         'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop',
  'avocado':        'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&h=250&fit=crop',
  // Thali
  'thali':          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=250&fit=crop',
};

/** Returns the best image URL for a food item */
function getFoodImage(food) {
  // 1. Use uploaded image from backend
  if (food.image) {
    return food.image.startsWith('http') ? food.image : `${BACKEND}${food.image}`;
  }
  // 2. Match by food name keywords
  const nameLower = (food.name || '').toLowerCase();
  for (const [keyword, url] of Object.entries(ITEM_IMAGES)) {
    if (nameLower.includes(keyword)) return url;
  }
  // 3. Match by category
  if (food.category_name && CAT_IMAGES[food.category_name]) {
    return CAT_IMAGES[food.category_name];
  }
  // 4. Generic fallback
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop';
}

export default function FoodCard({ food = {} }) {
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();

  const imageSrc = getFoodImage(food);
  const fallbackSrc = CAT_IMAGES[food.category_name]
    || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop';

  const handleAdd = () => {
    addToCart(food);
    notify(`🛒 ${food.name} added to cart!`);
  };

  return (
    <div className="food-card" style={{ position: 'relative' }}>
      <div className="food-image-wrapper">
        <img
          src={imageSrc}
          alt={food.name}
          className="food-image"
          onError={(e) => { e.target.onerror = null; e.target.src = fallbackSrc; }}
        />
        {food.is_veg !== undefined && (
          <div className="food-veg-badge">
            <div className="food-veg-dot" style={{ background: food.is_veg ? '#48c479' : '#e23744' }} />
          </div>
        )}
        {food.is_bestseller && <span className="food-badge">🔥 Bestseller</span>}
        {food.category_name && !food.is_bestseller && (
          <span className="food-badge">{food.category_name}</span>
        )}
        <WishlistButton foodId={food.id} />
      </div>
      <div className="food-info">
        <div className="food-name">{food.name || 'Food Item'}</div>
        <div className="food-description">{food.description || 'Delicious food item'}</div>
        <div className="food-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {food.surge_active ? (
              <>
                <span className="food-price" style={{ color: '#ff5200' }}>
                  {food.surge_emoji} ₹{food.dynamic_price ?? food.price}
                </span>
                <span style={{
                  fontSize: '0.72rem', color: '#999',
                  textDecoration: 'line-through', lineHeight: 1,
                }}>
                  ₹{food.price}
                </span>
              </>
            ) : (
              <span className="food-price">₹{food.price ?? '—'}</span>
            )}
          </div>
          <button className="add-btn" onClick={handleAdd}>+ Add</button>
        </div>
      </div>
    </div>
  );
}
