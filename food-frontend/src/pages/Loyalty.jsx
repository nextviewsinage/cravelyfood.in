import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const LEVEL_META = {
  Bronze:   { color: '#CD7F32', bg: 'linear-gradient(135deg,#CD7F32,#e8a85a)', icon: '🥉', next: 500  },
  Silver:   { color: '#9e9e9e', bg: 'linear-gradient(135deg,#9e9e9e,#c8c8c8)', icon: '🥈', next: 1500 },
  Gold:     { color: '#f59e0b', bg: 'linear-gradient(135deg,#f59e0b,#fcd34d)', icon: '🥇', next: 3000 },
  Platinum: { color: '#7c3aed', bg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', icon: '💎', next: 3000 },
};

const HOW_TO_EARN = [
  { icon: '🛒', label: 'Every order',     pts: '+10 pts per ₹100' },
  { icon: '📝', label: 'Write a review',  pts: '+20 pts'          },
  { icon: '👥', label: 'Refer a friend',  pts: '+100 pts'         },
  { icon: '💳', label: 'Subscribe',       pts: '+200 pts'         },
  { icon: '🎂', label: 'Birthday bonus',  pts: '+50 pts'          },
];

const LEVEL_PERKS = [
  { level: 'Bronze',   pts: '0+',    perk: '5% discount on redemption'  },
  { level: 'Silver',   pts: '500+',  perk: '8% discount + priority support' },
  { level: 'Gold',     pts: '1500+', perk: '12% discount + flash deals'  },
  { level: 'Platinum', pts: '3000+', perk: '20% discount + free delivery' },
];

export default function Loyalty() {
  const { isLoggedIn } = useAuth();
  const { notify }     = useNotification();
  const [data, setData]         = useState(null);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get('loyalty/').then(r => setData(r.data)).catch(() => {});
  }, [isLoggedIn]);

  const redeem = async () => {
    if (!data || data.points < 100) return notify('Need at least 100 points to redeem', 'error');
    setRedeeming(true);
    try {
      const res = await api.post('loyalty/', { points: 100 });
      notify(`✅ Redeemed 100 pts = ₹${res.data.discount} discount!`);
      api.get('loyalty/').then(r => setData(r.data));
    } catch { notify('Redemption failed', 'error'); }
    finally { setRedeeming(false); }
  };

  if (!isLoggedIn) return (
    <div className="empty-state">
      <div className="empty-state-icon">🏆</div>
      <h2>Login to see your rewards</h2>
      <p>Earn points on every order and unlock exclusive perks</p>
      <Link to="/login" className="btn-primary">Login Now</Link>
    </div>
  );

  if (!data) return <div className="loading-container"><div className="spinner" /></div>;

  const meta          = LEVEL_META[data.level] || LEVEL_META.Bronze;
  const nextThreshold = meta.next;
  const progress      = Math.min((data.total_earned / nextThreshold) * 100, 100);
  const canRedeem     = data.points >= 100;

  return (
    <div className="static-page">
      {/* Hero */}
      <div className="static-hero">
        <h1>🏆 Loyalty Points</h1>
        <p>Earn points on every order and redeem for exclusive discounts</p>
      </div>

      <div className="loyalty-wrap">

        {/* ── Level card ── */}
        <div className="loyalty-level-card" style={{ background: meta.bg }}>
          <div className="loyalty-level-icon">{meta.icon}</div>
          <div className="loyalty-level-name">{data.level} Member</div>
          <div className="loyalty-points-big">{data.points} <span>pts</span></div>
          <div className="loyalty-discount-val">= ₹{data.discount_value} discount available</div>

          {/* Progress bar */}
          <div className="loyalty-progress-wrap">
            <div className="loyalty-progress-bar">
              <div className="loyalty-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="loyalty-progress-label">
              {data.total_earned} / {nextThreshold} pts to next level
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="loyalty-stats">
          {[
            { icon: '⭐', label: 'Current Points', value: data.points },
            { icon: '📈', label: 'Total Earned',   value: data.total_earned },
            { icon: '💸', label: 'Total Redeemed', value: data.total_redeemed || 0 },
            { icon: '💰', label: 'Discount Value', value: `₹${data.discount_value}` },
          ].map(s => (
            <div key={s.label} className="loyalty-stat-card">
              <div className="loyalty-stat-icon">{s.icon}</div>
              <div className="loyalty-stat-value">{s.value}</div>
              <div className="loyalty-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="loyalty-panels">

          {/* ── How to earn ── */}
          <div className="loyalty-panel">
            <div className="loyalty-panel-title">💡 How to Earn Points</div>
            {HOW_TO_EARN.map(({ icon, label, pts }) => (
              <div key={label} className="loyalty-earn-row">
                <div className="loyalty-earn-left">
                  <span className="loyalty-earn-icon">{icon}</span>
                  <span className="loyalty-earn-label">{label}</span>
                </div>
                <span className="loyalty-earn-pts">{pts}</span>
              </div>
            ))}
          </div>

          {/* ── Redeem ── */}
          <div className="loyalty-panel">
            <div className="loyalty-panel-title">🎁 Redeem Points</div>
            <div className="loyalty-redeem-info">
              <div className="loyalty-redeem-rate">
                <span className="loyalty-redeem-num">100 pts</span>
                <span className="loyalty-redeem-eq">=</span>
                <span className="loyalty-redeem-val">₹10 OFF</span>
              </div>
              <p className="loyalty-redeem-sub">Applied automatically on your next order at checkout</p>
            </div>

            <div className="loyalty-redeem-balance">
              <span>Available balance</span>
              <span className="loyalty-redeem-balance-val">{data.points} pts</span>
            </div>

            <button
              className={`loyalty-redeem-btn ${!canRedeem ? 'disabled' : ''}`}
              onClick={redeem}
              disabled={redeeming || !canRedeem}
            >
              {redeeming ? '⏳ Redeeming...' : canRedeem ? `Redeem 100 pts → ₹10 OFF` : `Need ${100 - data.points} more pts`}
            </button>

            {!canRedeem && (
              <div className="loyalty-redeem-hint">
                Earn {100 - data.points} more points to unlock redemption
              </div>
            )}
          </div>
        </div>

        {/* ── Level perks ── */}
        <div className="loyalty-panel" style={{ marginTop: 0 }}>
          <div className="loyalty-panel-title">🎖️ Level Perks</div>
          <div className="loyalty-levels-grid">
            {LEVEL_PERKS.map(l => (
              <div key={l.level} className={`loyalty-level-perk ${data.level === l.level ? 'current' : ''}`}>
                <div className="loyalty-level-perk-name">{l.level}</div>
                <div className="loyalty-level-perk-pts">{l.pts}</div>
                <div className="loyalty-level-perk-desc">{l.perk}</div>
                {data.level === l.level && <div className="loyalty-current-tag">Your Level</div>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
