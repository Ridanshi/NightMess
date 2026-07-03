import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from 'axiosConfig';
import MedMenu from "./ClientMenu";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import './EditProfile.css';
import Loader from './Loader';

// ✅ CRITICAL FIX: Configure axios to include credentials


function EditProfile() {
    let history = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        console.log(id);
        displayClient();
    }, []); // ✅ Also add displayClient to dependencies: }, [displayClient]);

    const displayClient = async () => {
        try {
            // ✅ FIX: Use axios with credentials
            let clientdata = await API.get("/get_client", {
                withCredentials: true  // ✅ Include credentials
            });
            console.log("clientdata: ", clientdata.data);
            const client = clientdata.data;
            if (client && client.clientname) {  // ✅ Better validation
                setName(client.clientname);
                setContact(client.client_contact);
            } else {
                setResult("Data Not Found");
            }
        } catch (err) {
            console.error("Error fetching client data:", err);
            setResult("Failed to load profile data");
        }
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // ✅ FIX: Use axios instead of fetch, with credentials
            const result = await API.post(
                "/update_client_profile",
                { name, contact },
                { withCredentials: true }  // ✅ Include credentials
            );
            
            console.log(result.data);

            if (result.data.data === 'success') {
                setResult("Profile updated successfully!");
                // ✅ Optional: Refresh the data from server to confirm
                displayClient();
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
            <MedMenu />
            <Container className="mt-4 editprofile-container">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <h4 className="text-center text-dark mb-4">Edit Profile</h4>
                        <Form onSubmit={handleOnSubmit} className="p-4 border rounded shadow-sm bg-light">
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
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
            
            {/* Background bubbles */}
            <div className="editprofile-bg-element-1"></div>
            <div className="editprofile-bg-element-2"></div>
            <div className="editprofile-bg-element-3"></div>
            <div className="editprofile-bg-element-4"></div>
            <div className="editprofile-bg-element-5"></div>
            <div className="editprofile-bg-element-6"></div>
            <div className="editprofile-bg-element-7"></div>
            <div className="editprofile-bg-element-8"></div>
            <div className="editprofile-bg-element-9"></div>
            <div className="editprofile-bg-element-10"></div>
        </>
    );
}

export default EditProfile;