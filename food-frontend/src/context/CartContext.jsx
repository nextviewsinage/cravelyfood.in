import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount }

  const addToCart = (item) => {
    const exists = cart.find((i) => i.id === item.id);
    if (exists) {
      setCart(cart.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

  const increaseQty = (id) =>
    setCart(cart.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item));

  const decreaseQty = (id) =>
    setCart(
      cart.map((item) => item.id === id ? { ...item, qty: item.qty - 1 } : item)
          .filter((item) => item.qty > 0)
    );

  const applyCoupon = (code, discount) => setAppliedCoupon({ code, discount });
  const removeCoupon = () => setAppliedCoupon(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  // Keep backward compat — total = subtotal (GST calculated in pages)
  const total = subtotal;

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, increaseQty, decreaseQty,
      total, subtotal,
      appliedCoupon, applyCoupon, removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
};
