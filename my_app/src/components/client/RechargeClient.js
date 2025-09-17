import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import VendorMenu from "../vendor/VendorMenu";

function RechargeClient() {
  const { client_email } = useParams();
  const decodedEmail = decodeURIComponent(client_email); // Properly decode email
  const [client, setClient] = useState({});
  const [balance, setBalance] = useState("");
  const [type, setType] = useState("credit");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getClientDetails();
  }, []);

  const getClientDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/client_by_email/${decodedEmail}`);
      setClient(res.data);
    } catch (err) {
      console.error(err);
      setMsg("Failed to fetch client details.");
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();

    if (!balance || isNaN(balance)) {
      setMsg("Please enter a valid balance.");
      return;
    }

    // Round balance to 2 decimal places to avoid floating-point precision issues
    const roundedBalance = parseFloat(parseFloat(balance).toFixed(2));

    try {
      const payload = {
        balance: roundedBalance,
        type,
        clientname: client.clientname,
        email_user: client.client_email,
      };

      const res = await axios.post("http://localhost:5000/recharge_client", payload);

      // Expect backend to respond with status: "success" for successful recharge
      if (res.data && res.data.status === "success") {
        setMsg("Recharge successful!");
        setTimeout(() => navigate("/vendor/show_clients"), 1500);
      } else {
        setMsg(res.data.msg || "Recharge failed.");
      }
    } catch (err) {
      console.error(err);
      setMsg("Server error during recharge.");
    }
  };

  return (
    <>
      <VendorMenu />
      <Container className="mt-5">
        <Card className="p-4 shadow-sm">
          <h3 className="text-primary mb-3 text-center">Recharge Client</h3>

          {msg && (
            <Alert variant={msg.toLowerCase().includes("success") ? "success" : "danger"}>
              {msg}
            </Alert>
          )}

          <Form onSubmit={handleRecharge}>
            <Form.Group className="mb-3">
              <Form.Label>Client Name</Form.Label>
              <Form.Control type="text" value={client.clientname || ""} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Client Email</Form.Label>
              <Form.Control type="email" value={client.client_email || ""} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Type</Form.Label>
              <Form.Select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
              </Form.Select>
            </Form.Group>

            <Button variant="success" type="submit" className="w-100">
              Recharge
            </Button>
          </Form>
        </Card>
      </Container>
    </>
  );
}

export default RechargeClient;
