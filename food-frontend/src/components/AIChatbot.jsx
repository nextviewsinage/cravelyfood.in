import { useState, useEffect, useRef, useContext } from 'react';
import api from '../api/api';
import { CartContext } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const BACKEND = process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:8000'
  : (process.env.REACT_APP_API_URL || 'https://cravelyfood-in.onrender.com');

const FOOD_IMAGES = {
  'pizza':        'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=180&fit=crop',
  'burger':       'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=180&fit=crop',
  'biryani':      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=180&fit=crop',
  'dosa':         'https://images.unsplash.com/photo-1630383249896-424e482df921?w=300&h=180&fit=crop',
  'idli':         'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&h=180&fit=crop',
  'momos':        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&h=180&fit=crop',
  'noodles':      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=180&fit=crop',
  'paneer':       'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=180&fit=crop',
  'tikka':        'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=180&fit=crop',
  'samosa':       'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=180&fit=crop',
  'fries':        'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=180&fit=crop',
  'sandwich':     'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&h=180&fit=crop',
  'roll':         'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&h=180&fit=crop',
  'cake':         'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=180&fit=crop',
  'ice cream':    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=300&h=180&fit=crop',
  'gulab':        'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=180&fit=crop',
  'chai':         'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=180&fit=crop',
  'coffee':       'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=180&fit=crop',
  'lassi':        'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&h=180&fit=crop',
  'thali':        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=180&fit=crop',
  'default':      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=180&fit=crop',
};

function getFoodImg(food) {
  if (food.image) return food.image.startsWith('http') ? food.image : `${BACKEND}${food.image}`;
  const n = (food.name || '').toLowerCase();
  for (const [k, u] of Object.entries(FOOD_IMAGES)) {
    if (k !== 'default' && n.includes(k)) return u;
  }
  return FOOD_IMAGES.default;
}

// Mini food card inside chat
function ChatFoodCard({ food }) {
  const { addToCart } = useContext(CartContext);
  const { notify } = useNotification();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(food);
    notify(`🛒 ${food.name} added!`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: 150, flexShrink: 0,
    }}>
      <img src={getFoodImg(food)} alt={food.name}
        style={{ width: '100%', height: 90, objectFit: 'cover' }}
        onError={e => { e.target.src = FOOD_IMAGES.default; }} />
      <div style={{ padding: '8px 10px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.78rem', marginBottom: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {food.name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, color: '#ff5200', fontSize: '0.82rem' }}>
            ₹{food.surge_active ? food.dynamic_price : food.price}
          </span>
          <button onClick={handleAdd} style={{
            background: added ? '#48c479' : '#ff5200',
            color: '#fff', border: 'none', borderRadius: 6,
            padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700,
            cursor: 'pointer', transition: 'background 0.2s',
          }}>
            {added ? '✓' : '+Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Typing dots animation
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 14px',
      background: 'var(--bg, #f5f5f5)', borderRadius: '14px 14px 14px 4px',
      alignSelf: 'flex-start', width: 56 }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#ff5200',
          animation: `chatDot 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`
        @keyframes chatDot {
          0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const INIT_MSG = { from: 'bot', text: '👋 Hi! Main hoon tumhara AI Food Assistant 🤖\n\nPoocho kuch bhi:\n• "Spicy veg under ₹200"\n• "Mujhe pizza chahiye"\n• "Sasta khana dikhao"\n• "Bestsellers kya hain?"' };

const QUICK_REPLIES = ['🔥 Bestsellers', '💰 Under ₹100', '🌶️ Spicy food', '🍕 Pizza', '🍛 Biryani', '🥟 Momos', '🍰 Desserts'];

export default function AIChatbot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([INIT_MSG]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const [unread, setUnread]   = useState(0);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) { setUnread(0); inputRef.current?.focus(); }
  }, [open]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { from: 'user', text: msg }]);
    setTyping(true);

    try {
      const res = await api.post('ai/chatbot/', { message: msg });
      const { reply, foods, quick_replies } = res.data;
      setTyping(false);
      setMessages(prev => [...prev, {
        from: 'bot', text: reply,
        foods: foods || [],
        quickReplies: quick_replies || [],
      }]);
      if (!open) setUnread(u => u + 1);
    } catch {
      setTyping(false);
      setMessages(prev => [...prev, {
        from: 'bot',
        text: '😔 Kuch error aa gaya. Dobara try karo!',
      }]);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          position: 'fixed', bottom: 28, right: 88, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg,#6c3fff,#a855f7)',
          border: 'none', cursor: 'pointer', fontSize: '1.4rem',
          boxShadow: '0 4px 20px rgba(108,63,255,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="AI Food Assistant"
      >
        {open ? '✕' : '🤖'}
        {!open && unread > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ff5200', color: '#fff', borderRadius: '50%',
            width: 18, height: 18, fontSize: '0.65rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</div>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 88, zIndex: 9998,
          width: 340, height: 500,
          background: 'var(--card, #fff)',
          borderRadius: 20, boxShadow: '0 12px 50px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--border, #eee)',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg,#6c3fff,#a855f7)',
            padding: '14px 18px', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ fontSize: '1.6rem' }}>🤖</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>AI Food Assistant</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>
                <span style={{ display: 'inline-block', width: 7, height: 7,
                  borderRadius: '50%', background: '#4ade80', marginRight: 4 }} />
                Online — Ask me anything!
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 12px 4px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column',
                alignItems: m.from === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>

                {/* Text bubble */}
                <div style={{
                  background: m.from === 'user'
                    ? 'linear-gradient(135deg,#6c3fff,#a855f7)'
                    : 'var(--bg, #f5f5f5)',
                  color: m.from === 'user' ? '#fff' : 'var(--text, #222)',
                  padding: '9px 13px',
                  borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '0.82rem', maxWidth: '88%', lineHeight: 1.55,
                  whiteSpace: 'pre-line',
                }}>
                  {m.text}
                </div>

                {/* Food cards row */}
                {m.foods?.length > 0 && (
                  <div style={{
                    display: 'flex', gap: 8, overflowX: 'auto',
                    paddingBottom: 4, maxWidth: 310,
                    scrollbarWidth: 'none',
                  }}>
                    {m.foods.map(f => <ChatFoodCard key={f.id} food={f} />)}
                  </div>
                )}

                {/* Quick reply chips */}
                {m.quickReplies?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxWidth: 310 }}>
                    {m.quickReplies.map(qr => (
                      <button key={qr} onClick={() => send(qr)} style={{
                        background: '#fff', border: '1.5px solid #6c3fff',
                        color: '#6c3fff', borderRadius: 20, padding: '4px 10px',
                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                      }}>{qr}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {typing && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Quick reply chips at bottom */}
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto',
            padding: '6px 12px', borderTop: '1px solid var(--border2, #f0f0f0)',
            scrollbarWidth: 'none',
          }}>
            {QUICK_REPLIES.map(qr => (
              <button key={qr} onClick={() => send(qr)} style={{
                background: '#f5f0ff', border: '1px solid #d8b4fe',
                color: '#6c3fff', borderRadius: 20, padding: '4px 10px',
                fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{qr}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid var(--border2, #f0f0f0)',
            display: 'flex', gap: 8,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Kuch bhi poocho..."
              style={{
                flex: 1, padding: '9px 13px', borderRadius: 12,
                border: '1.5px solid var(--border, #ddd)', outline: 'none',
                fontSize: '0.82rem', background: 'var(--input-bg, #fafafa)',
                color: 'var(--text, #222)',
              }}
            />
            <button onClick={() => send()} style={{
              padding: '9px 14px',
              background: 'linear-gradient(135deg,#6c3fff,#a855f7)',
              color: '#fff', border: 'none', borderRadius: 12,
              cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
            }}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
