import VendorMenu from "./VendorMenu";
import API from 'axiosConfig';
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

function VendorHome() {
  const navigate = useNavigate();
  const [messname, setMessname] = useState("");
  const [owner, setOwner] = useState("");
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
      const res = await API.get("/isUser", { 
        withCredentials: true 
      });
      
      if (res.data.usertype === "vendor") {
        // ✅ FIX 1: Changed from POST to GET
        // ✅ FIX 2: Changed from /get_vendors to /get_vendor (singular)
        // ✅ FIX 3: Added withCredentials
        const data = await API.get("/get_vendor", {
          withCredentials: true
        });
        
        console.log(data);
        setMessname(data.data.messname);
        setOwner(data.data.owner);
        setAddress(data.data.vendor_address);
        setContact(data.data.vendor_contact);
        setEmail(data.data.vendor_email);
        setUsertype(res.data.usertype);
        setResult("");
      } else {
        alert("Invalid credentials");
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
      <VendorMenu />
      <Container className="my-5">
        <h2 className="text-center text-primary fw-bold mb-4">Welcome, Vendor!</h2>

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
                    Vendor Profile
                  </Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Mess Name:</strong>
                      <span className="text-capitalize">{messname}</span>
                    </ListGroup.Item>
                    <ListGroup.Item className="d-flex justify-content-between">
                      <strong>Owner:</strong>
                      <span className="text-capitalize">{owner}</span>
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

export default VendorHome;