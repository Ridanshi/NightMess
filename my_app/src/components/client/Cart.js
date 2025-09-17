import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Button,
  Image,
  Card,
  Modal,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Cart.css";  // Import the CSS file
import ClientMenu from "./ClientMenu";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showLowBalanceModal, setShowLowBalanceModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    displayCart();
    displayBalance();
  }, []);

  const displayBalance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/client_balance");
      if (res.data.data !== "Failed") {
        setBalance(res.data.balance);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const displayCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/show_cartdata");
      if (res.data.data === "Failed") {
        setIsLoggedIn(false);
        setCart([]);
      } else {
        setIsLoggedIn(true);
        setCart(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
  if (newQuantity < 1) return;
  try {
    await axios.put("http://localhost:5000/update_cart_quantity", {
      id,
      quantity: newQuantity,
    });
    // Update local cart state immediately
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
    await axios.delete(`http://localhost:5000/remove_from_cart/${id}`);
    // Remove item from local cart state immediately
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  } catch (err) {
    console.log(err);
  }
};

const clearCart = async () => {
  try {
    await axios.delete("http://localhost:5000/clear_cart");
    // Clear local cart state immediately
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

  const handleCheckout = async () => {
    const total = getTotalPrice();
    if (balance < total) {
      setShowLowBalanceModal(true); // show low balance modal
      return;
    }

    try {
      await axios.post("http://localhost:5000/confirm_order", { cart });
      setShowModal(true);
      clearCart();
      displayBalance();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <ClientMenu />
      <Container className="mt-5 cart-container">
        {/* Add background elements */}
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
        
        {!isLoggedIn ? (
          <div className="text-center py-5">
            <h4>Please log in to view your cart.</h4>
            <Link to="/login" className="btn btn-primary mt-3">
              Go to Login
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
          <Row className="shadow p-3 my-4 bg-white">
            <Col lg={8}>
              <h2 className="mb-3">Your Food Cart</h2>
              <Row className="mb-2 text-muted fw-bold d-none d-md-flex">
                <Col md={5}>Food Details</Col>
                <Col md={2} className="text-center">
                  Quantity
                </Col>
                <Col md={2} className="text-center">
                  Price
                </Col>
                <Col md={3} className="text-center">
                  Total
                </Col>
              </Row>

              {cart.map((item) => (
                <Row
                  className="align-items-center border-bottom py-3 cart-item-row"
                  key={item._id}
                >
                  <Col md={5} className="d-flex">
                    <Image
                      src={`http://localhost:5000/public/images/${item.image}`}
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
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="mx-2 fw-bold">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
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
                  <Card.Title className="fs-4">Order Summary</Card.Title>
                  <hr />
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
                    Confirm Order
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      {/* ✅ Order Confirmation Modal */}
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

      {/* ❌ Low Balance Modal */}
      <Modal
        show={showLowBalanceModal}
        onHide={() => setShowLowBalanceModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Insufficient Balance</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <h5 className="text-danger">You don't have enough wallet balance.</h5>
          <p>Please add funds to your wallet or remove some items from your cart.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowLowBalanceModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Cart;