import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Alert,
  Form,
  Modal,
} from "react-bootstrap";
import VendorMenu from "./VendorMenu";
import { calculateGlobalOrderNumbersForDate } from "./OrderUtils";

const styles = `
.equal-height-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.equal-height-card .card-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
`;

function ConfirmOrder() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [orderToRemove, setOrderToRemove] = useState(null);
  const [orderToRemoveDisplayNumber, setOrderToRemoveDisplayNumber] = useState(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [estimatedTimeInput, setEstimatedTimeInput] = useState("");

  // Format Date to local YYYY-MM-DD string (same as Orders.js)
  const formatLocalDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Inject CSS once
  useEffect(() => {
    if (!document.getElementById("equal-height-css")) {
      const styleSheet = document.createElement("style");
      styleSheet.type = "text/css";
      styleSheet.id = "equal-height-css";
      styleSheet.innerText = styles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/show_orders_vendor");
      if (res.data.data === "Failed") {
        setError("Please log in to view orders.");
        setOrders([]);
      } else {
        const filteredOrders = res.data.filter(
          (o) => ["Confirmed", "Ready", "Pending", "Rejected"].includes(o.status)
        );
        setOrders(filteredOrders);
        setError("");
      }
    } catch {
      setError("Something went wrong while fetching orders.");
    }
  };

const confirmOrder = async (orderId) => {
  try {
    // ✅ STEP 1: Update UI INSTANTLY (user sees immediate feedback)
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, status: "Confirmed" }
          : order
      )
    );
    
    // ✅ STEP 2: Show modal INSTANTLY (no waiting)
    setCurrentOrderId(orderId);
    setEstimatedTimeInput("");
    setShowTimeModal(true);
    
    // ✅ STEP 3: Update server in BACKGROUND
    await axios.put("http://localhost:5000/confirm_order_status", { id: orderId });
    
    // ✅ STEP 4: Silently refetch in background to get authoritative data
    fetchOrders(); // No await - runs in background!
    
    setError("");
  } catch (error) {
    // ❌ On error, definitely refetch to fix UI
    await fetchOrders();
    if (error.response) {
      setError(`Failed to confirm order: ${error.response.data.msg || error.message}`);
    } else {
      setError(`Failed to confirm order: ${error.message}`);
    }
  }
};

const handleSetTime = async () => {
  if (!estimatedTimeInput || !currentOrderId) return;
  try {
    // ✅ STEP 1: Close modal INSTANTLY
    setShowTimeModal(false);
    
    // ✅ STEP 2: Update UI INSTANTLY
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === currentOrderId
          ? { ...order, estimatedTime: estimatedTimeInput }
          : order
      )
    );
    
    // ✅ STEP 3: Save to server in BACKGROUND
    await axios.post("http://localhost:5000/set_order_time", {
      orderId: currentOrderId,
      time: estimatedTimeInput,
    });
    
    // ✅ STEP 4: Silently refetch in background
    fetchOrders(); // No await!
    
    setCurrentOrderId(null);
    setEstimatedTimeInput("");
    setError("");
  } catch {
    await fetchOrders(); // On error, refetch with await
    setError("Failed to set estimated time.");
  }
};

const rejectOrder = async (orderId) => {
  try {
    // ✅ Instant UI update
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId
          ? { ...order, status: "Rejected" }
          : order
      )
    );
    
    // ✅ Background server update
    await axios.put("http://localhost:5000/reject_order_status", { id: orderId });
    
    // ✅ Background refetch
    fetchOrders(); // No await!
    
    setError("");
  } catch {
    await fetchOrders();
    setError("Failed to reject order.");
  }
};

const markReady = async (orderId) => {
  try {
    // ✅ Instant UI update
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId
          ? { ...order, status: "Ready", estimatedTime: undefined }
          : order
      )
    );
    
    // ✅ Background server update
    await axios.post("http://localhost:5000/mark_ready", { orderId });
    
    // ✅ Background refetch
    fetchOrders(); // No await!
    
    setError("");
  } catch {
    await fetchOrders();
    setError("Failed to mark order as ready.");
  }
};

const showRemoveConfirm = (order, displayOrderNumber) => {
  setOrderToRemove(order);
  setOrderToRemoveDisplayNumber(displayOrderNumber);
  setShowRemoveModal(true);
};

const confirmRemoveOrder = async () => {
  if (!orderToRemove) return;
  try {
    // ✅ Instant UI update
    setShowRemoveModal(false);
    const removedOrderId = orderToRemove._id;
    setOrderToRemove(null);
    setOrderToRemoveDisplayNumber(null);
    
    setOrders(prevOrders => 
      prevOrders.filter(order => order._id !== removedOrderId)
    );
    
    // ✅ Background delete
    await axios.delete(`http://localhost:5000/remove_order/${removedOrderId}`);
    
    // ✅ Background refetch
    fetchOrders(); // No await!
    
    setError("");
  } catch {
    await fetchOrders();
    setError("Failed to remove order.");
  }
};

  // Group orders by date string
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

  // Sort orders by their global order numbers for display
  const sortOrdersForDisplay = (ordersForDate, orderNumberMap) => {
    return ordersForDate.sort((a, b) => {
      const orderNumA = orderNumberMap[a._id];
      const orderNumB = orderNumberMap[b._id];

      if (orderNumA && orderNumB) {
        return orderNumA - orderNumB; // ascending
      }
      if (orderNumA && !orderNumB) return -1;
      if (!orderNumA && orderNumB) return 1;
      return 0;
    });
  };

  const groupedOrders = groupOrdersByDate(orders);
  const sortedGroupKeys = Object.keys(groupedOrders).sort((a, b) => new Date(b) - new Date(a));

  return (
    <>
      <VendorMenu />
      <Container className="mt-5">
        <h2 className="mb-4">Orders</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <>
            {sortedGroupKeys.map((date) => {
              const ordersForDate = groupedOrders[date];
              const orderNumberMap = calculateGlobalOrderNumbersForDate(orders, date, formatLocalDate);
              const sortedOrdersForDate = sortOrdersForDisplay(ordersForDate, orderNumberMap);

              return (
                <div key={date}>
                  <h5 className="mb-3">Orders for {date}</h5>
                  <Row>
                    {sortedOrdersForDate.map((order) => {
                      const displayOrderNumber =
                        order.status === "Confirmed" || order.status === "Ready"
                          ? orderNumberMap[order._id]
                          : null;

                      return (
                        <Col md={6} lg={4} className="mb-4" key={order._id}>
                          <Card className="shadow-sm position-relative equal-height-card">
                            <Button
                              variant="light"
                              size="sm"
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                borderRadius: "50%",
                                border: "none",
                                fontWeight: "bold",
                                color: "red",
                                padding: "0 8px",
                                lineHeight: 1,
                                cursor: "pointer",
                              }}
                              onClick={() => showRemoveConfirm(order, displayOrderNumber)}
                              title="Remove order"
                            >
                              &times;
                            </Button>

                            <Card.Body>
                              {displayOrderNumber && (
                                <div className="mb-2">
                                  <strong>Order No.: {displayOrderNumber}</strong>
                                </div>
                              )}

                              <div className="d-flex align-items-center">
                                <Image
                                  src={`http://localhost:5000/public/images/${order.image}`}
                                  height="70"
                                  width="70"
                                  rounded
                                  alt={order.foodname}
                                />
                                <div className="ms-3">
                                  <h5 className="mb-0">{order.foodname}</h5>
                                  <p className="small text-muted mb-1">{order.des}</p>
                                  <p className="mb-1">
                                    Price: ₹{order.price} x {order.quantity}
                                  </p>
                                  <p className="mb-1">Client: {order.client_email}</p>
                                  <p
                                    className={`mb-1 text-${
                                      order.status === "Rejected"
                                        ? "danger"
                                        : order.status === "Ready"
                                        ? "success"
                                        : "warning"
                                    }`}
                                  >
                                    Status: {order.status}
                                  </p>
                                </div>
                              </div>

                              {order.estimatedTime && order.status !== "Ready" && (
                                <span className="badge bg-secondary mt-2">
                                  Estimated Time: {order.estimatedTime} min
                                </span>
                              )}

                              <div className="mt-3 d-flex flex-wrap gap-2">
                                {order.status === "Pending" && (
                                  <>
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => confirmOrder(order._id)}
                                    >
                                      Confirm Order
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => rejectOrder(order._id)}
                                    >
                                      Reject Order
                                    </Button>
                                  </>
                                )}
                                {(order.status === "Confirmed" || order.status === "Pending") && (
                                  <Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => markReady(order._id)}
                                    disabled={order.status === "Ready"}
                                  >
                                    Mark as Ready
                                  </Button>
                                )}
                                {order.status === "Ready" && (
                                  <span className="badge bg-success">Ready for pickup</span>
                                )}
                                {order.status === "Rejected" && (
                                  <span className="badge bg-danger">Rejected</span>
                                )}
                              </div>
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

      <Modal
        show={showTimeModal}
        onHide={() => setShowTimeModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Set Estimated Time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="estimatedTimeInput">
              <Form.Label>Estimated Time (minutes)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={estimatedTimeInput}
                onChange={(e) => setEstimatedTimeInput(e.target.value)}
                placeholder="Enter estimated time"
              />
            </Form.Group>
          </Form>
          {error && (
            <Alert variant="danger" className="mt-2">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTimeModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSetTime}
            disabled={!estimatedTimeInput}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showRemoveModal}
        onHide={() => setShowRemoveModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Remove Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to remove order{" "}
          <strong>
            {orderToRemoveDisplayNumber 
              ? `#${orderToRemoveDisplayNumber}` 
              : `${orderToRemove?.foodname || 'this order'}`}
          </strong>?
          {error && (
            <Alert variant="danger" className="mt-2">
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRemoveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmRemoveOrder}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ConfirmOrder;