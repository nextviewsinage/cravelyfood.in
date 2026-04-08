import { useEffect, useState } from 'react';
import api from '../api/api';

/**
 * Shows a sticky surge-pricing banner when surge is active.
 * Polls every 5 minutes to stay fresh.
 */
export default function SurgeBanner() {
  const [surge, setSurge] = useState(null);
  const [visible, setVisible] = useState(true);

  const fetchSurge = () => {
    const rain = localStorage.getItem('is_raining') === '1' ? '?rain=1' : '';
    api.get(`pricing/surge/${rain}`)
      .then(r => { if (r.data.active) setSurge(r.data); else setSurge(null); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSurge();
    const id = setInterval(fetchSurge, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!surge || !visible) return null;

  const pct = Math.round((surge.multiplier - 1) * 100);

  return (
    <div style={{
      background: 'linear-gradient(90deg, #ff5200, #ff8c00)',
      color: '#fff',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      fontSize: '0.9rem',
      fontWeight: 600,
      borderRadius: 10,
      margin: '0 0 16px 0',
      boxShadow: '0 3px 12px rgba(255,82,0,0.35)',
      animation: 'surgePulse 2s ease-in-out infinite',
    }}>
      <span style={{ fontSize: '1.3rem' }}>{surge.emoji}</span>
      <span style={{ flex: 1 }}>
        {surge.label} — prices are <strong>+{pct}%</strong> right now
      </span>
      <span style={{ opacity: 0.75, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
        Order early to save
      </span>
      <button
        onClick={() => setVisible(false)}
        aria-label="Dismiss surge banner"
        style={{
          background: 'none', border: 'none', color: '#fff',
          cursor: 'pointer', fontSize: '1rem', padding: '0 4px',
        }}
      >✕</button>

      <style>{`
        @keyframes surgePulse {
          0%, 100% { box-shadow: 0 3px 12px rgba(255,82,0,0.35); }
          50%       { box-shadow: 0 3px 22px rgba(255,82,0,0.65); }
        }
      `}</style>
    </div>
  );
}
