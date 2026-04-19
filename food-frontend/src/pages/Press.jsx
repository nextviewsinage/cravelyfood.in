const news = [
  { outlet: 'Economic Times', date: 'Mar 2026', headline: 'Cravely Food crosses 10 million orders milestone', logo: '📰' },
  { outlet: 'TechCrunch India', date: 'Jan 2026', headline: 'Cravely Food raises ₹500 Cr in Series B funding', logo: '💻' },
  { outlet: 'Business Standard', date: 'Nov 2025', headline: 'Cravely Food expands to 50 new cities across India', logo: '📊' },
  { outlet: 'YourStory', date: 'Sep 2025', headline: 'How Cravely Food is empowering local restaurant owners', logo: '🌟' },
];

export default function Press() {
  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>Press</h1>
        <p>Cravely Food in the news. For media inquiries, contact press@Cravely Food.in</p>
      </div>
      <div className="static-content">

        <div className="static-card" style={{ marginBottom: 32 }}>
          <h2>📬 Media Contact</h2>
          <p>For press releases, interviews, or media kits, reach out to our PR team at <strong>press@Cravely Food.in</strong></p>
        </div>

        <div className="press-section-title">Recent Coverage</div>
        <div className="press-grid">
          {news.map((n, i) => (
            <div key={i} className="press-card">
              <div className="press-logo">{n.logo}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="press-outlet">{n.outlet} <span className="press-date">• {n.date}</span></div>
                <div className="press-headline">"{n.headline}"</div>
              </div>
              <span className="press-link">Read →</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
