const faqs = [
  { q: 'How do I track my order?', a: 'Go to Orders page and click "Track Order" on any active order. You\'ll see real-time status updates.' },
  { q: 'What is the delivery time?', a: 'Average delivery time is 30 minutes. It may vary based on your location and restaurant preparation time.' },
  { q: 'How do I cancel an order?', a: 'Orders can be cancelled within 2 minutes of placing. Go to Orders → Select order → Cancel. After 2 minutes, contact support.' },
  { q: 'What payment methods are accepted?', a: 'We accept Cash on Delivery (COD), UPI, Debit/Credit Cards, and Net Banking.' },
  { q: 'How do I get a refund?', a: 'Refunds are processed within 5-7 business days for online payments. COD refunds are issued as wallet credits.' },
  { q: 'My food arrived cold/wrong. What do I do?', a: 'Contact us immediately via the Help Center. We\'ll arrange a replacement or full refund.' },
];

export default function HelpCenter() {
  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>Help Center</h1>
        <p>We're here to help. Find answers to common questions below.</p>
      </div>
      <div className="static-content">
        <div className="static-card" style={{ marginBottom: 32, background: '#fff7f0', border: '1px solid #ffe0cc' }}>
          <h2>📞 Contact Support</h2>
          <p>Can't find your answer? Reach us at <strong>support@Cravely Food.in</strong> or call <strong>1800-123-4567</strong> (9AM–11PM)</p>
        </div>
        <div className="press-section-title">Frequently Asked Questions</div>
        <div className="faq-grid">
          {faqs.map((f, i) => (
            <div key={i} className="faq-card">
              <div className="faq-q">❓ {f.q}</div>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
