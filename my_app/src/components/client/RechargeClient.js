import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from 'axiosConfig';
import { Container, Form, Button, Card, Alert, Table, Badge, Tabs, Tab, Modal } from "react-bootstrap";
import VendorMenu from "../vendor/VendorMenu";

axios.defaults.withCredentials = true;

function RechargeClient() {
  const { client_email } = useParams();
  const decodedEmail = client_email ? decodeURIComponent(client_email) : null;
  const [client, setClient] = useState({});
  const [balance, setBalance] = useState("");
  const [type, setType] = useState("credit");
  const [msg, setMsg] = useState("");
  const [rechargeRequests, setRechargeRequests] = useState([]);
  const [clientsWithRequests, setClientsWithRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  // Confirmation dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    if (decodedEmail) {
      getClientDetails();
    }
    fetchRechargeRequests();
    fetchClientsWithRequests();
    
    // ✅ FIX: Reduced interval to 5 seconds for better real-time updates
    const interval = setInterval(() => {
      fetchRechargeRequests();
      fetchClientsWithRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, [decodedEmail]);

  useEffect(() => {
    if (decodedEmail && client.client_email) {
      setSelectedClient(client);
      setShowRechargeModal(true);
    }
  }, [client, decodedEmail]);

  const getClientDetails = async () => {
    try {
      const res = await API.get(`/client_by_email/${decodedEmail}`);
      const clientData = res.data;
      setClient(clientData);
    } catch (err) {
      console.error(err);
      setMsg("Failed to fetch client details.");
    }
  };

  const fetchRechargeRequests = async () => {
    try {
      const res = await API.get("/get_recharge_requests");
      setRechargeRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClientsWithRequests = async () => {
    try {
      const res = await API.get("/show_clients_amt");
      setClientsWithRequests(res.data);
      console.log("✅ Fetched clients:", res.data.length); // ✅ Debug log
    } catch (err) {
      console.error("❌ Error fetching clients:", err);
    }
  };

  const openRechargeModal = (client) => {
    setSelectedClient(client);
    setBalance("");
    setType("credit");
    setMsg("");
    setShowRechargeModal(true);
  };

  const closeRechargeModal = () => {
    setShowRechargeModal(false);
    setSelectedClient(null);
    setBalance("");
    setType("credit");
    setMsg("");
    
    if (decodedEmail) {
      navigate("/vendor/recharge_client");
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();

    if (!balance || isNaN(balance)) {
      setMsg("Please enter a valid balance.");
      return;
    }

    const roundedBalance = parseFloat(parseFloat(balance).toFixed(2));

    try {
      const payload = {
        balance: roundedBalance,
        type,
        clientname: selectedClient.clientname,
        email_user: selectedClient.client_email,
      };

      const res = await API.post("/recharge_client", payload);

      if (res.data && res.data.status === "success") {
        setMsg("Recharge successful!");
        
        // ✅ FIX: Immediately refresh the clients list
        await fetchClientsWithRequests();
        
        setTimeout(() => {
          setMsg("");
          closeRechargeModal();
          setActiveTab("clients"); // ✅ Show updated balance in My Customers tab
        }, 2000);
      } else {
        setMsg(res.data.msg || "Recharge failed.");
      }
    } catch (err) {
      console.error(err);
      setMsg("Server error during recharge.");
    }
  };

  // Open confirmation dialog for approve
  const openApproveConfirmation = (requestId, clientName, amount) => {
    setConfirmData({ requestId, clientName, amount });
    setConfirmAction('approve');
    setShowConfirmDialog(true);
  };

  // Open confirmation dialog for reject
  const openRejectConfirmation = (requestId, clientName) => {
    setConfirmData({ requestId, clientName });
    setConfirmAction('reject');
    setShowConfirmDialog(true);
  };

  // Handle confirmed action
  const handleConfirmedAction = async () => {
    setShowConfirmDialog(false);

    if (confirmAction === 'approve') {
      await executeApprove();
    } else if (confirmAction === 'reject') {
      await executeReject();
    }
  };

  const executeApprove = async () => {
    try {
      const res = await API.post("/approve_recharge_request", {
        requestId: confirmData.requestId
      });

      if (res.data.success) {
        setMsg(res.data.msg);
        
        // ✅ FIX: Refresh BOTH lists immediately after approval
        await Promise.all([
          fetchRechargeRequests(),
          fetchClientsWithRequests()
        ]);
        
        // ✅ FIX: Auto-switch to "My Customers" tab to show the newly added customer
        setTimeout(() => {
          setActiveTab("clients");
          setMsg("");
        }, 2000);
      } else {
        setMsg(res.data.msg || "Failed to approve request");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setMsg("Error approving request. Please try again.");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const executeReject = async () => {
    try {
      const res = await API.post("/reject_recharge_request", {
        requestId: confirmData.requestId
      });

      if (res.data.success) {
        setMsg("Request rejected successfully");
        
        // ✅ FIX: Refresh requests list immediately after rejection
        await fetchRechargeRequests();
        
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg("Failed to reject request");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setMsg("Error rejecting request");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  return (
    <>
      <VendorMenu />
      <Container className="mt-4 mb-5" style={{ maxWidth: '1200px' }}>
        {msg && (
          <Alert 
            variant={msg.toLowerCase().includes("success") || msg.toLowerCase().includes("credited") ? "success" : "danger"}
            dismissible
            onClose={() => setMsg("")}
            style={{ marginBottom: '1rem' }}
          >
            {msg}
          </Alert>
        )}

        <Card className="border-0 shadow-sm">
          <Card.Header style={{ 
            backgroundColor: '#f8f9fa', 
            borderBottom: '1px solid #dee2e6',
            padding: '1.25rem'
          }}>
            <h4 className="mb-0">Wallet Management</h4>
          </Card.Header>
          <Card.Body style={{ padding: '1.5rem' }}>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4"
            >
              {/* Pending Requests Tab */}
              <Tab 
                eventKey="requests" 
                title={
                  <span>
                    Pending Requests
                    {rechargeRequests.length > 0 && (
                      <Badge bg="danger" className="ms-2">{rechargeRequests.length}</Badge>
                    )}
                  </span>
                }
              >
                <div className="mt-3">
                  {rechargeRequests.length === 0 ? (
                    <Alert variant="light" className="text-center py-4" style={{ backgroundColor: '#f8f9fa' }}>
                      <p className="mb-0 text-muted">No pending recharge requests at the moment.</p>
                    </Alert>
                  ) : (
                    <>
                      <Table hover responsive style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                          <tr>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Date & Time</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Customer Name</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Email</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Amount</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rechargeRequests.map(request => (
                            <tr key={request._id}>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                {new Date(request.createdAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <strong>{request.clientname}</strong>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <span className="text-muted">{request.client_email}</span>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <Badge bg="success" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                                  ₹{request.amount.toFixed(2)}
                                </Badge>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <div className="d-flex gap-2">
                                  <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={() => openApproveConfirmation(
                                      request._id, 
                                      request.clientname, 
                                      request.amount
                                    )}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => openRejectConfirmation(
                                      request._id, 
                                      request.clientname
                                    )}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      <Alert variant="warning" className="mt-3" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffe69c' }}>
                        <strong>Note:</strong> Only approve requests after receiving cash payment from the customer.
                      </Alert>
                    </>
                  )}
                </div>
              </Tab>

              {/* My Customers Tab */}
              <Tab 
                eventKey="clients" 
                title={
                  <span>
                    My Customers
                    {clientsWithRequests.length > 0 && (
                      <Badge bg="primary" className="ms-2">{clientsWithRequests.length}</Badge>
                    )}
                  </span>
                }
              >
                <div className="mt-3">
                  {clientsWithRequests.length === 0 ? (
                    <Alert variant="light" className="text-center py-4" style={{ backgroundColor: '#f8f9fa' }}>
                      {/* ✅ FIX: Better empty state message */}
                      <p className="mb-0 text-muted">No customers yet. Customers will appear here after you approve their first recharge request.</p>
                    </Alert>
                  ) : (
                    <>
                      <Table hover responsive style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                          <tr>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Client Name</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Contact</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Email</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Balance</th>
                            <th style={{ padding: '1rem', borderBottom: '2px solid #dee2e6' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientsWithRequests.map((client, index) => (
                            <tr key={index}>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <strong>{client.clientname}</strong>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>{client.client_contact}</td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <span className="text-muted">{client.client_email}</span>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <Badge 
                                  bg={client.client_balance > 0 ? "success" : "danger"}
                                  style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                                >
                                  ₹{client.client_balance?.toFixed(2) || "0.00"}
                                </Badge>
                              </td>
                              <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => openRechargeModal(client)}
                                >
                                  Recharge
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      {/* ✅ FIX: Updated info message */}
                      <Alert variant="info" className="mt-3" style={{ backgroundColor: '#d1ecf1', border: '1px solid #bee5eb' }}>
                        <strong>Note:</strong> Balances update automatically when customers place orders or when you process recharges. 
                        The list refreshes every 5 seconds.
                      </Alert>
                    </>
                  )}
                </div>
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Container>

      {/* Confirmation Dialog Modal */}
      <Modal 
        show={showConfirmDialog} 
        onHide={() => setShowConfirmDialog(false)} 
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{ backgroundColor: confirmAction === 'approve' ? '#d4edda' : '#f8d7da', borderBottom: 'none' }}>
          <Modal.Title style={{ color: confirmAction === 'approve' ? '#155724' : '#721c24' }}>
            {confirmAction === 'approve' ? '✓ Confirm Approval' : '✕ Confirm Rejection'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          {confirmAction === 'approve' ? (
            <>
              <p className="mb-3">
                Are you sure you want to approve this recharge request?
              </p>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div className="mb-2">
                  <strong>Customer:</strong> {confirmData.clientName}
                </div>
                <div>
                  <strong>Amount:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>₹{confirmData.amount?.toFixed(2)}</span>
                </div>
              </div>
              <Alert variant="warning" className="mb-0" style={{ fontSize: '0.9rem' }}>
                <strong>Important:</strong> Only confirm after receiving cash payment from the customer.
              </Alert>
            </>
          ) : (
            <>
              <p className="mb-3">
                Are you sure you want to reject this recharge request?
              </p>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px'
              }}>
                <div>
                  <strong>Customer:</strong> {confirmData.clientName}
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #dee2e6' }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowConfirmDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            variant={confirmAction === 'approve' ? 'success' : 'danger'}
            onClick={handleConfirmedAction}
          >
            {confirmAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Recharge Modal */}
      <Modal show={showRechargeModal} onHide={closeRechargeModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
          <Modal.Title>Recharge Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          {msg && (
            <Alert variant={msg.toLowerCase().includes("success") ? "success" : "danger"}>
              {msg}
            </Alert>
          )}

          {selectedClient && (
            <Form onSubmit={handleRecharge}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Client Name</Form.Label>
                <Form.Control type="text" value={selectedClient.clientname || ""} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Client Email</Form.Label>
                <Form.Control type="email" value={selectedClient.client_email || ""} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Current Balance</Form.Label>
                <Form.Control 
                  type="text" 
                  value={`₹${selectedClient.client_balance?.toFixed(2) || "0.00"}`} 
                  disabled 
                  style={{ 
                    fontWeight: '600',
                    color: selectedClient.client_balance > 0 ? '#28a745' : '#dc3545'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Transaction Type</Form.Label>
                <Form.Select value={type} onChange={(e) => setType(e.target.value)} required>
                  <option value="credit">Credit (Add Money)</option>
                  <option value="debit">Debit (Deduct Money)</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  {type === "credit" 
                    ? "Add money to customer's wallet" 
                    : "Deduct money from customer's wallet"}
                </Form.Text>
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant={type === "credit" ? "success" : "danger"} type="submit" size="lg">
                  {type === "credit" ? "Add Funds" : "Deduct Funds"}
                </Button>
                <Button variant="outline-secondary" onClick={closeRechargeModal}>
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default RechargeClient;