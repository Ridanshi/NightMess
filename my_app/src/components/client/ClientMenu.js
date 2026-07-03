import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { ShoppingCart, LogOut, Wallet, Store, Package, RefreshCw, Home } from 'lucide-react';
import API from 'axiosConfig';

function ClientMenu() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [messName, setMessName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientInitials, setClientInitials] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [walletMsg, setWalletMsg] = useState('');
  const [walletMsgType, setWalletMsgType] = useState('success');

  useEffect(() => {
    fetchClientProfile();
    displayBalance();
    displayCartCount();
    const interval = setInterval(() => {
      displayCartCount();
      displayBalance();
      fetchClientProfile();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchClientProfile = async () => {
    try {
      const res = await API.get("/get_client", {
        withCredentials: true
      });
      if (res.data && res.data.clientname) {
        setClientName(res.data.clientname);
        // Generate initials (first letter of each word, max 2)
        const names = res.data.clientname.trim().split(' ');
        const initials = names.length >= 2 
          ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
          : names[0].substring(0, 2).toUpperCase();
        setClientInitials(initials);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayBalance = async () => {
    try {
      const res = await API.get("/client_balance", {
        withCredentials: true
      });
      if (res.data.data !== "Failed") {
        setBalance(res.data.balance);
        setMessName(res.data.messname || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayCartCount = async () => {
    try {
      const res = await API.get("/cart_count", {
        withCredentials: true
      });
      if (res.data.data !== "Failed") {
        setCartCount(res.data.total);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileClick = () => {
    navigate('/client/edit_profile');
  };

  const handleWalletRequest = async (e) => {
    e.preventDefault();
    const amount = Number(requestAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setWalletMsgType('danger');
      setWalletMsg('Enter a valid recharge amount.');
      return;
    }

    try {
      const res = await API.post(
        "/request_recharge",
        { amount },
        { withCredentials: true }
      );

      setWalletMsgType(res.data.success ? 'success' : 'danger');
      setWalletMsg(res.data.msg || (res.data.success ? 'Recharge request sent.' : 'Unable to send request.'));

      if (res.data.success) {
        setRequestAmount('');
      }
    } catch (err) {
      setWalletMsgType('danger');
      setWalletMsg(err.response?.data?.msg || 'Unable to send request.');
    }
  };

  return (
    <>
      <Navbar expand="md" bg="light" className="shadow-sm" sticky="top">
        <Container>
          <Navbar.Brand href="/client/clienthome" className="fs-5 text-dark d-flex align-items-center gap-2">
            Client Dashboard
            {messName && (
              <span 
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '25px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  boxShadow: '0 3px 10px rgba(245, 158, 11, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.3s ease',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 5px 15px rgba(245, 158, 11, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 3px 10px rgba(245, 158, 11, 0.35)';
                }}
              >
                <Store size={13} strokeWidth={2.5} />
                {messName}
              </span>
            )}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="client-navbar-nav" />
          <Navbar.Collapse id="client-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <NavLink
                to="/client/clienthome"
                className={({ isActive }) =>
                  `nav-link px-3 d-flex align-items-center gap-1 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                <Home size={16} />
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

              <div
                className="nav-link px-3 d-flex align-items-center gap-2 text-dark"
                title="Request wallet recharge"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setWalletMsg('');
                  setShowWalletModal(true);
                }}
              >
                <Wallet size={16} strokeWidth={2} />
                <span>&#8377;{balance.toFixed(2)}</span>
              </div>

              <NavLink
                to="/client/orders"
                className={({ isActive }) =>
                  `nav-link px-3 d-flex align-items-center gap-1 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                <Package size={16} />
                Orders
              </NavLink>

              <NavLink
                to="/select-nightmess"
                className={({ isActive }) =>
                  `nav-link px-3 d-flex align-items-center gap-1 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                <RefreshCw size={16} />
                Change Mess
              </NavLink>

              {/* Profile Badge with Name - Clickable */}
              {clientInitials && (
                <div 
                  onClick={handleProfileClick}
                  className="nav-link px-3 d-flex align-items-center gap-2"
                  style={{ cursor: 'pointer' }}
                  title={`Edit Profile`}
                >
                  <div 
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      letterSpacing: '1px',
                      boxShadow: '0 3px 10px rgba(245, 158, 11, 0.4)',
                      transition: 'all 0.3s ease',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(245, 158, 11, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(245, 158, 11, 0.4)';
                    }}
                  >
                    {clientInitials}
                  </div>
                  <span className="text-dark" style={{ whiteSpace: 'nowrap' }}>
                    {clientName}
                  </span>
                </div>
              )}

              {/* Logout - Icon Only */}
              <NavLink
                to="/login"
                className="nav-link px-3 d-flex align-items-center text-dark"
                title="Logout"
              >
                <LogOut size={18} />
              </NavLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Modal show={showWalletModal} onHide={() => setShowWalletModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Wallet Recharge Request</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleWalletRequest}>
          <Modal.Body>
            {walletMsg && (
              <Alert variant={walletMsgType} className="mb-3">
                {walletMsg}
              </Alert>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Selected Mess</Form.Label>
              <Form.Control value={messName || 'Select a mess first'} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Current Balance</Form.Label>
              <Form.Control value={`\u20B9${balance.toFixed(2)}`} disabled />
            </Form.Group>
            <Form.Group>
              <Form.Label>Request Amount (&#8377;)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                step="0.01"
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                placeholder="Enter amount"
                disabled={!messName}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowWalletModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!messName}>
              Send Request
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default ClientMenu;
