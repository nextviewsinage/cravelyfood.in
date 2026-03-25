import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../api/api';
import DeliveryMap from '../components/DeliveryMap';

const GST = 0.18;

export default function Checkout() {
  const { cart, total, removeFromCart, appliedCoupon, removeCoupon } = useContext(CartContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', upi_id: '' });
  const [payment, setPayment] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const discount = appliedCoupon?.discount || 0;
  const couponCode = appliedCoupon?.code || '';
  const gst = total * GST;
  const grandTotal = total + gst - discount;

  if (cart.length === 0) { navigate('/cart'); return null; }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Per-item discount split proportionally
      const perItemDiscount = cart.length > 0 ? discount / cart.length : 0;
      for (const item of cart) {
        await api.post('orders/', {
          customer_name: form.name,
          customer_phone: form.phone,
          customer_address: `${form.address}, ${form.city}`,
          food_item: item.id,
          quantity: item.qty,
          payment_method: payment,
          payment_status: payment === 'COD' ? 'Pending' : 'Paid',
          upi_id: payment === 'UPI' ? form.upi_id : '',
          discount_amount: perItemDiscount.toFixed(2),
          coupon_code: couponCode || '',
          ...(scheduleEnabled && scheduledAt ? { scheduled_at: scheduledAt } : {}),
        });
      }
      // Mark coupon as used on backend
      if (couponCode) {
        await api.post('coupons/use/', { code: couponCode }).catch(() => {});
      }
      cart.forEach((item) => removeFromCart(item.id));
      removeCoupon();
      navigate('/order-success');
    } catch {
      setError('Failed to place order. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="checkout-layout">
      {/* Left */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 20 }}>Checkout</h1>

        {/* Delivery */}
        <div className="checkout-form-card" style={{ marginBottom: 16 }}>
          <div className="checkout-form-title">📍 Delivery Details</div>
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 14px', borderRadius: 8, marginBottom: 14, fontSize: '0.88rem' }}>⚠️ {error}</div>}
          <form id="checkout-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" name="phone" placeholder="10-digit number" value={form.phone} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" name="address" placeholder="House no, Street, Area" value={form.address} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
            </div>

            {/* Scheduled Order */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#ff5200' }}
                />
                🕒 Schedule for later
              </label>
              {scheduleEnabled && (
                <input
                  type="datetime-local"
                  className="form-input"
                  style={{ marginTop: 8 }}
                  value={scheduledAt}
                  min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required={scheduleEnabled}
                />
              )}
            </div>
            {/* Live map preview */}
            {(form.address || form.city) && (
              <DeliveryMap address={`${form.address} ${form.city}`} />
            )}
          </form>
        </div>

        {/* Payment */}
        <div className="checkout-form-card">
          <div className="checkout-form-title">💳 Payment Method</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { id: 'COD', label: '💵 Cash on Delivery', sub: 'Pay when delivered' },
              { id: 'UPI', label: '📱 UPI', sub: 'GPay / PhonePe / Paytm' },
              { id: 'Card', label: '💳 Card', sub: 'Debit / Credit Card' },
            ].map((p) => (
              <div key={p.id} onClick={() => setPayment(p.id)} style={{
                flex: 1, minWidth: 130, padding: '14px 16px',
                border: `2px solid ${payment === p.id ? '#ff5200' : '#e8e8e8'}`,
                borderRadius: 12, cursor: 'pointer',
                background: payment === p.id ? '#fff5f0' : '#fff',
                transition: 'all 0.18s',
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.label}</div>
                <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 3 }}>{p.sub}</div>
              </div>
            ))}
          </div>

          {payment === 'UPI' && (
            <div style={{ marginTop: 14 }}>
              <label className="form-label">UPI ID</label>
              <input
                className="form-input"
                placeholder="yourname@upi"
                value={form.upi_id || ''}
                onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
              />
              <div style={{ fontSize: '0.78rem', color: '#48c479', marginTop: 6, fontWeight: 600 }}>
                🔒 100% Secure UPI Payment
              </div>
            </div>
          )}

          {payment === 'Card' && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="form-label">Card Number</label>
                <input className="form-input" placeholder="1234 5678 9012 3456" maxLength={19} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Expiry</label>
                  <input className="form-input" placeholder="MM/YY" maxLength={5} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">CVV</label>
                  <input className="form-input" placeholder="•••" maxLength={3} type="password" />
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#48c479', fontWeight: 600 }}>
                🔒 256-bit SSL Encrypted
              </div>
            </div>
          )}

          <button type="submit" form="checkout-form" className="checkout-btn" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? '⏳ Placing Order...' : `✅ Place Order — ₹${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </div>
      <div>
        <div className="cart-summary" style={{ position: 'sticky', top: 88 }}>
          <div className="cart-summary-title">Order Summary</div>
          {cart.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: '0.88rem' }}>
              <span style={{ color: '#555' }}>{item.name} × {item.qty}</span>
              <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row" style={{ marginTop: 12 }}><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery</span><span className="free">FREE</span></div>
          <div className="summary-row"><span className="gst">GST (18%)</span><span className="gst">₹{gst.toFixed(2)}</span></div>
          {discount > 0 && (
            <div className="summary-row" style={{ color: '#48c479' }}>
              <span>🎁 Coupon ({couponCode})</span>
              <span>−₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total"><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
          <div style={{ marginTop: 12, fontSize: '0.78rem', color: '#aaa', textAlign: 'center' }}>
            {payment === 'COD' ? '💵 Pay on delivery' : '🔒 Secure online payment'}
          </div>
        </div>
      </div>
    </div>
  );
}
