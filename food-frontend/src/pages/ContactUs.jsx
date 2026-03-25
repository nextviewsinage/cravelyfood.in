import { useState } from 'react';
import API from '../api/api';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post('contact/', form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>Contact Us</h1>
        <p>Have a question or feedback? We'd love to hear from you.</p>
      </div>
      <div className="static-content">
        <div className="contact-grid">
          {/* Info */}
          <div className="contact-info-col">
            {[
              { icon: '📧', label: 'Email', value: 'support@fooddelivery.in' },
              { icon: '📞', label: 'Phone', value: '+9163-5420-3030 (9AM–11PM)' },
              { icon: '📍', label: 'Address', value: '123 Tech Park, Ahmedabad, Gujart, 382421' },
              { icon: '⏰', label: 'Support Hours', value: 'Monday – Sunday, 9AM to 11PM IST' },
            ].map((c) => (
              <div key={c.label} className="contact-info-card">
                <div className="contact-icon">{c.icon}</div>
                <div>
                  <div className="contact-label">{c.label}</div>
                  <div className="contact-value">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="static-card contact-form-card">
            {sent ? (
              <div className="contact-sent">
                <div className="contact-sent-icon">✅</div>
                <h3 className="contact-sent-title">Message Sent!</h3>
                <p className="contact-sent-sub">We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="contact-sent-btn">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <h2 className="contact-form-title">Send a Message</h2>
                {error && <div className="contact-form-error">{error}</div>}
                <input className="form-input" placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className="form-input" type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input className="form-input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                <textarea className="form-input contact-textarea" placeholder="Your message..." rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                <button type="submit" disabled={loading} className="checkout-btn">
                  {loading ? 'Sending...' : 'Send Message 🚀'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="contact-map-wrap">
          <div className="contact-map-label">📍 Find Us Here</div>
          <iframe
            className="contact-map"
            title="Our Location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=72.4714%2C22.9734%2C72.6714%2C23.0734&layer=mapnik&marker=23.0225%2C72.5714"
            allowFullScreen
            loading="lazy"
          />
          <div className="contact-map-caption">
            123 Tech Park, Ahmedabad, Gujarat 382421
          </div>
        </div>

      </div>
    </div>
  );
}
