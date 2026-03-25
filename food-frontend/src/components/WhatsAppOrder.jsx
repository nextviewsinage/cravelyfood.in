import { useEffect, useState } from 'react';
import api from '../api/api';

export default function WhatsAppOrder({ compact = false }) {
  const [data, setData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    api.get('whatsapp/menu/').then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return null;

  if (compact) {
    // Small floating button
    return (
      <a
        href={data.wa_url}
        target="_blank"
        rel="noopener noreferrer"
        title="Order via WhatsApp"
        style={{
          position: 'fixed', bottom: 90, right: 24,
          background: '#25D366', color: 'white',
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', boxShadow: '0 4px 16px rgba(37,211,102,0.5)',
          textDecoration: 'none', zIndex: 999,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    );
  }

  // Full card
  return (
    <div style={{
      background: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
      borderRadius: 18, padding: '20px 24px',
      border: '2px solid #25D36633', marginBottom: 32,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: '#25D366', width: 48, height: 48, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1b5e20' }}>Order via WhatsApp</div>
            <div style={{ fontSize: '0.8rem', color: '#388e3c' }}>Chat with us • Instant menu • Easy ordering</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setShowMenu((p) => !p)}
            style={{
              padding: '9px 16px', background: 'white', color: '#1b5e20',
              border: '2px solid #25D366', borderRadius: 10,
              fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            {showMenu ? 'Hide Menu' : '📋 View Menu'}
          </button>
          <a
            href={data.wa_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '9px 20px', background: '#25D366', color: 'white',
              border: 'none', borderRadius: 10, fontWeight: 800,
              cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            💬 Order Now
          </a>
        </div>
      </div>

      {/* Menu preview */}
      {showMenu && data.items && (
        <div style={{ marginTop: 16, borderTop: '1px solid #25D36633', paddingTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1b5e20', marginBottom: 10 }}>
            🌟 Top Items
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {data.items.map((item, i) => (
              <div key={item.id} style={{
                background: 'white', borderRadius: 10, padding: '10px 12px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>#{i + 1} {item.is_veg ? '🟢' : '🔴'}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.name}</div>
                </div>
                <div style={{ fontWeight: 800, color: '#ff5200', fontSize: '0.9rem' }}>₹{item.price}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: '0.78rem', color: '#388e3c', fontStyle: 'italic' }}>
            💬 Click "Order Now" to open WhatsApp with the full menu pre-filled
          </div>
        </div>
      )}
    </div>
  );
}
