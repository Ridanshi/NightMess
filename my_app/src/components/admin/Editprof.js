import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from 'axiosConfig';
import AdmMenu from "./AdmMenu";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

// ✅ CRITICAL FIX: Configure axios to include credentials globally


function Editprof() {
    let history = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        console.log(id);
        displayAdmin();
    }, []);

    const displayAdmin = async () => {
        try {
            // ✅ FIX: Added error handling and credentials
            let admindata = await API.get("/get_admin", {
                withCredentials: true  // ✅ Include credentials
            });

            console.log(admindata);
            if (admindata.data && admindata.data.name) {  // ✅ Better validation
                setName(admindata.data.name);
                setAddress(admindata.data.address);
                setContact(admindata.data.contact);
            } else {
                setResult("Data Not Found");
            }
        } catch (err) {
            console.error("Error fetching admin data:", err);
            setResult("Failed to load profile data");
        }
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // ✅ FIX: Use axios instead of fetch, with credentials
            const result = await API.post(
                "/update_admin_profile",
                { name, address, contact },
                { withCredentials: true }  // ✅ Include credentials
            );

            console.log(result.data);

            if (result.data.data === 'success') {
                setResult("Profile updated successfully!");
                // ✅ Optional: Refresh data from server to confirm
                displayAdmin();
            } else {
                setResult("Data cannot be changed");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            setResult("Failed to update profile");
        }
    };

    return (
        <>
            <AdmMenu />
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <h4 className="text-center text-primary mb-4">Edit Admin Profile</h4>
                        <Form onSubmit={handleOnSubmit} className="p-4 border rounded shadow-sm bg-light">
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter name"
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
                                    maxLength={10}
                                />
                            </Form.Group>
                            <div className="d-grid">
                                <Button type="submit" variant="primary">
                                    Update Profile
                                </Button>
                            </div>
                        </Form>
                        {result && (
                            <Alert 
                                className="mt-4" 
                                variant={result.includes("successfully") ? "success" : "danger"}
                            >
                                {result}
                            </Alert>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}
export default Editprof;