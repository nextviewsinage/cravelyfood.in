export default function AboutUs() {
  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>About Us</h1>
        <p>We're on a mission to deliver happiness, one meal at a time.</p>
      </div>
      <div className="static-content">
        <div className="static-card">
          <h2>🍽️ Who We Are</h2>
          <p>FoodDelivery is India's fastest-growing food delivery platform, connecting millions of hungry customers with thousands of restaurants across the country. Founded in 2020, we've served over 10 million orders and counting.</p>
        </div>
        <div className="static-card">
          <h2>🎯 Our Mission</h2>
          <p>To make great food accessible to everyone — delivered fresh, fast, and at the best price. We believe every meal should be an experience worth remembering.</p>
        </div>
        <div className="static-card">
          <h2>🚀 Our Vision</h2>
          <p>To be the most trusted food delivery platform in India, empowering local restaurants and delighting customers with every order.</p>
        </div>
        <div className="static-stats">
          <div className="stat-box"><div className="stat-num">10M+</div><div className="stat-label">Orders Delivered</div></div>
          <div className="stat-box"><div className="stat-num">500+</div><div className="stat-label">Restaurant Partners</div></div>
          <div className="stat-box"><div className="stat-num">50+</div><div className="stat-label">Cities</div></div>
          <div className="stat-box"><div className="stat-num">30 min</div><div className="stat-label">Avg Delivery Time</div></div>
        </div>
      </div>
    </div>
  );
}
