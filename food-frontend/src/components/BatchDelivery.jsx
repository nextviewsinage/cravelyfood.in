import { useState, useEffect, useRef } from 'react';
import api from '../api/api';

/* ── Leaflet route map ─────────────────────────────── */
function RouteMap({ origin, route }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !origin || !route.length) return;

    const loadLeaflet = () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (window.L) return initMap();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    };

    const initMap = () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
      const L = window.L;
      const map = L.map(mapRef.current).setView([origin.lat, origin.lng], 13);
      instanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      // Restaurant origin marker
      const restaurantIcon = L.divIcon({
        html: '<div style="font-size:24px">🏪</div>',
        className: '', iconAnchor: [12, 12],
      });
      L.marker([origin.lat, origin.lng], { icon: restaurantIcon })
        .addTo(map)
        .bindPopup('<b>Restaurant</b>');

      // Route stops
      const points = [[origin.lat, origin.lng]];
      route.forEach((stop, idx) => {
        points.push([stop.lat, stop.lng]);
        const stopIcon = L.divIcon({
          html: `<div style="background:#ff5200;color:#fff;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${idx + 1}</div>`,
          className: '', iconAnchor: [13, 13],
        });
        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .addTo(map)
          .bindPopup(`<b>Stop ${idx + 1}</b><br>${stop.label}<br>📍 ${stop.address}<br>⏱ ~${stop.eta_minutes} min`);
      });

      // Draw polyline route
      L.polyline(points, { color: '#ff5200', weight: 3, dashArray: '6,4' }).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [30, 30] });
    };

    loadLeaflet();
    return () => {
      if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
    };
  }, [origin, route]);

  return (
    <div ref={mapRef} style={{ height: 320, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }} />
  );
}

/* ── Main BatchDelivery component ──────────────────── */
export default function BatchDelivery() {
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [msg, setMsg] = useState('');
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    );
  }, []);

  const optimize = () => {
    setLoading(true); setMsg('');
    const params = userCoords ? `?lat=${userCoords.lat}&lng=${userCoords.lng}` : '';
    api.get(`delivery/batch/optimize/${params}`)
      .then(r => setBatch(r.data))
      .catch(() => setMsg('❌ Could not fetch orders'))
      .finally(() => setLoading(false));
  };

  const assignAll = () => {
    if (!batch?.route?.length) return;
    setAssigning(true);
    api.post('delivery/batch/assign/', {
      order_ids: batch.route.map(s => s.id),
      batch_id: batch.batch_id,
    })
      .then(r => setMsg(`✅ ${r.data.message}`))
      .catch(() => setMsg('❌ Assignment failed'))
      .finally(() => setAssigning(false));
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 20,
      boxShadow: '0 2px 16px rgba(0,0,0,0.08)', marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>🤖 AI Batch Delivery</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>
            Optimized route — multiple orders, one trip
          </div>
        </div>
        <button
          onClick={optimize}
          disabled={loading}
          style={{
            background: loading ? '#ccc' : 'linear-gradient(90deg,#ff5200,#ff8c00)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 20px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {loading ? '⏳ Optimizing...' : '⚡ Optimize Route'}
        </button>
      </div>

      {msg && (
        <div style={{
          background: msg.startsWith('✅') ? '#e8f5e9' : '#fdecea',
          color: msg.startsWith('✅') ? '#2e7d32' : '#c62828',
          padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontWeight: 600,
        }}>{msg}</div>
      )}

      {batch && batch.route?.length > 0 && (
        <>
          {/* Summary bar */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16,
          }}>
            {[
              { icon: '📦', label: 'Orders', val: batch.total_orders },
              { icon: '📍', label: 'Distance', val: `${batch.total_km} km` },
              { icon: '⏱', label: 'ETA', val: `~${batch.total_eta_minutes} min` },
              { icon: '🆔', label: 'Batch', val: batch.batch_id },
            ].map(s => (
              <div key={s.label} style={{
                background: '#fff8f5', border: '1px solid #ffe0cc',
                borderRadius: 10, padding: '8px 14px', textAlign: 'center', flex: 1, minWidth: 80,
              }}>
                <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#ff5200' }}>{s.val}</div>
                <div style={{ fontSize: '0.72rem', color: '#888' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Map */}
          <RouteMap origin={batch.origin} route={batch.route} />

          {/* Stop list */}
          <div style={{ marginBottom: 16 }}>
            {batch.route.map((stop, idx) => (
              <div key={stop.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '10px 0', borderBottom: '1px solid #f0f0f0',
              }}>
                <div style={{
                  background: '#ff5200', color: '#fff', borderRadius: '50%',
                  width: 28, height: 28, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                }}>{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{stop.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>📍 {stop.address}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 2 }}>
                    🍽 {stop.item} × {stop.qty} &nbsp;|&nbsp; ₹{stop.amount}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, color: '#ff5200', fontSize: '0.85rem' }}>
                    ~{stop.eta_minutes} min
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#aaa' }}>
                    +{stop.distance_from_prev_km} km
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Assign button */}
          <button
            onClick={assignAll}
            disabled={assigning}
            style={{
              width: '100%', background: assigning ? '#ccc' : '#1a1a2e',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '12px', fontWeight: 700, fontSize: '1rem',
              cursor: assigning ? 'not-allowed' : 'pointer',
            }}
          >
            {assigning ? '⏳ Assigning...' : `🚀 Accept Batch & Start Delivery (${batch.total_orders} orders)`}
          </button>
        </>
      )}

      {batch && batch.route?.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>
          📭 No orders ready for batch delivery right now
        </div>
      )}
    </div>
  );
}
