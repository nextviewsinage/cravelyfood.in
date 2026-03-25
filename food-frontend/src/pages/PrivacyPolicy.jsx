export default function PrivacyPolicy() {
  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>Privacy Policy</h1>
        <p>Last updated: March 1, 2026</p>
      </div>
      <div className="static-content">
        {[
          { title: '1. Information We Collect', body: 'We collect information you provide directly — name, phone number, email, and delivery address when you register or place an order. We also collect usage data such as pages visited, orders placed, and device information to improve our service.' },
          { title: '2. How We Use Your Information', body: 'Your information is used to process orders, send delivery updates, improve our platform, and send promotional offers (only if you opt in). We never sell your personal data to third parties.' },
          { title: '3. Data Security', body: 'We use industry-standard encryption (SSL/TLS) to protect your data in transit. Payment information is processed through PCI-DSS compliant payment gateways and is never stored on our servers.' },
          { title: '4. Cookies', body: 'We use cookies to keep you logged in, remember your cart, and analyze site traffic. You can disable cookies in your browser settings, though some features may not work correctly.' },
          { title: '5. Third-Party Services', body: 'We use trusted third-party services for payments, maps, and analytics. These services have their own privacy policies and we encourage you to review them.' },
          { title: '6. Your Rights', body: 'You have the right to access, correct, or delete your personal data at any time. Contact us at privacy@fooddelivery.in to exercise these rights.' },
          { title: '7. Contact Us', body: 'For privacy-related queries, email us at privacy@fooddelivery.in or write to: FoodDelivery Pvt. Ltd., 123 Tech Park, Bangalore, Karnataka 560001.' },
        ].map((s) => (
          <div key={s.title} className="static-card">
            <h2>{s.title}</h2>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
