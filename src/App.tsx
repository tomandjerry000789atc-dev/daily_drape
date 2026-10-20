import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StoreLayout from "./components/layout/StoreLayout";
import { RequireAuth, RequireRole } from "./components/auth/Guards";
import { attachAuthListener } from "./store/authStore";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import NotFound from "./pages/NotFound";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import AccountLayout from "./pages/account/AccountLayout";
import Profile from "./pages/account/Profile";
import Addresses from "./pages/account/Addresses";

import About from "./pages/info/About";
import Contact from "./pages/info/Contact";
import FAQ from "./pages/info/FAQ";
import Shipping from "./pages/info/Shipping";
import Returns from "./pages/info/Returns";
import Privacy from "./pages/info/Privacy";
import Terms from "./pages/info/Terms";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";

import DeliveryLogin from "./pages/delivery/DeliveryLogin";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";

export default function App() {
  useEffect(() => {
    attachAuthListener();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Storefront */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route
            path="/checkout"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/order-confirmation/:id"
            element={
              <RequireAuth>
                <OrderConfirmation />
              </RequireAuth>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <RequireAuth>
                <OrderDetail />
              </RequireAuth>
            }
          />

          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Profile />} />
            <Route path="addresses" element={<Addresses />} />
          </Route>

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>

        {/* Auth (no header/footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <RequireRole roles={["admin"]}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* Delivery */}
        <Route path="/delivery/login" element={<DeliveryLogin />} />
        <Route
          path="/delivery"
          element={
            <RequireRole roles={["delivery"]}>
              <DeliveryDashboard />
            </RequireRole>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
