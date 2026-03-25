import { useEffect, useState } from 'react';
import api from '../api/api';
import { useNotification } from '../context/NotificationContext';

export default function DynamicOffer() {
  const [offer, setOffer] = useState(null);
  const { notify } = useNotification();

  useEffect(() => {
    api.get('offers/dynamic/').then(r => setOffer(r.data)).catch(() => {});
  }, []);

  if (!offer) return null;

  const copy = () => {
    navigator.clipboard.writeText(offer.code);
    notify(`Coupon ${offer.code} copied!`);
  };

  return (
    <div onClick={copy} style={{
      background: 'linear-gradient(120deg, #1a1a2e, #16213e)',
      color: 'white', borderRadius: 16,
      padding: '18px 24px', marginBottom: 24,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}>
      <div>
        <div style={{ fontSize: '0.78rem', opacity: 0.7, marginBottom: 3 }}>🎯 Personalized Offer for You</div>
        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{offer.label}</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 3 }}>Tap to copy code</div>
      </div>
      <div style={{
        background: '#ff5200', padding: '8px 16px',
        borderRadius: 10, fontWeight: 900,
        fontSize: '1rem', letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}>
        {offer.code}
      </div>
    </div>
  );
}
