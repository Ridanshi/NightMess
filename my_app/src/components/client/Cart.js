import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from 'axiosConfig';
import {
  Container,
  Row,
  Col,
  Button,
  Image,
  Card,
  Modal,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Cart.css";
import ClientMenu from "./ClientMenu";
import Loader from './Loader'; 

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [balance, setBalance] = useState(0);
  const [selectedVendorEmail, setSelectedVendorEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAndMess();
  }, []);

  useEffect(() => {
    if (selectedVendorEmail) {
      displayCart();
      displayBalance();
    }
  }, [selectedVendorEmail]);

  const checkUserAndMess = async () => {
    try {
      const res = await API.get("/isUser");
      if (res.data.usertype === "client" || res.data.usertype === "no user") {
        const messRes = await API.get("/get_selected_nightmess");
        if (messRes.data && messRes.data.vendorEmail) {
          setSelectedVendorEmail(messRes.data.vendorEmail);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoggedIn(false);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 50);
    }
  };

  const displayBalance = async () => {
    try {
      const res = await API.get("/client_balance");
      if (res.data.data !== "Failed") {
        setBalance(res.data.balance);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const displayCart = async () => {
    try {
      const res = await API.get("/show_cartdata");
      if (res.data.data === "Failed") {
        setIsLoggedIn(false);
        setCart([]);
      } else {
        setIsLoggedIn(true);
        
        const allCartItems = res.data;
        
        const foodPromises = allCartItems.map(async (item) => {
          try {
            const foodRes = await API.post("/get_foodname", {
              foodId: item.foodId
            });
            
            const foodItem = foodRes.data.find(f => f._id === item.foodId);
            
            return {
              ...item,
              vendor_email: foodItem?.vendor_email
            };
          } catch (err) {
            console.error("Error fetching food details:", err);
            return item;
          }
        });
        
        const cartWithVendors = await Promise.all(foodPromises);
        
        const filteredCart = cartWithVendors.filter(
          item => item.vendor_email === selectedVendorEmail
        );
        
        console.log(`Cart filtered: ${allCartItems.length} total items, ${filteredCart.length} from current mess`);
        setCart(filteredCart);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await API.put("/update_cart_quantity", {
        id,
        quantity: newQuantity,
      });
      setCart((prevCart) =>
        prevCart.map((item) =>
          item._id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await API.delete(`/remove_from_cart/${id}`);
      setCart((prevCart) => prevCart.filter((item) => item._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const clearCart = async () => {
    try {
      const itemsToDelete = cart.map(item => item._id);
      
      for (const itemId of itemsToDelete) {
        await API.delete(`/remove_from_cart/${itemId}`);
      }
      
      setCart([]);
    } catch (err) {
      console.log(err);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      return total + item.quantity * parseFloat(item.price);
    }, 0);
  };


  const handleWalletPayment = async () => {
    const total = getTotalPrice();
    
    if (balance < total) {
      alert(`Insufficient wallet balance. Available: ₹${balance}, Required: ₹${total.toFixed(2)}`);
      return;
    }

    try {
      await API.post("/confirm_order", { cart });
      setShowPaymentModal(false);
      setShowModal(true);
      clearCart();
      displayBalance();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.msg || 'Order confirmation failed. Please try again.');
    }
  };


  const handleCheckout = () => {
    setShowPaymentModal(true);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <ClientMenu />
      <Container className="mt-5 cart-container">
        {/* Background elements */}
        <div className="cart-bg-element-1"></div>
        <div className="cart-bg-element-2"></div>
        <div className="cart-bg-element-3"></div>
        <div className="cart-bg-element-4"></div>
        <div className="cart-bg-element-5"></div>
        <div className="cart-bg-element-6"></div>
        <div className="cart-bg-element-7"></div>
        <div className="cart-bg-element-8"></div>
        <div className="cart-bg-element-9"></div>
        <div className="cart-bg-element-10"></div>
        
        {!isLoggedIn || !selectedVendorEmail ? (
          <div className="text-center py-5">
            <Alert variant="warning">
              <h4>Please select a nightmess to view your cart</h4>
              <p>You need to select a nightmess before you can access your cart.</p>
            </Alert>
            <Link to="/select-nightmess" className="btn btn-primary mt-3">
              Select Nightmess
            </Link>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-5">
            <h4>Your cart is empty</h4>
            <Link to="/client" className="btn btn-primary mt-3">
              Browse Food Items
            </Link>
          </div>
        ) : (
          <>
            <Row className="shadow p-3 my-4 bg-white">
              <Col lg={8}>
                <h2 className="mb-3">Your Food Cart</h2>
                <Row className="mb-2 text-muted fw-bold d-none d-md-flex">
                  <Col md={5}>Food Details</Col>
                  <Col md={2} className="text-center">Quantity</Col>
                  <Col md={2} className="text-center">Price</Col>
                  <Col md={3} className="text-center">Total</Col>
                </Row>

                {cart.map((item) => (
                  <Row
                    className="align-items-center border-bottom py-3 cart-item-row"
                    key={item._id}
                  >
                    <Col md={5} className="d-flex">
                      <Image
                        src={`${process.env.REACT_APP_API_URL||""}/public/images/${item.image}`}
                        height="80"
                        width="80"
                        rounded
                      />
                      <div className="ms-3">
                        <div className="fw-bold">{item.foodname}</div>
                        <div className="small text-muted">{item.des}</div>
                      </div>
                    </Col>
                    <Col md={2} className="text-center">
                      <div className="d-flex justify-content-center align-items-center">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="mx-2 fw-bold">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={
                            item.availableQuantity !== undefined
                              ? item.quantity >= item.availableQuantity
                              : false
                          }
                        >
                          +
                        </Button>
                      </div>
                    </Col>
                    <Col md={2} className="text-center">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </Col>
                    <Col md={3} className="text-center">
                      ₹{(item.quantity * parseFloat(item.price)).toFixed(2)}
                      <div>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => removeFromCart(item._id)}
                          className="mt-2"
                        >
                          Remove
                        </Button>
                      </div>
                    </Col>
                  </Row>
                ))}

                <div className="mt-4 d-flex justify-content-between">
                  <Link to="/client" className="btn btn-outline-primary">
                    + Add More Food
                  </Link>
                  <Button variant="outline-danger" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </Col>

              <Col lg={4}>
                <Card className="p-3 shadow-sm order-summary-card">
                  <Card.Body>
                    <Card.Title className="fs-4 order-summary-title">Order Summary</Card.Title>
                    <hr />
                    
                    <div className="d-flex justify-content-between mt-2 mb-2">
                      <span>Wallet Balance</span>
                      <span className="text-success fw-bold">₹{balance.toFixed(2)}</span>
                    </div>
                    
                    <div className="d-flex justify-content-between mt-2 mb-2">
                      <span>Subtotal</span>
                      <span>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total</strong>
                      <strong>₹{getTotalPrice().toFixed(2)}</strong>
                    </div>
                    
                    <Button
                      variant="success"
                      className="w-100 mt-3"
                      onClick={handleCheckout}
                    >
                      Proceed to Payment
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>

      {/* Payment Modal */}
      <Modal 
        show={showPaymentModal} 
        onHide={() => setShowPaymentModal(false)} 
        centered
        dialogClassName="payment-modal-dialog"
        contentClassName="payment-modal-content"
      >
        <div className="payment-modal-header">
          <h3 className="payment-modal-title">Wallet Payment</h3>
          <button className="payment-modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
        </div>

        <div className="payment-modal-body">
          {/* Info Box */}
          <div className="payment-info-box">
            <div className="payment-info-row">
              <span className="payment-info-label">Order Total:</span>
              <span className="payment-info-value">₹{getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="payment-info-row">
              <span className="payment-info-label">Wallet Balance:</span>
              <span className="payment-wallet-balance">₹{balance.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay from Wallet Button */}
          <button
            className={`payment-btn payment-wallet-btn ${balance < getTotalPrice() ? 'payment-btn-disabled' : ''}`}
            onClick={handleWalletPayment}
            disabled={balance < getTotalPrice()}
          >
            <span className="payment-btn-icon">💳</span>
            <span className="payment-btn-text">Pay from Wallet</span>
            {balance < getTotalPrice() && (
              <span className="payment-insufficient-badge">Insufficient Balance</span>
            )}
          </button>

        </div>
      </Modal>

      {/* Order Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Confirmed</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h5 className="text-success">
            Your order has been placed successfully!
          </h5>
          <p>Thank you for ordering. Your food is being prepared and will be delivered soon.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            Continue Shopping
          </Button>
          <Link to="/client/orders" className="btn btn-success">
            Track Order
          </Link>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Cart;
