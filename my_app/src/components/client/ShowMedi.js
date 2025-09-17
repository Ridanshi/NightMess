import { useState, useEffect } from "react";
import axios from "axios";
import MedMenu from "../vendor/VendorMenu";
import { Container, Table, Button, Alert } from "react-bootstrap";

function ShowMedi() {
    const [medi, setMedi] = useState([]);

    useEffect(() => {
        displayMedicine();
    }, []);

    const displayMedicine = async () => {
        try {
            const res = await axios.get("http://localhost:5000/show_medicine");
            setMedi(res.data);
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <MedMenu />
            <Container className="mt-4">
                <h3 className="text-primary mb-4 text-center">All Medicine Data</h3>

                {medi.length === 0 ? (
                    <Alert variant="info" className="text-center">
                        No medicine records found.
                    </Alert>
                ) : (
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>Medicine Name</th>
                                <th>Company</th>
                                <th>License Number</th>
                                <th>Description</th>
                                <th>Unit Price</th>
                                <th>Type</th>
                                <th colSpan={2} className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medi.map((m) => (
                                <tr key={m._id}>
                                    <td>{m.medname}</td>
                                    <td>{m.company}</td>
                                    <td>{m.license}</td>
                                    <td>{m.des}</td>
                                    <td>{m.u_price}</td>
                                    <td>{m.type}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            href={`../edit_medicine/${m._id}`}
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            href={`../delete_medicine/${m._id}`}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Container>
        </>
    );
}

export default ShowMedi;
