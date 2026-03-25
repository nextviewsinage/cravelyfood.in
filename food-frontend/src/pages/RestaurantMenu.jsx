import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  // Temporary Dummy Restaurants + Menu Data
  const restaurants = [
    {
      id: 1,
      name: "Pizza House",
      image: "/images/pizza.jpg",
      rating: 4.5,
      menu: [
        { id: 1, name: "Cheese Pizza", price: 199, img: "/images/pizza.jpg" },
        { id: 2, name: "Veg Pizza", price: 249, img: "/images/pizza.jpg" },
        { id: 3, name: "Paneer Pizza", price: 299, img: "/images/pizza.jpg" },
      ],
    },
    {
      id: 2,
      name: "Burger King",
      image: "/images/burger.jpg",
      rating: 4.2,
      menu: [
        { id: 1, name: "Veg Burger", price: 99, img: "/images/burger.jpg" },
        { id: 2, name: "Cheese Burger", price: 149, img: "/images/burger.jpg" },
      ],
    },
    {
      id: 3,
      name: "Biryani Hub",
      image: "/images/biryani.jpg",
      rating: 4.7,
      menu: [
        { id: 1, name: "Chicken Biryani", price: 199, img: "/images/biryani.jpg" },
        { id: 2, name: "Hyderabadi Biryani", price: 249, img: "/images/biryani.jpg" },
      ],
    },
  ];

  const restaurant = restaurants.find((r) => r.id === Number(id));

  if (!restaurant) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '1.5rem', color: '#666' }}>
        <h2>Restaurant Not Found</h2>
        <button
          onClick={() => navigate('/')}
          style={{
            background: '#ef4444',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            marginTop: '16px',
            fontSize: '1rem',
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="px-6">
      {/* Restaurant Header */}
      <div style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        marginTop: '32px',
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}>
        <img
          src={restaurant.image}
          alt={restaurant.name}
          style={{
            height: '128px',
            width: '128px',
            objectFit: 'cover',
            borderRadius: '12px',
          }}
        />
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{restaurant.name}</h1>
          <p style={{ color: '#666', marginTop: '8px', fontSize: '1.1rem' }}>⭐ {restaurant.rating} Rating</p>
        </div>
      </div>

      {/* Menu Items */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginTop: '32px', marginBottom: '16px' }}>Menu Items</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
      }}>
        {restaurant.menu.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img
              src={item.img}
              alt={item.name}
              style={{
                height: '160px',
                width: '100%',
                objectFit: 'cover',
                borderRadius: '12px',
              }}
            />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '12px' }}>{item.name}</h3>
            <p style={{ color: '#111', fontSize: '1.125rem', fontWeight: 'bold', marginTop: '8px' }}>₹{item.price}</p>

            <button
              onClick={() => addToCart(item)}
              style={{
                background: '#ef4444',
                color: 'white',
                width: '100%',
                marginTop: '12px',
                padding: '8px 0',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'background 0.3s ease',
              }}
              onMouseEnter={(e) => e.target.style.background = '#dc2626'}
              onMouseLeave={(e) => e.target.style.background = '#ef4444'}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;
