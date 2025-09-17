import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { ShoppingCart, User, LogOut, Wallet } from 'lucide-react';
import axios from 'axios';

function ClientMenu() {
  const [balance, setBalance] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Call API immediately and also on interval
  useEffect(() => {
    displayBalance();
    displayCartCount();
    const interval = setInterval(() => {
      displayCartCount();
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, []);

  const displayBalance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/client_balance");
      if (res.data.data !== "Failed") {
        setBalance(res.data.balance);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayCartCount = async () => {
    try {
      const res = await axios.get("http://localhost:5000/cart_count");
      if (res.data.data !== "Failed") {
        setCartCount(res.data.total);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Navbar expand="md" bg="light" className="shadow-sm" sticky="top">
      <Container>
        <Navbar.Brand href="/client/clienthome" className="fs-5 text-dark">
          Client Dashboard
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="client-navbar-nav" />
        <Navbar.Collapse id="client-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <NavLink
              to="/client/clienthome"
              className={({ isActive }) =>
                `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/client/see_cart"
              className={({ isActive }) =>
                `nav-link px-3 d-flex align-items-center gap-1 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
              }
            >
              <ShoppingCart size={16} />
              Cart
              {cartCount > 0 && (
                <span className="badge bg-danger ms-1">{cartCount}</span>
              )}
            </NavLink>

            <div className="nav-link px-3 d-flex align-items-center gap-1 text-dark" style={{ cursor: "default" }}>
              <Wallet size={16} />
              ₹{balance.toFixed(2)}
            </div>

            <NavLink
              to="/client/orders"
              className={({ isActive }) =>
                `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
              }
            >
              Orders
            </NavLink>

            <NavLink
              to="/client/edit_profile"
              className={({ isActive }) =>
                `nav-link px-3 d-flex align-items-center gap-1 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
              }
            >
              <User size={16} />
              Edit Profile
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) =>
                `nav-link px-3 d-flex align-items-center gap-1 ${isActive ? 'text-danger fw-bold border-bottom border-danger border-2' : 'text-dark'}`
              }
            >
              <LogOut size={16} />
              Logout
            </NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default ClientMenu;
