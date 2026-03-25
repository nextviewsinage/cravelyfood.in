import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    key: 'basic',
    title: 'Basic',
    emoji: '⚡',
    price: '₹99',
    period: '/month',
    perks: [
      'Free delivery on all orders',
      '5% extra discount on every order',
      '+200 loyalty points on signup',
    ],
    popular: false,
  },
  {
    key: 'pro',
    title: 'Pro',
    emoji: '🔥',
    price: '₹199',
    period: '/month',
    perks: [
      'Free delivery on all orders',
      '15% extra discount on every order',
      'Priority customer support',
      'Flash deal early access',
      '+500 loyalty points on signup',
    ],
    popular: true,
  },
];

const PERKS_ROW = [
  { icon: '🚚', label: 'Free Delivery' },
  { icon: '💸', label: 'Extra Discounts' },
  { icon: '⚡', label: 'Priority Support' },
  { icon: '🎁', label: 'Loyalty Points' },
];

export default function Subscription() {
  const { isLoggedIn } = useAuth();
  const { notify } = useNotification();
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get('subscription/').then(r => setCurrent(r.data)).catch(() => {});
  }, [isLoggedIn]);

  const subscribe = async (plan) => {
    setLoading(true);
    try {
      const res = await api.post('subscription/', { plan });
      setCurrent(res.data);
      notify(`✅ Subscribed to ${plan} plan! Loyalty points added`);
    } catch { notify('Subscription failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="static-page">
      {/* Hero */}
      <div className="static-hero">
        <h1>👑 Subscription Plans</h1>
        <p>Unlimited free delivery + exclusive discounts every single order</p>
        {/* Perks row */}
        <div className="sub-hero-perks">
          {PERKS_ROW.map(p => (
            <div key={p.label} className="sub-hero-perk">
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sub-wrap">

        {/* Active plan banner */}
        {current?.active && (
          <div className="sub-active-banner">
            <div>
              <div className="sub-active-title">✅ Active: {current.plan?.toUpperCase()} Plan</div>
              <div className="sub-active-exp">
                Expires: {new Date(current.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <span className="sub-active-icon">👑</span>
          </div>
        )}

        {/* Not logged in */}
        {!isLoggedIn && (
          <div className="sub-login-nudge">
            <span>🔐 Login to subscribe and unlock exclusive benefits</span>
            <Link to="/login" className="sub-login-btn">Login Now</Link>
          </div>
        )}

        {/* Plan cards */}
        <div className="sub-plans-grid">
          {PLANS.map((plan) => {
            const isCurrent = current?.active && current?.plan === plan.key;
            return (
              <div key={plan.key} className={`sub-plan-card ${plan.popular ? 'popular' : ''} ${isCurrent ? 'active-plan' : ''}`}>
                {plan.popular && (
                  <div className="sub-popular-badge">MOST POPULAR</div>
                )}

                <div className="sub-plan-header">
                  <div className="sub-plan-title">{plan.title} {plan.emoji}</div>
                  <div className="sub-plan-price">
                    {plan.price}
                    <span className="sub-plan-period">{plan.period}</span>
                  </div>
                </div>

                <ul className="sub-plan-perks">
                  {plan.perks.map(p => (
                    <li key={p} className="sub-plan-perk">
                      <span className="sub-perk-check">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>

                <button
                  className={`sub-plan-btn ${isCurrent ? 'current' : ''}`}
                  onClick={() => subscribe(plan.key)}
                  disabled={loading || isCurrent || !isLoggedIn}
                >
                  {isCurrent ? '✅ Current Plan' : loading ? 'Processing...' : 'Subscribe Now'}
                </button>

                {isCurrent && (
                  <div className="sub-plan-active-tag">Your active plan</div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ / reassurance */}
        <div className="sub-faq">
          {[
            { q: '🔄 Cancel anytime', a: 'No lock-in. Cancel your subscription at any time from your profile.' },
            { q: '💳 Secure payments', a: 'All payments are processed securely via UPI, cards, or net banking.' },
            { q: '⚡ Instant activation', a: 'Your plan activates immediately after payment. No waiting.' },
          ].map(f => (
            <div key={f.q} className="sub-faq-item">
              <div className="sub-faq-q">{f.q}</div>
              <div className="sub-faq-a">{f.a}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
