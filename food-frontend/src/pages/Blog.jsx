const posts = [
  { id: 1, title: 'Top 10 Biryani Spots in India', date: 'Mar 10, 2026', tag: 'Food Guide', emoji: '🍛', desc: 'From Hyderabadi dum biryani to Kolkata-style, we rank the best biryani restaurants you must try.' },
  { id: 2, title: 'How We Ensure Fresh Delivery Every Time', date: 'Feb 28, 2026', tag: 'Behind the Scenes', emoji: '🚀', desc: 'A look inside our delivery operations and how we maintain food quality from kitchen to doorstep.' },
  { id: 3, title: '5 Healthy Meal Options Under ₹200', date: 'Feb 15, 2026', tag: 'Health', emoji: '🥗', desc: 'Eating healthy doesn\'t have to be expensive. Here are our top picks for nutritious meals on a budget.' },
  { id: 4, title: 'Meet Our Restaurant Partners', date: 'Jan 30, 2026', tag: 'Partners', emoji: '🤝', desc: 'Stories from the passionate chefs and restaurant owners who make our platform special.' },
  { id: 5, title: 'New Feature: Real-Time Order Tracking', date: 'Jan 15, 2026', tag: 'Product', emoji: '📍', desc: 'We just launched live order tracking so you always know exactly where your food is.' },
  { id: 6, title: 'Street Food Secrets: Recipes from Top Chefs', date: 'Dec 20, 2025', tag: 'Recipes', emoji: '🌮', desc: 'Exclusive recipes from our partner chefs — recreate your favourite street food at home.' },
];

export default function Blog() {
  return (
    <div className="static-page">
      <div className="static-hero">
        <h1>Blog</h1>
        <p>Food stories, tips, and updates from the FoodDelivery team.</p>
      </div>
      <div className="static-content">
        <div className="blog-grid">
          {posts.map((p) => (
            <div key={p.id} className="blog-card">
              <div className="blog-emoji">{p.emoji}</div>
              <span className="blog-tag">{p.tag}</span>
              <h3 className="blog-title">{p.title}</h3>
              <p className="blog-desc">{p.desc}</p>
              <div className="blog-footer">
                <span className="blog-date">{p.date}</span>
                <span className="blog-read">Read more →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
