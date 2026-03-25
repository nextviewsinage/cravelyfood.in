import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useNotification } from '../context/NotificationContext';

const HOW_IT_WORKS = [
  { icon: '➕', title: 'Create a Group', desc: 'Start a group order and get a unique invite code' },
  { icon: '🔗', title: 'Share the Code', desc: 'Share the code with friends so they can join' },
  { icon: '🍽️', title: 'Everyone Adds Items', desc: 'Each person picks their own food from the menu' },
  { icon: '💸', title: 'Bill Split Auto', desc: 'The bill is split automatically among all members' },
];

export default function GroupOrder() {
  const { notify } = useNotification();
  const [tab, setTab]               = useState('create');
  const [groupName, setGroupName]   = useState('');
  const [joinCode, setJoinCode]     = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const [summary, setSummary]       = useState(null);
  const [foods, setFoods]           = useState([]);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    api.get('foods/').then(r => setFoods(Array.isArray(r.data) ? r.data : (r.data.results || []))).catch(() => {});
  }, []);

  const createGroup = async () => {
    if (!groupName.trim()) return notify('Enter a group name', 'error');
    try {
      const res = await api.post('group-orders/', { name: groupName });
      setActiveGroup(res.data); setTab('active');
      notify(`✅ Group created! Code: ${res.data.invite_code}`);
    } catch { notify('Failed to create group', 'error'); }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return notify('Enter invite code', 'error');
    try {
      const res = await api.get(`group-orders/join/${joinCode.toUpperCase()}/`);
      setActiveGroup(res.data); setTab('active');
      notify(`✅ Joined group: ${res.data.name}`);
    } catch { notify('Invalid or expired code', 'error'); }
  };

  const addItem = async (food) => {
    if (!activeGroup) return;
    try {
      await api.post(`group-orders/${activeGroup.id}/add_item/`, { food_item: food.id, quantity: 1 });
      notify(`${food.name} added to group order`);
      loadSummary();
    } catch { notify('Failed to add item', 'error'); }
  };

  const loadSummary = useCallback(async () => {
    if (!activeGroup) return;
    const res = await api.get(`group-orders/${activeGroup.id}/summary/`);
    setSummary(res.data);
  }, [activeGroup]);

  useEffect(() => { if (activeGroup) loadSummary(); }, [activeGroup, loadSummary]);

  const copyCode = () => {
    navigator.clipboard.writeText(activeGroup?.invite_code || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [['create', '➕ Create'], ['join', '🔗 Join'], ['active', '📋 Active']];

  return (
    <div className="static-page">
      {/* Hero */}
      <div className="static-hero">
        <h1>🤝 Group Order</h1>
        <p>Order together, split the bill automatically</p>
      </div>

      <div className="go-wrap">

        {/* How it works */}
        <div className="go-how-grid">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={i} className="go-how-card">
              <div className="go-how-icon">{s.icon}</div>
              <div className="go-how-title">{s.title}</div>
              <div className="go-how-desc">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="badges-tabs">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`badges-tab-btn ${tab === key ? 'active' : ''}`}
            >{label}</button>
          ))}
        </div>

        {/* ── CREATE ── */}
        {tab === 'create' && (
          <div className="go-panel">
            <div className="go-panel-title">Create a new group order</div>
            <div className="go-panel-sub">Give your group a name so friends know what it's for</div>
            <input
              className="form-input go-input"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Group name (e.g. Office Lunch, Birthday Party)"
              onKeyDown={e => e.key === 'Enter' && createGroup()}
            />
            <button className="go-action-btn" onClick={createGroup}>
              ➕ Create Group
            </button>
          </div>
        )}

        {/* ── JOIN ── */}
        {tab === 'join' && (
          <div className="go-panel">
            <div className="go-panel-title">Join with invite code</div>
            <div className="go-panel-sub">Ask the group creator for the 8-character invite code</div>
            <input
              className="form-input go-input"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. ABC12345)"
              maxLength={8}
              onKeyDown={e => e.key === 'Enter' && joinGroup()}
              className="form-input go-input go-join-input"
            />
            <button className="go-action-btn" onClick={joinGroup}>
              🔗 Join Group
            </button>
          </div>
        )}

        {/* ── ACTIVE ── */}
        {tab === 'active' && !activeGroup && (
          <div className="empty-state">
            <div className="empty-state-icon">🤝</div>
            <h2>No active group</h2>
            <p>Create a new group or join one with an invite code</p>
            <button className="btn-primary" onClick={() => setTab('create')}>Create Group</button>
          </div>
        )}

        {tab === 'active' && activeGroup && (
          <div className="go-active-wrap">

            {/* Group info banner */}
            <div className="go-group-banner">
              <div>
                <div className="go-group-name">{activeGroup.name}</div>
                <div className="go-group-sub">Share this code with your friends</div>
              </div>
              <div className="go-code-wrap">
                <div className="go-invite-code">{activeGroup.invite_code}</div>
                <button className="go-copy-btn" onClick={copyCode}>
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            {/* Bill split */}
            {summary && (
              <div className="go-panel">
                <div className="go-panel-title">💸 Bill Split</div>
                <div className="go-split-list">
                  {Object.entries(summary.split).map(([user, amt]) => (
                    <div key={user} className="go-split-row">
                      <div className="go-split-user">
                        <div className="go-split-avatar">{user[0]?.toUpperCase()}</div>
                        <span>{user}</span>
                      </div>
                      <span className="go-split-amt">₹{parseFloat(amt).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="go-split-total">
                  <span>Grand Total</span>
                  <span className="go-split-total-val">₹{summary.total}</span>
                </div>
              </div>
            )}

            {/* Add items */}
            <div className="go-panel">
              <div className="go-panel-title">🍽️ Add Your Items</div>
              <div className="go-panel-sub">Pick what you want — each person orders for themselves</div>
              <div className="go-food-grid">
                {foods.slice(0, 8).map(f => (
                  <div key={f.id} className="go-food-card">
                    <div className="go-food-name">{f.name}</div>
                    <div className="go-food-price">₹{f.price}</div>
                    <button className="go-add-btn" onClick={() => addItem(f)}>
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
