import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Image, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import ClientMenu from "./ClientMenu";
import './Orders.css'; // Import the minimal CSS
import { calculateGlobalOrderNumbersForDate } from "../vendor/OrderUtils"; // Adjust path if needed

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for numbering
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const pollingRef = useRef(null);

  // Format Date to local YYYY-MM-DD string
  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchOrders = async () => {
    try {
      // Fetch user's orders
      const userOrdersRes = await axios.get("http://localhost:5000/show_orders");

      // Fetch all orders (for global numbering) - same endpoint as vendor uses
      const allOrdersRes = await axios.get("http://localhost:5000/show_orders_vendor");

      if (userOrdersRes.data.data === "Failed") {
        setIsLoggedIn(false);
        setOrders([]);
        setAllOrders([]);
      } else {
        // Sort user orders by creation timestamp (newest first for display)
        const sortedUserOrders = userOrdersRes.data.sort((a, b) => {
          const timeA = new Date(a.createdAt || a._id);
          const timeB = new Date(b.createdAt || b._id);
          return timeB - timeA; // Newest first for display
        });

        // Store all orders for global numbering calculation
        const filteredAllOrders = allOrdersRes.data.filter(
          (o) =>
            o.status === "Confirmed" ||
            o.status === "Ready" ||
            o.status === "Pending" ||
            o.status === "Rejected"
        );

        setOrders(sortedUserOrders);
        setAllOrders(filteredAllOrders);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
    pollingRef.current = setInterval(fetchOrders, 10000);
    return () => clearInterval(pollingRef.current);
  }, []);

  // Group orders by creation date
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

  // Use imported utility for consistent global order number calculation
  const calculateGlobalOrderNumbers = (date) =>
    calculateGlobalOrderNumbersForDate(allOrders, date, formatLocalDate);

  const groupedOrders = groupOrdersByDate(orders);

  // Sort dates descending (newest dates first)
  const sortedGroupDates = Object.keys(groupedOrders).sort(
    (a, b) => new Date(b) - new Date(a)
  );

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
              const globalOrderNumberMap = calculateGlobalOrderNumbers(date);

              return (
                <div key={date} className="date-section">
                  <h5>Orders for {date}</h5>
                  <Row xs={1} md={2} lg={3} className="g-4">
                    {ordersForDate.map((order) => {
                      // Show GLOBAL display order number only if confirmed or ready
                      const displayOrderNumber =
                        order.status === "Confirmed" || order.status === "Ready"
                          ? globalOrderNumberMap[order._id]
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
                                    src={`http://localhost:5000/public/images/${order.image}`}
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
                                      className={`badge ${
                                        order.status === "Rejected" ? "bg-danger" : "bg-info"
                                      }`}
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
