import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import AdmMenu from "../admin/AdmMenu";

function VendorReg() {
  const [messname, setMessname] = useState("");
  const [owner, setOwner] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpass] = useState("");
  const [result, setResult] = useState("");

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    console.log("Data Sent Successfully!");
    let r = await fetch("http://localhost:5000/register_vendors", {
      method: "POST",
      body: JSON.stringify({ messname, owner, address, contact, email, password, cpassword }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    r = await r.json();
    console.log(r);
    if (r) {
      setResult("Data Saved Successfully!");
      setMessname("");
      setOwner("");
      setAddress("");
      setContact("");
      setEmail("");
      setPassword("");
      setCpass("");
    }
  };

  return (
    <>
      <AdmMenu />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body>
                <Card.Title className="text-center text-primary mb-4 fw-bold">
                  Mess Registration
                </Card.Title>
                <Form onSubmit={handleOnSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mess Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={messname}
                      onChange={(e) => setMessname(e.target.value)}
                      placeholder="Enter mess name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Owner</Form.Label>
                    <Form.Control
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      placeholder="Enter owner's name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter address"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Contact</Form.Label>
                    <Form.Control
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Enter contact number"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={cpassword}
                      onChange={(e) => setCpass(e.target.value)}
                      placeholder="Confirm password"
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button type="submit" variant="primary" className="rounded-pill">
                      Register
                    </Button>
                  </div>
                </Form>

                {result && (
                  <Alert variant="success" className="mt-4 text-center">
                    {result}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default VendorReg;
