export default function TermsOfService() {
  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>Terms of Service</h1>
        <p>Last updated: March 1, 2026. Please read these terms carefully before using our platform.</p>
      </div>
      <div className="static-content">
        {[
          { title: '1. Acceptance of Terms', body: 'By accessing or using FoodDelivery, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.' },
          { title: '2. User Accounts', body: 'You must be 18 years or older to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.' },
          { title: '3. Ordering & Payment', body: 'All orders are subject to availability. Prices displayed are inclusive of applicable taxes. Payment must be completed at the time of ordering for online payments. COD orders must be paid in full upon delivery.' },
          { title: '4. Cancellations & Refunds', body: 'Orders may be cancelled within 2 minutes of placement. After this window, cancellations are subject to restaurant approval. Refunds for eligible cancellations are processed within 5-7 business days.' },
          { title: '5. Prohibited Conduct', body: 'You may not use our platform for any unlawful purpose, to submit false orders, to harass delivery partners, or to attempt to gain unauthorized access to our systems.' },
          { title: '6. Limitation of Liability', body: 'FoodDelivery is not liable for delays caused by restaurants, traffic, or weather conditions. Our maximum liability for any claim is limited to the value of the order in question.' },
          { title: '7. Changes to Terms', body: 'We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.' },
          { title: '8. Contact', body: 'For questions about these terms, contact legal@fooddelivery.in' },
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
