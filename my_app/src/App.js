import 'bootstrap/dist/css/bootstrap.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

import AdminHome from './components/admin/AdminHome';
import Login from './components/Login';
import ChangePass from './components/ChangePass';
import Editprof from './components/admin/Editprof';
import AdminReg from './components/admin/AdminReg';
import ShowAdmins from './components/admin/ShowAdmins';
import Search from './components/Search';
import Signup from './components/Signup';
import VendorReg from './components/vendor/VendorReg';
import ShowVendors from './components/vendor/ShowVendors';
import EditVendor from './components/vendor/EditVendor';
import DeleteVendors from './components/vendor/DeleteVendors';
import VendorHome from './components/vendor/VendorHome';
import FoodReg from './components/vendor/FoodReg';
import Editprofvendor from './components/vendor/Editprofvendor';
import AvailableFood from './components/vendor/AvailableFood';

import ClientHome from './components/client/ClientHome';
import EditProfile from './components/client/EditProfile';
import Cart from './components/client/Cart';
import ShowClients from './components/client/ShowClients';
import RechargeClient from './components/client/RechargeClient';

import { CartProvider } from './components/client/CartContext';
import { FoodProvider } from './components/client/FoodContext';
import Orders from './components/client/Orders';
import ConfirmOrder from './components/vendor/ConfirmOrder';
import Footer from './components/Footer';

import NightmessSelection from './components/client/NightmessSelection';
import './App.css';

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('nightmess-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nightmess-theme', theme);
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}

// Layout component for client routes including Footer and Outlet for nested routes
function ClientLayout() {
  return (
    <>
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <FoodProvider>
      <CartProvider>
        <Router>
          <ThemeToggle />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/change_pass" element={<ChangePass />} />
            <Route path="/get_admin" element={<Editprof />} />
            <Route path="/search" element={<Search />} />

            {/* Admin Routes */}
            <Route path="/admin/adminhome" element={<AdminHome />} />
            <Route path="/admin/register_admin" element={<AdminReg />} />
            <Route path="/admin/show_admins" element={<ShowAdmins />} />
            <Route path="/admin/register_vendors" element={<VendorReg />} />
            <Route path="/edit-vendor/:email" element={<EditVendor />} />
            <Route path="/delete_vendors/:id" element={<DeleteVendors />} />
            <Route path="/admin/show_vendors" element={<ShowVendors />} />
            <Route path="/admin/edit_admin" element={<Editprof />} />

            {/* Vendor Routes */}
            <Route path="/vendor/vendorhome" element={<VendorHome />} />
            <Route path="/vendor/order_food" element={<FoodReg />} />
            <Route path="/vendor/orders" element={<ConfirmOrder />} />
            <Route path="/vendor/edit_vendor" element={<Editprofvendor />} />
            <Route path="/vendor/recharge_client" element={<RechargeClient />} />
            <Route path="/vendor/recharge_client/:client_email" element={<RechargeClient />} />
            <Route path="/vendor/avail_food" element={<AvailableFood />} />

            <Route path="/select-nightmess" element={<NightmessSelection />} />

            {/* Client Routes wrapped with ClientLayout */}
            <Route path="/client" element={<ClientLayout />}>
              {/* Redirect /client to /client/clienthome */}
              <Route index element={<Navigate to="clienthome" replace />} />
              <Route path="clienthome" element={<ClientHome />} />
              <Route path="edit_profile" element={<EditProfile />} />
              <Route path="see_cart" element={<Cart />} />
              <Route path="orders" element={<Orders />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </FoodProvider>
  );
}

export default App;
