import { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

export default function Grocery() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [organic, setOrganic] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();

  useEffect(() => {
    api.get('grocery/categories/').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (search) params.set('search', search);
    if (organic) params.set('organic', 'true');
    api.get(`grocery/items/?${params}`).then(r => setItems(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [activeCategory, search, organic]);

  const handleAdd = (item) => {
    addToCart({ id: `g_${item.id}`, name: item.name, price: item.price, image: item.image_url, description: item.unit });
    notify(`🛒 ${item.name} added!`);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>🛒 Grocery</h1>
        <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
          30 min delivery
        </span>
      </div>
      <p style={{ color: '#888', marginBottom: 20 }}>Fresh groceries delivered to your door</p>

      {/* Search + Organic toggle */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search groceries..."
          style={{ flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 30, border: '1.5px solid #e8e8e8', fontSize: '0.95rem', outline: 'none' }}
        />
        <button
          onClick={() => setOrganic(p => !p)}
          style={{
            padding: '10px 18px', borderRadius: 30,
            border: `2px solid ${organic ? '#2e7d32' : '#e8e8e8'}`,
            background: organic ? '#e8f5e9' : 'white',
            color: organic ? '#2e7d32' : '#555',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem',
          }}
        >
          🌿 Organic Only
        </button>
      </div>

      {/* Category scroll */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
        {['All', ...categories.map(c => c.name)].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: '8px 18px', borderRadius: 20, whiteSpace: 'nowrap',
            border: `2px solid ${activeCategory === cat ? '#ff5200' : '#e8e8e8'}`,
            background: activeCategory === cat ? '#ff5200' : 'white',
            color: activeCategory === cat ? 'white' : '#333',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem',
          }}>
            {categories.find(c => c.name === cat)?.icon || '🛒'} {cat}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
          <div style={{ fontSize: '2rem' }}>🔍</div>
          <p>No items found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: 'white', borderRadius: 14,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              overflow: 'hidden', position: 'relative',
            }}>
              {item.is_organic && (
                <div style={{ position: 'absolute', top: 8, left: 8, background: '#2e7d32', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                  🌿 ORGANIC
                </div>
              )}
              <div style={{ height: 100, background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                {item.emoji || item.category_icon || '🛒'}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ color: '#888', fontSize: '0.75rem', marginTop: 2 }}>{item.unit}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontWeight: 800, color: '#ff5200', fontSize: '1rem' }}>₹{item.price}</span>
                  <button onClick={() => handleAdd(item)} style={{
                    background: '#ff5200', color: 'white',
                    border: 'none', borderRadius: 6,
                    padding: '5px 10px', fontWeight: 700,
                    cursor: 'pointer', fontSize: '0.8rem',
                  }}>+ Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
