import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/api';
import BACKEND from '../config';
const GST = 0.18;

const FALLBACKS = {
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
};

const getImg = (item) => {
  if (item.image) return item.image.startsWith('http') ? item.image : `${BACKEND}${item.image}`;
  const key = Object.keys(FALLBACKS).find(k => (item.name + item.category_name).toLowerCase().includes(k));
  return FALLBACKS[key || 'default'];
};

export default function Cart() {
  const { cart, increaseQty, decreaseQty, removeFromCart, total, appliedCoupon, applyCoupon, removeCoupon } = useContext(CartContext);
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [promo, setPromo] = useState(appliedCoupon?.code || '');
  const [discount, setDiscount] = useState(appliedCoupon?.discount || 0);
  const [promoMsg, setPromoMsg] = useState(appliedCoupon ? `✅ Coupon applied! You save ₹${appliedCoupon.discount}` : '');
  const [promoLoading, setPromoLoading] = useState(false);

  const gst = total * GST;
  const grandTotal = total + gst - discount;

  const applyPromo = async () => {
    if (!promo.trim()) return;
    setPromoLoading(true);
    setPromoMsg('');
    try {
      const res = await api.post('coupons/validate/', { code: promo.trim().toUpperCase(), order_total: total });
      setDiscount(res.data.discount);
      setPromoMsg(`✅ ${res.data.message}`);
      applyCoupon(promo.trim().toUpperCase(), res.data.discount); // save to context
      notify(`🎁 ${res.data.message}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      setPromoMsg(`❌ ${msg}`);
      setDiscount(0);
      removeCoupon();
      notify(msg, 'error');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setPromo('');
    setDiscount(0);
    setPromoMsg('');
    removeCoupon();
  };

  if (cart.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon">🛒</div>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added anything yet</p>
      <Link to="/" className="btn-primary">Browse Menu</Link>
    </div>
  );

  return (
    <div className="cart-layout">
      {/* Left — Items */}
      <div className="cart-items-section">
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>
          Your Cart <span style={{ color: '#aaa', fontWeight: 400, fontSize: '1rem' }}>({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
        </h1>

        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <img
              src={getImg(item)}
              alt={item.name}
              className="cart-item-img"
              onError={(e) => { e.target.src = FALLBACKS.default; }}
            />
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              {item.category_name && <div className="cart-item-cat">{item.category_name}</div>}
              <div className="cart-item-price">₹{item.price} each</div>
            </div>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => decreaseQty(item.id)}>−</button>
              <span className="qty-num">{item.qty}</span>
              <button className="qty-btn" onClick={() => increaseQty(item.id)}>+</button>
            </div>
            <div className="cart-item-total">₹{(item.price * item.qty).toFixed(2)}</div>
            <button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Remove">✕</button>
          </div>
        ))}
      </div>

      {/* Right — Summary */}
      <div className="cart-summary">
        <div className="cart-summary-title">Bill Details</div>

        <div className="summary-row">
          <span>Item Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee</span>
          <span className="free">FREE</span>
        </div>
        <div className="summary-row">
          <span className="gst">GST & Charges (18%)</span>
          <span className="gst">₹{gst.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="summary-row" style={{ color: '#48c479' }}>
            <span>Promo Discount</span>
            <span>−₹{discount.toFixed(2)}</span>
          </div>
        )}
        <div className="summary-row total">
          <span>To Pay</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>

        {/* Promo */}
        <div className="promo-row">
          <input
            className="promo-input"
            placeholder="Enter coupon code"
            value={promo}
            onChange={(e) => { setPromo(e.target.value.toUpperCase()); setPromoMsg(''); }}
            disabled={discount > 0}
          />
          {discount > 0 ? (
            <button className="promo-btn" onClick={handleRemoveCoupon} style={{ background: '#e23744' }}>
              Remove
            </button>
          ) : (
            <button className="promo-btn" onClick={applyPromo} disabled={promoLoading || !promo.trim()}>
              {promoLoading ? '...' : 'Apply'}
            </button>
          )}
        </div>
        {promoMsg && (
          <div style={{ fontSize: '0.82rem', marginTop: 6, color: discount > 0 ? '#48c479' : '#e23744', fontWeight: 600 }}>
            {promoMsg}
          </div>
        )}

        <button className="checkout-btn" onClick={() => navigate('/checkout')}>
          Proceed to Checkout →
        </button>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.78rem', color: '#aaa' }}>
          🔒 Safe & Secure Payments
        </div>
      </div>
    </div>
  );
}
