import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import TrackOrder from "./pages/TrackOrder";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import OrderSuccess from "./pages/OrderSuccess";
import BillSplit from "./pages/BillSplit";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import Press from "./pages/Press";
import InvestorRelations from "./pages/InvestorRelations";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import AIChatbot from "./components/AIChatbot";
import WhatsAppOrder from "./components/WhatsAppOrder";
import Loyalty from "./pages/Loyalty";
import GroupOrderPage from "./pages/GroupOrder";
import Subscription from "./pages/Subscription";
import Referral from "./pages/Referral";
import VideoFeed from "./pages/VideoFeed";
import Grocery from "./pages/Grocery";
import Badges from "./pages/Badges";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/track/:id" element={<TrackOrder />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/bill-split" element={<BillSplit />} />
        <Route path="/delivery" element={<DeliveryDashboard />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/press" element={<Press />} />
        <Route path="/investor-relations" element={<InvestorRelations />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/loyalty" element={<Loyalty />} />
        <Route path="/group-order" element={<GroupOrderPage />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/videos" element={<VideoFeed />} />
        <Route path="/grocery" element={<Grocery />} />
        <Route path="/badges" element={<Badges />} />
      </Routes>
      <Footer />
      <AIChatbot />
      <WhatsAppOrder compact={true} />
    </BrowserRouter>
  );
}

export default App;
