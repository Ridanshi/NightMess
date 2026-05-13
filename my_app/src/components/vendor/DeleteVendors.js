import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdmMenu from "../admin/AdmMenu";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

function DeleteVendors() {
    let history = useNavigate();
    const { id } = useParams();

    const [messname, setMessname] = useState("");
    const [owner, setOwner] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        displayVendor();
    }, []);

    const displayVendor = async () => {
        // ✅ ONLY LOGIC FIX: Use correct endpoint and method
        let res = await fetch(`http://localhost:5000/get_vendor_by_email/${id}`, {
            method: "GET",
            credentials: "include",
        });
        let result = await res.json();
        setMessname(result.messname);
        setOwner(result.owner);
        setAddress(result.vendor_address);
        setContact(result.vendor_contact);
        setEmail(result.vendor_email);
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        // ✅ ONLY LOGIC FIX: Use email as id and add credentials
        let res = await fetch("http://localhost:5000/delete_vendors", {
            method: "post",
            credentials: "include",
            body: JSON.stringify({ messname, owner, address, contact, id: email }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        let result = await res.json();
        if (result.data === "success") {
            setResult("Data deleted successfully.");
            // ✅ ONLY LOGIC FIX: Redirect after success
            setTimeout(() => {
                history("/admin/show_vendors");
            }, 2000);
        } else {
            setResult(result.msg || "Something went wrong.");
        }
    };

    return (
        <>
            <AdmMenu />
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card className="shadow p-4 border-danger">
                            <Card.Body>
                                <Card.Title className="text-center text-danger mb-4">
                                    Delete Vendor Details
                                </Card.Title>
                                <Form onSubmit={handleOnSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Store Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={messname}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Owner Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={owner}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Address</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={address}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Contact</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={contact}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            readOnly
                                        />
                                    </Form.Group>

                                    <div className="text-center mt-4">
                                        <Button variant="danger" type="submit">
                                            Delete Record
                                        </Button>
                                    </div>
                                </Form>

                                {result && (
                                    <Alert
                                        className="mt-4 text-center"
                                        variant={result.includes("success") ? "success" : "danger"}
                                    >
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

export default DeleteVendors;