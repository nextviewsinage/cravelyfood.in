import React from 'react';
import Navbar from '../components/Navbar';

export default function RestaurantDetails() {
  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '24px auto', padding: 12 }}>
        <h2>Restaurant Details</h2>
        <p>Details about the selected restaurant will appear here.</p>
      </div>
    </div>
  );
}
