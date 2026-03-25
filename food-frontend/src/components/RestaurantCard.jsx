import React from 'react';

export default function RestaurantCard({ name = 'Restaurant', subtitle }) {
  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
      <h4 style={{ margin: 0 }}>{name}</h4>
      {subtitle && <p style={{ margin: 0, color: '#666' }}>{subtitle}</p>}
    </div>
  );
}
