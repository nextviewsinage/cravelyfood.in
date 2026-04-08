import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import FoodList from '../components/FoodList';
import SurgeBanner from '../components/SurgeBanner';
import api from '../api';

export default function Foods() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    console.log("📡 Fetching foods from API...");
    api.get('foods/')
      .then((res) => {
        if (!mounted) return;
        console.log("✅ API Response:", res.data);
        setItems(Array.isArray(res.data) ? res.data : (res.data.results || []));
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("❌ API Error:", err.message);
        setError(err.message);
        setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: 16 }}>
        <SurgeBanner />
        <h1>All Foods</h1>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>⚠️ Error: {error}</p>}
        {items.length === 0 && !loading && <p>No foods available. Add items in Django admin.</p>}
        <p style={{ color: 'green' }}>📊 Showing {items.length} items</p>
        <FoodList foods={items} />
      </div>
    </div>
  );
}
