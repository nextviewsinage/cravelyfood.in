import { useState, useEffect, useRef } from 'react';
import api from '../api/api';

const GREETINGS = ['hi', 'hello', 'hey', 'hii', 'namaste'];
const KEYWORDS = {
  pizza: ['pizza', 'margherita', 'pepperoni'],
  burger: ['burger', 'sandwich', 'patty'],
  biryani: ['biryani', 'rice', 'pulao'],
  snacks: ['snack', 'fries', 'chips', 'samosa'],
  dessert: ['dessert', 'sweet', 'cake', 'ice cream', 'gulab'],
  drinks: ['drink', 'juice', 'cold drink', 'water', 'lassi'],
};

function getBotReply(msg, foods) {
  const lower = msg.toLowerCase();

  if (GREETINGS.some((g) => lower.includes(g)))
    return '👋 Hello! I\'m your food assistant. Ask me anything — "suggest pizza", "what\'s popular?", "show me biryani" etc.';

  if (lower.includes('popular') || lower.includes('bestseller') || lower.includes('best'))
    return `🔥 Our bestsellers: ${foods.filter((f) => f.is_bestseller).slice(0, 3).map((f) => f.name).join(', ') || 'Check our menu!'}`;

  if (lower.includes('cheap') || lower.includes('budget') || lower.includes('affordable')) {
    const cheap = [...foods].sort((a, b) => a.price - b.price).slice(0, 3);
    return `💰 Budget picks: ${cheap.map((f) => `${f.name} (₹${f.price})`).join(', ')}`;
  }

  if (lower.includes('veg') || lower.includes('vegetarian'))
    return `🥗 Veg options: ${foods.filter((f) => f.is_veg).slice(0, 4).map((f) => f.name).join(', ')}`;

  for (const [cat, keys] of Object.entries(KEYWORDS)) {
    if (keys.some((k) => lower.includes(k))) {
      const matches = foods.filter((f) => f.name.toLowerCase().includes(cat) || (f.category_name || '').toLowerCase().includes(cat));
      if (matches.length)
        return `🍽️ ${cat.charAt(0).toUpperCase() + cat.slice(1)} options: ${matches.slice(0, 3).map((f) => `${f.name} (₹${f.price})`).join(', ')}`;
    }
  }

  if (lower.includes('order') || lower.includes('cart'))
    return '🛒 Go to your cart to review items, or visit the menu to add more!';

  if (lower.includes('help'))
    return '💡 I can help with: food suggestions, veg options, budget picks, popular items. Just ask!';

  return `🤔 I'm not sure about that. Try asking: "suggest pizza", "veg options", "cheap food", or "bestsellers"!`;
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hi! I\'m your AI food assistant. What are you craving today?' }
  ]);
  const [input, setInput] = useState('');
  const [foods, setFoods] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('foods/').then((r) => setFoods(Array.isArray(r.data) ? r.data : (r.data.results || []))).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { from: 'user', text };
    const botMsg = { from: 'bot', text: getBotReply(text, foods) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff5200, #ff8c00)',
          border: 'none', cursor: 'pointer', fontSize: '1.5rem',
          boxShadow: '0 4px 20px rgba(255,82,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        title="AI Food Assistant"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 9998,
          width: 320, height: 420, background: 'var(--card)',
          borderRadius: 18, boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #ff5200, #ff8c00)', padding: '14px 18px', color: '#fff' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>🤖 AI Food Assistant</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: 2 }}>Ask me anything about food!</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start',
                background: m.from === 'user' ? '#ff5200' : 'var(--bg)',
                color: m.from === 'user' ? '#fff' : 'var(--text)',
                padding: '8px 12px', borderRadius: m.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                fontSize: '0.82rem', maxWidth: '85%', lineHeight: 1.5,
              }}>
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border2)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about food..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 10,
                border: '1.5px solid var(--border)', outline: 'none',
                fontSize: '0.82rem', background: 'var(--input-bg)', color: 'var(--text)',
              }}
            />
            <button
              onClick={send}
              style={{
                padding: '8px 14px', background: '#ff5200', color: '#fff',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontWeight: 700, fontSize: '0.85rem',
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
