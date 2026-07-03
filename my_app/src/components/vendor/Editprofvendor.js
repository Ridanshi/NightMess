import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from 'axiosConfig';
import MedMenu from "./VendorMenu";
import {Container,Row,Col,Form,Button,Alert} from "react-bootstrap";

function Editprofvendor() {
    let history = useNavigate();
    const { id } = useParams();

    const [messname, setMessname] = useState("");
    const [owner, setOwner] = useState("");
    const [contact, setContact] = useState("");
    const [address, setAddress] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(id);
        displayVendor();
    }, []);

    const displayVendor = async () => {
        try {
            let vendata = await API.get("/get_vendor");
            console.log("vendordata: ", vendata.data);
            const vendor = vendata.data;
            
            if (vendor) {
                setMessname(vendor.messname || "");
                setOwner(vendor.owner || "");
                setAddress(vendor.vendor_address || "");
                setContact(vendor.vendor_contact || "");
            } else {
                setResult("Data Not Found");
            }
        } catch (error) {
            console.error("Error fetching vendor:", error);
            setResult("Error loading profile data");
        }
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult("");

        try {
            // ✅ FIXED: Send with correct field names
            let result = await fetch('/update_vendor_profile', {
                method: "post",
                body: JSON.stringify({ 
                    messname, 
                    owner, 
                    address: address,      // Backend expects 'address'
                    contact: contact       // Backend expects 'contact'
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Include cookies for session
            });

            const data = await result.json();
            console.log("Update result:", data);

            if (data.data === 'success') {
                setResult("Data Updated successfully!");
                // Optionally reload the data to confirm update
                await displayVendor();
            } else {
                setResult(data.msg || "Data cannot be changed");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setResult("Error updating profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <MedMenu />
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <h4 className="text-center text-primary mb-4">Edit Profile</h4>
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
                            <div className="d-grid">
                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? "Updating..." : "Update Profile"}
                                </Button>
                            </div>
                        </Form>
                        {result && (
                            <Alert className="mt-4" variant={result.includes("successfully") ? "success" : "danger"}>
                                {result}
                            </Alert>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Editprofvendor;