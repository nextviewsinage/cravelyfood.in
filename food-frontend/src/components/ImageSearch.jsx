import { useState, useRef, useContext } from 'react';
import api from '../api/api';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

export default function ImageSearch() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    // Use filename as search query (e.g. "pizza.jpg" → "pizza")
    const name = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    setQuery(name);
  };

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('ai/image-search/', { query });
      setResults(res.data.foods || []);
      if (res.data.foods.length === 0) notify('No matching dishes found', 'info');
    } catch { notify('Search failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'white', border: '1.5px solid #e8e8e8',
          borderRadius: 30, padding: '8px 16px',
          cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        📸 Search by Image
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 20, padding: 24,
            width: '100%', maxWidth: 480, maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>📸 Image Search</div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Upload area */}
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: '2px dashed #e8e8e8', borderRadius: 14,
                padding: '30px 20px', textAlign: 'center',
                cursor: 'pointer', marginBottom: 14,
                background: preview ? '#f8f8f8' : 'white',
              }}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ maxHeight: 150, borderRadius: 10, margin: '0 auto' }} />
              ) : (
                <>
                  <div style={{ fontSize: '2.5rem' }}>📷</div>
                  <div style={{ color: '#888', marginTop: 8, fontSize: '0.9rem' }}>
                    Tap to upload a food photo
                  </div>
                  <div style={{ color: '#aaa', fontSize: '0.78rem', marginTop: 4 }}>
                    e.g. pizza.jpg, burger.png
                  </div>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>

            {/* Manual query */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Or type food name..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e8e8e8', fontSize: '0.95rem' }}
                onKeyDown={e => e.key === 'Enter' && search()}
              />
              <button onClick={search} disabled={loading} style={{
                background: '#ff5200', color: 'white', border: 'none',
                borderRadius: 10, padding: '10px 18px', fontWeight: 700, cursor: 'pointer',
              }}>
                {loading ? '...' : 'Search'}
              </button>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Similar dishes found:</div>
                {results.map(food => (
                  <div key={food.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid #f5f5f5',
                  }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{food.name}</div>
                      <div style={{ color: '#888', fontSize: '0.8rem' }}>{food.category_name} • ₹{food.price}</div>
                    </div>
                    <button onClick={() => { addToCart(food); notify(`${food.name} added!`); }} style={{
                      background: '#ff5200', color: 'white', border: 'none',
                      borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem',
                    }}>+ Add</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
