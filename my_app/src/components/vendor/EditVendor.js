import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from 'axiosConfig';
import AdminMenu from "../admin/AdmMenu";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

function EditVendor() {
    const navigate = useNavigate();
    const { email: encodedEmail } = useParams();
    // ✅ DECODE the URL parameter (d%40gmail.com → d@gmail.com)
    const email = encodedEmail ? decodeURIComponent(encodedEmail) : undefined;

    const [messname, setMessname] = useState("");
    const [owner, setOwner] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [vendorEmail, setVendorEmail] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log("Email from URL params:", email);
        if (email && email !== 'undefined') {
            displayVendor();
        } else {
            setResult("No vendor email provided. Please navigate from Manage Vendors page.");
        }
    }, [email]);

    const displayVendor = async () => {
        try {
            console.log(`Fetching vendor: ${email}`);
            const response = await API.get(
                `/get_vendor_by_email/${email}`,
                { withCredentials: true }
            );
            
            console.log("Vendor data:", response.data);
            const vendor = response.data;
            
            if (vendor) {
                setMessname(vendor.messname || "");
                setOwner(vendor.owner || "");
                setAddress(vendor.vendor_address || "");
                setContact(vendor.vendor_contact || "");
                setVendorEmail(vendor.vendor_email || "");
            } else {
                setResult("Vendor not found");
            }
        } catch (error) {
            console.error("Error fetching vendor:", error);
            setResult(error.response?.data?.error || "Error loading vendor data");
        }
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult("");

        try {
            const response = await fetch('/update_vendors', {
                method: "POST",
                body: JSON.stringify({ 
                    messname, 
                    owner, 
                    address: address,
                    contact: contact,
                    id: vendorEmail
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log("Update result:", data);

            if (data.data === 'success') {
                setResult("Vendor updated successfully!");
                setTimeout(() => {
                    navigate('/admin/show_vendors');
                }, 2000);
            } else {
                setResult(data.msg || "Failed to update vendor");
            }
        } catch (error) {
            console.error("Error updating vendor:", error);
            setResult("Error updating vendor. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AdminMenu />
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <h4 className="text-center text-primary mb-4">Edit Vendor Details</h4>
                        <Form onSubmit={handleOnSubmit} className="p-4 border rounded shadow-sm bg-light">
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
                                <Form.Label>Owner Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={owner}
                                    onChange={(e) => setOwner(e.target.value)}
                                    placeholder="Enter owner name"
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
                                    value={vendorEmail}
                                    disabled
                                    readOnly
                                />
                            </Form.Group>
                            
                            <div className="d-grid">
                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? "Updating..." : "Save Changes"}
                                </Button>
                            </div>
                        </Form>
                        
                        {result && (
                            <Alert 
                                className="mt-4" 
                                variant={result.includes("success") ? "success" : "danger"}
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

export default EditVendor;