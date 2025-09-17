import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Alert,
} from "react-bootstrap";

function DeleteMedi() {
    const history = useNavigate();
    const { id } = useParams();

    const [medid, setMedid] = useState("");
    const [name, setName] = useState("");
    const [com, setCom] = useState("");
    const [lic, setLic] = useState("");
    const [desp, setDesp] = useState("");
    const [uprice, setUprice] = useState("");
    const [type, setType] = useState("");
    const [result, setResult] = useState("");

    useEffect(() => {
        displayMedicine();
    }, []);

    const displayMedicine = async () => {
        const res = await fetch("http://localhost:5000/get_medicine", {
            method: "post",
            body: JSON.stringify({ id }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const result = await res.json();
        setMedid(result._id);
        setName(result.medname);
        setCom(result.company);
        setLic(result.license);
        setDesp(result.des);
        setUprice(result.u_price);
        setType(result.type);
    };

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:5000/delete_medicine", {
            method: "post",
            body: JSON.stringify({ id, name, com, lic, desp, uprice, type }),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const result = await res.json();
        if (result.data === "success") {
            setResult("Data deleted successfully.");
            // Optional: Redirect after delete
            // history("/show_medicine");
        } else {
            setResult(result.msg || "Delete failed.");
        }
    };

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow p-4">
                        <Card.Body>
                            <Card.Title className="text-center text-danger mb-4">
                                Delete Medicine Record
                            </Card.Title>
                            <Form onSubmit={handleOnSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Medicine ID</Form.Label>
                                    <Form.Control type="text" value={medid} readOnly />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Medicine Name</Form.Label>
                                    <Form.Control type="text" value={name} readOnly />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Company</Form.Label>
                                    <Form.Control type="text" value={com} readOnly />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>License Number</Form.Label>
                                    <Form.Control type="text" value={lic} readOnly />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control type="text" value={desp} readOnly />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Unit Price</Form.Label>
                                    <Form.Control type="text" value={uprice} readOnly />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Type</Form.Label>
                                    <Form.Control type="text" value={type} readOnly />
                                </Form.Group>

                                <div className="text-center mt-4">
                                    <Button variant="danger" type="submit">
                                        Confirm Delete
                                    </Button>
                                </div>
                            </Form>

                            {result && (
                                <Alert
                                    variant={
                                        result.includes("success") ? "success" : "danger"
                                    }
                                    className="mt-4 text-center"
                                >
                                    {result}
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default DeleteMedi;
