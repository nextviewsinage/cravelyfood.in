import { useEffect, useState } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const HOW_STEPS = [
  'Share your code with friends',
  'Friend signs up & applies your code',
  'Both get ₹100 as loyalty points instantly!',
];

export default function Referral() {
  const { isLoggedIn } = useAuth();
  const { notify } = useNotification();
  const [data, setData] = useState(null);
  const [applyCode, setApplyCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.get('referral/').then(r => setData(r.data)).catch(() => {});
  }, [isLoggedIn]);

  const copy = () => {
    navigator.clipboard.writeText(data?.code || '');
    setCopied(true);
    notify('Referral code copied! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const apply = async () => {
    if (!applyCode.trim()) return;
    try {
      const res = await api.post('referral/', { code: applyCode.trim() });
      notify(res.data.message || 'Referral applied!');
      setApplyCode('');
    } catch (e) {
      notify(e.response?.data?.error || 'Failed to apply', 'error');
    }
  };

  if (!isLoggedIn) return (
    <div className="empty-state ref-login-nudge">
      <div className="empty-state-icon">🎁</div>
      <h2>Login to access referrals</h2>
      <p>Sign in to get your referral code and earn rewards</p>
    </div>
  );

  return (
    <div className="static-page">

      {/* Hero */}
      <div className="static-hero">
        <h1>🤝 Refer &amp; Earn</h1>
        <p>Invite friends, both get ₹100 bonus!</p>
      </div>

      <div className="ref-page">

      {/* Referral code card */}
      <div className="ref-code-card">
        <div className="ref-code-label">Your Referral Code</div>
        <div className="ref-code-value">{data?.code || '------'}</div>
        <div className="ref-code-count">
          {data?.referrals || 0} friends referred so far
        </div>
        <button className="ref-copy-btn" onClick={copy}>
          {copied ? '✅ Copied!' : '📋 Copy Code'}
        </button>
      </div>

      {/* How it works */}
      <div className="ref-panel">
        <div className="ref-panel-title">How it works</div>
        <div className="ref-steps">
          {HOW_STEPS.map((step, i) => (
            <div key={i} className="ref-step">
              <div className="ref-step-num">{i + 1}</div>
              <span className="ref-step-text">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Apply code */}
      <div className="ref-panel">
        <div className="ref-panel-title">Apply a referral code</div>
        <div className="ref-apply-row">
          <input
            className="form-input ref-apply-input"
            value={applyCode}
            onChange={e => setApplyCode(e.target.value.toUpperCase())}
            placeholder="Enter friend&apos;s code"
            onKeyDown={e => e.key === 'Enter' && apply()}
          />
          <button className="ref-apply-btn" onClick={apply}>Apply</button>
        </div>
      </div>

      {/* Stats row */}
      <div className="ref-stats">
        <div className="ref-stat-card">
          <div className="ref-stat-icon">👥</div>
          <div className="ref-stat-val">{data?.referrals || 0}</div>
          <div className="ref-stat-label">Friends Referred</div>
        </div>
        <div className="ref-stat-card">
          <div className="ref-stat-icon">💰</div>
          <div className="ref-stat-val">₹{(data?.referrals || 0) * 100}</div>
          <div className="ref-stat-label">Total Earned</div>
        </div>
        <div className="ref-stat-card">
          <div className="ref-stat-icon">🎁</div>
          <div className="ref-stat-val">₹100</div>
          <div className="ref-stat-label">Per Referral</div>
        </div>
      </div>

      </div>
    </div>
  );
}
