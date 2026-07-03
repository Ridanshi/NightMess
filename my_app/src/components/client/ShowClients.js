import API from 'axiosConfig';
import { useState, useEffect } from "react";
import VendorMenu from "../vendor/VendorMenu";
import { Button, Container, Table, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

function ShowClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    displayClients();
    
    // Auto-refresh every 10 seconds to show latest balances
    const interval = setInterval(() => {
      displayClients();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const displayClients = async () => {
    try {
      // ✅ FIX: Use the correct endpoint that filters by vendor
      const res = await API.get("/show_clients_amt");
      setClients(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <VendorMenu />
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading customers...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <VendorMenu />
      <Container className="py-5">
        <h3 className="mb-4 text-primary text-center fw-bold">My Customers</h3>

        {clients.length === 0 ? (
          <Alert variant="light" className="text-center py-4" style={{ backgroundColor: '#f8f9fa' }}>
            <p className="mb-0 text-muted">
              No customers yet. Customers will appear here after you approve their first recharge request.
            </p>
          </Alert>
        ) : (
          <>
            <Table striped bordered hover responsive className="shadow-sm rounded-3">
              <thead className="table-dark">
                <tr>
                  <th>Client Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Balance</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.client_email}>
                    <td>
                      <strong>{client.clientname}</strong>
                    </td>
                    <td>{client.client_contact}</td>
                    <td>
                      <span className="text-muted">{client.client_email}</span>
                    </td>
                    <td>
                      <span 
                        className={`badge ${
                          client.client_balance > 0 ? 'bg-success' : 'bg-danger'
                        }`}
                        style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}
                      >
                        ₹{client.client_balance?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="text-center">
                      <Link to={`/vendor/recharge_client/${encodeURIComponent(client.client_email)}`}>
                        <Button variant="primary" size="sm">
                          Recharge
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Alert variant="info" className="mt-3" style={{ backgroundColor: '#d1ecf1', border: '1px solid #bee5eb' }}>
              <strong>Note:</strong> This shows customers who have sent recharge requests to your mess. 
              Balances update automatically when customers place orders or when you process recharges.
            </Alert>
          </>
        )}
      </Container>
    </>
  );
}

export default ShowClients;