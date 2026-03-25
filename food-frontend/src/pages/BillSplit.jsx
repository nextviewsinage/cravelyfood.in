import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function BillSplit() {
  const { cart, total } = useContext(CartContext);
  const [people, setPeople] = useState(2);
  const gst = total * 0.18;
  const grandTotal = total + gst;
  const perPerson = grandTotal / people;

  return (
    <div className="static-page">
      {/* Hero */}
      <div className="static-hero">
        <h1>🧾 Bill Split</h1>
        <p>Split your order bill equally among friends</p>
      </div>

      <div className="billsplit-wrap">
        {cart.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h2>Cart is empty</h2>
            <p>Add items to cart first to split the bill</p>
            <Link to="/" className="btn-primary">Browse Food</Link>
          </div>
        ) : (
          <div className="billsplit-card">

            {/* Items list */}
            <div className="billsplit-section-title">Order Items</div>
            <div className="billsplit-items">
              {cart.map((item) => (
                <div key={item.id} className="billsplit-item">
                  <span className="billsplit-item-name">{item.name} × {item.qty}</span>
                  <span className="billsplit-item-price">₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="billsplit-totals">
              <div className="billsplit-total-row">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="billsplit-total-row muted">
                <span>GST (18%)</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="billsplit-total-row grand">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* People selector */}
            <div className="billsplit-people-label">Number of People</div>
            <div className="billsplit-people-row">
              <button
                className="billsplit-people-btn"
                onClick={() => setPeople((p) => Math.max(2, p - 1))}
              >−</button>
              <span className="billsplit-people-num">{people}</span>
              <button
                className="billsplit-people-btn"
                onClick={() => setPeople((p) => Math.min(20, p + 1))}
              >+</button>
            </div>

            {/* Per person result */}
            <div className="billsplit-result">
              <div className="billsplit-result-label">Each person pays</div>
              <div className="billsplit-result-amount">₹{perPerson.toFixed(2)}</div>
              <div className="billsplit-result-sub">Split among {people} people</div>
            </div>

            {/* Individual breakdown */}
            <div className="billsplit-breakdown">
              {Array.from({ length: people }, (_, i) => (
                <div key={i} className="billsplit-person-row">
                  <span className="billsplit-person-avatar">👤</span>
                  <span className="billsplit-person-name">Person {i + 1}</span>
                  <span className="billsplit-person-amount">₹{perPerson.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Link to="/checkout" className="billsplit-checkout-btn">
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
