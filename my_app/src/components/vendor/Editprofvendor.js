import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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

    useEffect(
        () => {
            console.log(id);
            displayVendor();
        },
        []
    )

    const displayVendor = async (e) => {
        //e.preventDefault();
        let vendata = await axios.get("http://localhost:5000/get_vendor");

        console.log("meddata: ", vendata.data);
        const vendor=vendata.data;
        if (vendor) {
            setMessname(vendor.messname );
            setOwner(vendor.owner);
            setAddress(vendor.vendor_address);
            setContact(vendor.vendor_contact);
        }
        else {
            setResult("Data Not Found")
        }
    };
    const handleOnSubmit = async (e) => {
        e.preventDefault();
        let result = await fetch(
            'http://localhost:5000/update_vendor_profile', {
            method: "post",
            body: JSON.stringify({ messname, owner, address, contact }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        console.log(result);

        if (result) {
            setResult("Data Updated successfully!");
            setMessname(messname);
            setOwner(owner);
            setAddress(address);
            setContact(contact);
        }
        else {
            setResult("Data cannot be changed");
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
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Owner Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={owner}
                                    onChange={(e) => setOwner(e.target.value)}
                                    placeholder="Enter owner name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter address"
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
        </>
    );

}
export default Editprofvendor;