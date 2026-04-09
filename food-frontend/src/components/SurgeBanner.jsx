import { useEffect, useState } from 'react';
import api from '../api/api';

// Frontend fallback — check time locally if backend unavailable
function getLocalSurge() {
  const hour = new Date().getHours();
  const day = new Date().getDay(); // 0=Sun, 6=Sat

  if (hour >= 12 && hour < 14)
    return { active: true, multiplier: 1.20, label: '🍽️ Lunch Rush — Surge +20%', emoji: '🍽️', pct: 20 };
  if (hour >= 19 && hour < 22)
    return { active: true, multiplier: 1.25, label: '🌆 Dinner Rush — Surge +25%', emoji: '🌆', pct: 25 };
  if (hour >= 23 || hour < 5)
    return { active: true, multiplier: 1.15, label: '🌙 Late Night Surge +15%', emoji: '🌙', pct: 15 };
  if (day === 0 || day === 6)
    return { active: true, multiplier: 1.10, label: '🎉 Weekend Surge +10%', emoji: '🎉', pct: 10 };
  return null;
}

export default function SurgeBanner() {
  const [surge, setSurge] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const rain = localStorage.getItem('is_raining') === '1' ? '?rain=1' : '';

    api.get(`pricing/surge/${rain}`)
      .then(r => {
        if (r.data && r.data.active) {
          const pct = Math.round((r.data.multiplier - 1) * 100);
          setSurge({ ...r.data, pct });
        } else {
          // Backend says no surge — try local time-based fallback
          setSurge(getLocalSurge());
        }
      })
      .catch(() => {
        // Backend unreachable — use local fallback
        setSurge(getLocalSurge());
      });

    // Re-check every 5 minutes
    const id = setInterval(() => {
      api.get(`pricing/surge/${rain}`)
        .then(r => {
          if (r.data && r.data.active) {
            setSurge({ ...r.data, pct: Math.round((r.data.multiplier - 1) * 100) });
          } else {
            setSurge(getLocalSurge());
          }
        })
        .catch(() => setSurge(getLocalSurge()));
    }, 5 * 60 * 1000);

    return () => clearInterval(id);
  }, []);

  if (!surge || !visible) return null;

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
        {surge.label} — prices are <strong>+{surge.pct}%</strong> right now
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
