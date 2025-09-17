import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MedMenu from "./ClientMenu";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import './EditProfile.css';


function EditProfile() {
    let history = useNavigate();
    const { id } = useParams();

    const [name, setName] = useState("");
    const [contact, setContact] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        console.log(id);
        displayClient();
    }, []);

    const displayClient = async (e) => {
        let clientdata = await axios.get("http://localhost:5000/get_client");
        console.log("clientdata: ", clientdata.data);
        const client = clientdata.data;
        if (client) {
            setName(client.clientname);
            setContact(client.client_contact);
        } else {
            setResult("Data Not Found");
        }
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        let result = await fetch("http://localhost:5000/update_client_profile", {
            method: "post",
            body: JSON.stringify({ name, contact }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        result = await result.json();
        console.log(result);

        if (result) {
            setResult("Data Updated successfully!");
            setName(name);
            setContact(contact);
        } else {
            setResult("Data cannot be changed");
        }
    };

    return (
        <>
            <MedMenu />
            {/* Add class for container spacing and bubble background */}
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
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Contact</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="Enter contact number"
                                />
                            </Form.Group>
                            <div className="d-grid">
                                <Button type="submit" variant="primary">
                                    Update Profile
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
            {/* Add bubble divs outside Container for background bubbles */}
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
