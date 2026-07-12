import React, { useEffect, useState, useRef } from "react";
import API from 'axiosConfig';
import { Container, Row, Col, Card, Image, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import ClientMenu from "./ClientMenu";
import './Orders.css';
import Loader from './Loader';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);

  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchOrders = async () => {
    try {
      const userOrdersRes = await API.get("/show_orders", {
        withCredentials: true
      });

      if (userOrdersRes.data.data === "Failed") {
        setIsLoggedIn(false);
        setOrders([]);
      } else {
        const sortedUserOrders = userOrdersRes.data.sort((a, b) => {
          const timeA = new Date(a.createdAt || a._id);
          const timeB = new Date(b.createdAt || b._id);
          return timeB - timeA;
        });

        setOrders(sortedUserOrders);
      }
    } catch (error) {
      if (error.response?.status === 401) {
      console.log('Session not ready, will retry in 10 seconds...');
      return; // Don't log error, just skip this poll
      }
    console.error(error);
    } finally {
      // ✅ Add 1 second delay before hiding loader
      setTimeout(() => {
        setLoading(false);
      }, 50);
    }
  };

  useEffect(() => {
    fetchOrders();
    pollingRef.current = setInterval(fetchOrders, 10000);
    return () => clearInterval(pollingRef.current);
  }, []);

  const groupOrdersByDate = (orders) => {
    const groups = {};
    orders.forEach((order) => {
      const dateStr = order.createdAt
        ? formatLocalDate(order.createdAt)
        : formatLocalDate(new Date(parseInt(order._id.substring(0, 8), 16) * 1000));
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(order);
    });
    return groups;
  };

  const groupedOrders = groupOrdersByDate(orders);

  const sortedGroupDates = Object.keys(groupedOrders).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  if (loading) {
    return <Loader />;
  }


  return (
    <>
      <ClientMenu />
      <div className="orders-bg-element-1"></div>
      <div className="orders-bg-element-2"></div>
      <div className="orders-bg-element-3"></div>
      <div className="orders-bg-element-4"></div>
      <div className="orders-bg-element-5"></div>
      <div className="orders-bg-element-6"></div>
      <div className="orders-bg-dots"></div>
      <div className="orders-bg-line-1"></div>
      <div className="orders-bg-line-2"></div>

      <Container className="orders-container mt-5">
        <h2 className="mb-4">Your Orders</h2>
        {!isLoggedIn ? (
          <Alert variant="warning" className="text-center">
            Please <Link to="/login">log in</Link> to view your orders.
          </Alert>
        ) : orders.length === 0 ? (
          <div className="text-center py-5">
            <h5>You haven't placed any orders yet.</h5>
            <Link to="/client" className="btn btn-primary mt-3">
              Browse Food Items
            </Link>
          </div>
        ) : (
          <>
            {sortedGroupDates.map((date) => {
              const ordersForDate = groupedOrders[date];

              return (
                <div key={date} className="date-section">
                  <h5>Orders for {date}</h5>
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {ordersForDate.map((order) => {
                      const displayOrderNumber =
                        order.status === "Confirmed" || order.status === "Ready"
                          ? order.orderNumber
                          : null;

                      return (
                        <Col key={order._id}>
                          <Card className="shadow-sm h-100">
                            <Card.Body>
                              <Row className="align-items-center">
                                <Col xs={12} className="text-center mb-2">
                                  {displayOrderNumber && (
                                    <strong>Order No.: {displayOrderNumber}</strong>
                                  )}
                                </Col>
                                <Col xs={12} className="text-center mb-2">
                                  <Image
                                    src={`${process.env.REACT_APP_API_URL||""}/public/images/${order.image}`}
                                    height="70"
                                    width="70"
                                    rounded
                                    alt={order.foodname}
                                    style={{ objectFit: "cover" }}
                                  />
                                </Col>
                                <Col xs={12} className="mb-2 text-center">
                                  <h5>{order.foodname}</h5>
                                  <small className="text-muted">{order.des}</small>
                                </Col>
                                <Col xs={4} className="text-center">
                                  <div>
                                    <strong>Qty</strong>
                                  </div>
                                  <div>{order.quantity}</div>
                                </Col>
                                <Col xs={4} className="text-center">
                                  <div>
                                    <strong>Price</strong>
                                  </div>
                                  <div>₹{parseFloat(order.price).toFixed(2)}</div>
                                </Col>
                                <Col xs={4} className="text-center">
                                  <div>
                                    <strong>Total</strong>
                                  </div>
                                  <div>
                                    ₹{(order.quantity * parseFloat(order.price)).toFixed(2)}
                                  </div>
                                </Col>
                                <Col xs={12} className="text-center mt-2">
                                  {order.status === "Confirmed" ? (
                                    order.estimatedTime ? (
                                      <span className="badge bg-warning">
                                        Food in making: {order.estimatedTime} min
                                      </span>
                                    ) : (
                                      <span className="badge bg-warning">Confirmed</span>
                                    )
                                  ) : order.status === "Ready" ? (
                                    <span className="badge bg-success">Ready</span>
                                  ) : (
                                    <span
                                      className={`badge ${order.status === "Rejected" ? "bg-danger" : "bg-info"}`}
                                    >
                                      {order.status}
                                    </span>
                                  )}
                                </Col>
                                <Col xs={12} className="text-center mt-2">
                                  <small>
                                    Order Time:{" "}
                                    {new Date(order.createdAt || order._id).toLocaleTimeString()}
                                  </small>
                                </Col>
                                <Col xs={12} className="text-center mt-1">
                                  <small className="text-muted">
                                    <strong>{order.messname || 'Mess Name Not Available'}</strong>
                                  </small>
                                </Col>
                                <Col xs={12} className="text-center">
                                  <small className="text-muted">
                                    📍 {order.vendor_address || 'Address Not Available'}
                                  </small>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              );
            })}
          </>
        )}
      </Container>
    </>
  );
};

export default Orders;