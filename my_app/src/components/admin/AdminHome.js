import AdmMenu from "./AdmMenu";
import axios from 'axios';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Row,
  Col,
  Alert,
  Spinner,
  ListGroup
} from "react-bootstrap";

function AdminHome() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [usertype, setUsertype] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/isUser");
      if (res.data.usertype === "admin") {
        const data = await axios.get("http://localhost:5000/get_admin");
        setName(data.data.name);
        setAddress(data.data.address);
        setContact(data.data.contact);
        setEmail(data.data.email);
        setUsertype(data.data.usertype);
        setResult("");
      } else {
        navigate("/wrong_login");
      }
    } catch (err) {
      console.log(err);
      setResult("Failed to fetch admin data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdmMenu />
      <Container className="my-5">
        <h2 className="text-center text-primary fw-bold mb-4">Welcome, Admin!</h2>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Card className="shadow p-4 border-0 rounded-4">
                <Card.Body>
                  <Card.Title className="text-center text-success fw-semibold mb-4">
                    Admin Profile
                  </Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Name:</strong>
                      <span className="text-capitalize">{name}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Address:</strong>
                      <span className="text-capitalize">{address}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Contact:</strong>
                      <span>{contact}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Email:</strong>
                      <span className="text-lowercase text-muted">{email}</span>
                    </ListGroup.Item>
                  </ListGroup>
                </Card.Body>
              </Card>

              {result && (
                <Alert variant="danger" className="text-center mt-3">
                  {result}
                </Alert>
              )}
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}

export default AdminHome;
