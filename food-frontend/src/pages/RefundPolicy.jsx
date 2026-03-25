export default function RefundPolicy() {
  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>Refund Policy</h1>
        <p>We want you to be 100% satisfied. Here's how our refund process works.</p>
      </div>
      <div className="static-content">
        {[
          { title: '✅ Eligible Refund Cases', body: 'You are eligible for a full refund if: your order was not delivered, the wrong items were delivered, the food quality was significantly below standard, or the restaurant cancelled your order.' },
          { title: '⏱ Refund Timeline', body: 'Online payments (UPI/Card): 5-7 business days back to original payment method. COD orders: Refund issued as wallet credits within 24 hours, usable on your next order.' },
          { title: '❌ Non-Refundable Cases', body: 'Refunds are not applicable if you ordered the wrong item, changed your mind after the 2-minute cancellation window, or provided an incorrect delivery address.' },
          { title: '📋 How to Request a Refund', body: '1. Go to Orders page\n2. Select the order\n3. Click "Report an Issue"\n4. Describe the problem and submit\nOur team will review and respond within 24 hours.' },
          { title: '📞 Need Help?', body: 'Contact our support team at support@fooddelivery.in or call 1800-123-4567 (9AM–11PM daily).' },
        ].map((s) => (
          <div key={s.title} className="static-card">
            <h2>{s.title}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
