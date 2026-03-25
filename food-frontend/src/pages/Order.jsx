import React from 'react';
import Navbar from '../components/Navbar';
import OrderForm from '../components/OrderForm';

export default function Order() {
  const handleSubmit = (data) => {
    // Replace with real submit logic (API call)
    console.log('Order data:', data);
    // Simple confirmation for now
    alert('Order submitted. Thank you!');
    // Optionally redirect: window.location = '/';
  };

  return (
    <div>
      <Navbar />
      <div style={{padding:16}}>
        <h1>Place Order</h1>
        <OrderForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
