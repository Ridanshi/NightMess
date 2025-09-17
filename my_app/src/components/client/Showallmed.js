import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Container, Table, Button, Row, Col } from "react-bootstrap";



function Showallmed() {
    const [medicine, setMedicine] = useState();

    useEffect(() => {
        displayMedicine();
    }, []);

    const displayMedicine = async () => {
        try {
            const res = await axios.get("http://localhost:5000/show_medicines");
            setMedicine(res.data);
            console.log(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    return (
            <Container className="py-5">
                <h3 className="mb-4 text-primary text-center fw-bold">Medicines Available</h3>

                <Table striped bordered hover responsive className="shadow-sm rounded-3">
                    <thead className="table-dark">
                        <tr>
                            <th>Medicine Name</th>
                            <th>Company</th>
                            <th>Decription</th>
                            <th>Unit Price</th>
                            <th>Type</th>
                            <th colSpan="2" className="text-center">Actions</th>
                        </tr>
                    </thead>
                </Table>
            </Container>
                
    )
}
export default Showallmed;