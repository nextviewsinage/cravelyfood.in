import React, { useEffect, useState } from "react";
import api from '../api/api';

function OrderForm() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    customer_address: "",
    customer_phone: "",
    food_item: "",
    quantity: 1
  });

  useEffect(() => {
    api.get('foods/')
      .then((res) => setFoods(res.data))
      .catch((err) => console.error("Failed to load foods:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('orders/', form)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => alert("Order Placed!"))
      .catch((err) => {
        console.error("Order error:", err);
        alert('Failed to place order');
      });
  };

  return (
    <div className="container mt-4">
      <h2>Place Order</h2>

      <form onSubmit={handleSubmit}>
        <input 
          className="form-control mb-2"
          placeholder="Name"
          onChange={(e) => setForm({...form, customer_name: e.target.value})}
        />
        
        <textarea 
          className="form-control mb-2"
          placeholder="Address"
          onChange={(e) => setForm({...form, customer_address: e.target.value})}
        />

        <input 
          className="form-control mb-2"
          placeholder="Phone"
          onChange={(e) => setForm({...form, customer_phone: e.target.value})}
        />

        <select 
          className="form-control mb-2"
          onChange={(e) => setForm({...form, food_item: e.target.value})}
        >
          <option>Select Food</option>
          {foods.map(f => (
            <option value={f.id} key={f.id}>
              {f.name}
            </option>
          ))}
        </select>

        <input 
          type="number"
          className="form-control mb-2"
          defaultValue="1"
          onChange={(e) => setForm({...form, quantity: e.target.value})}
        />

        <button className="btn btn-primary">Place Order</button>
      </form>
    </div>
  );
}

export default OrderForm;
