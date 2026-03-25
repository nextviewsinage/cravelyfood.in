import { useEffect, useRef } from 'react';

// Uses OpenStreetMap via Leaflet (free, no API key needed)
export default function DeliveryMap({ address }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS
    const loadLeaflet = () => {
      if (window.L) return initMap();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.body.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || mapInstance.current) return;
      const L = window.L;

      // Default center: India
      const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Geocode address using Nominatim (free)
      if (address && address.trim().length > 3) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data && data[0]) {
              const { lat, lon } = data[0];
              map.setView([lat, lon], 14);
              L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`📍 Delivery here`)
                .openPopup();
            }
          })
          .catch(() => {});
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [address]);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: 8 }}>
        📍 Delivery Location Preview
      </div>
      <div
        ref={mapRef}
        style={{ height: 220, borderRadius: 12, overflow: 'hidden', border: '1px solid #e8e8e8' }}
      />
    </div>
  );
}
