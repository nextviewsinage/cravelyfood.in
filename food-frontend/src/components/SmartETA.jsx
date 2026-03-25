import { useEffect, useState } from 'react';
import api from '../api/api';

export default function SmartETA({ restaurantId, showBreakdown = false }) {
  const [eta, setEta] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  // Try to get user location once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (restaurantId) params.set('restaurant_id', restaurantId);
    if (userCoords) {
      params.set('lat', userCoords.lat);
      params.set('lng', userCoords.lng);
    }
    api.get(`delivery/eta/?${params}`)
      .then((r) => setEta(r.data))
      .catch(() => {});
  }, [restaurantId, userCoords]);

  if (!eta) return null;

  const isHigh = eta.load === 'High';
  const color = isHigh ? '#e65100' : '#2e7d32';
  const bg = isHigh ? '#fff3e0' : '#e8f5e9';

  if (!showBreakdown) {
    // Compact badge for cards
    return (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: bg, color, padding: '5px 12px',
        borderRadius: 20, fontSize: '0.82rem', fontWeight: 700,
      }}>
        🛵 {eta.label}
        {isHigh && <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(High demand)</span>}
      </div>
    );
  }

  // Full breakdown card
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 16,
      padding: '20px', boxShadow: '0 2px 12px var(--shadow)',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>🛵 Smart Delivery Prediction</h3>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text3)' }}>
            Real-time calculation based on traffic, distance & restaurant load
          </p>
        </div>
        <div style={{
          background: bg, color,
          padding: '10px 18px', borderRadius: 14,
          fontWeight: 900, fontSize: '1.4rem', textAlign: 'center',
          minWidth: 80,
        }}>
          {eta.eta_minutes}
          <div style={{ fontSize: '0.65rem', fontWeight: 600, marginTop: -2 }}>min</div>
        </div>
      </div>

      {/* Breakdown bars */}
      {eta.breakdown && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
          {eta.breakdown.map((b) => (
            <div key={b.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{b.label}</span>
                <span style={{ fontWeight: 700, color }}>{b.minutes} min</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${Math.min((b.minutes / eta.eta_minutes) * 100, 100)}%`,
                  background: color, transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ background: bg, color, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
          {eta.load === 'High' ? '🔥 High demand' : '✅ Normal load'}
        </span>
        {eta.traffic && (
          <span style={{ background: 'var(--bg)', color: 'var(--text2)', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)' }}>
            🚦 {eta.traffic}
          </span>
        )}
        {eta.distance_km && (
          <span style={{ background: 'var(--bg)', color: 'var(--text2)', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)' }}>
            📍 ~{eta.distance_km} km away
          </span>
        )}
      </div>
    </div>
  );
}
