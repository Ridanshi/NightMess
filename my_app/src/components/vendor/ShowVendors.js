import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Container, Table, Button, Row, Col } from "react-bootstrap";
import AdmMenu from "../admin/AdmMenu";

function ShowVendors() {
  const [med, setMed] = useState([]);

  useEffect(() => {
    displayVendor();
  }, []);

  const displayVendor = async () => {
    try {
      const res = await axios.get("http://localhost:5000/show_vendors");
      setMed(res.data);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <AdmMenu />
      <Container className="py-5">
        <h3 className="mb-4 text-primary text-center fw-bold">Registered Mess</h3>

        <Table striped bordered hover responsive className="shadow-sm rounded-3">
          <thead className="table-dark">
            <tr>
              <th>Mess Name</th>
              <th>Owner</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Email</th>
              <th colSpan="2" className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {med.length > 0 ? (
              med.map((m) => (
                <tr key={m.email}>
                  <td>{m.messname}</td>
                  <td>{m.owner}</td>
                  <td>{m.vendor_address}</td>
                  <td>{m.vendor_contact}</td>
                  <td>{m.vendor_email}</td>
                  <td className="text-center">
                    <Link to={`../edit_vendors/${m.email}`}>
                      <Button variant="success" size="sm" className="w-100">Edit</Button>
                    </Link>
                  </td>
                  <td className="text-center">
                    <Link to={`../delete_vendors/${m.email}`}>
                      <Button variant="danger" size="sm" className="w-100">Delete</Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No mess data found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
    </>
  );
}

export default ShowVendors;
