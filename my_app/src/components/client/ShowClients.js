import axios from "axios";
import { useState } from "react";
import VendorMenu from "../vendor/VendorMenu";
import { Button, Container, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect } from "react";

function ShowClients() {
  const [client, setClient] = useState([]);

  useEffect(() => {
    displayClient();
  }, []);

  const displayClient = async () => {
    try {
      const res = await axios.get("http://localhost:5000/show_clients");
      setClient(res.data);
      
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <VendorMenu />
      <Container className="py-5">
        <h3 className="mb-4 text-primary text-center fw-bold">Registered Users</h3>

        <Table striped bordered hover responsive className="shadow-sm rounded-3">
          <thead className="table-dark">
            <tr>
              <th>Client Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Balance</th>
              
              <th className="text-center">Recharge</th>
            </tr>
          </thead>
          <tbody>
            {client.length > 0 ? (
              client.map((m) => (
                <tr key={m.client_email}>
                  <td>{m.clientname}</td>
                  <td>{m.client_contact}</td>
                  <td>{m.client_email}</td>
                  <td>{m.client_balance}</td>
                  
                  <td className="text-center">
                    {/* <Link to={`../edit_vendors/${m.email}`}> */}
                    <Link to={`/vendor/recharge_client/${m.client_email}`}>
                      <Button variant="success" size="sm" className="w-100">Recharge</Button>
                    </Link>
                  </td>
                  
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No Clients Registered .
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
    </>
  );
}

export default ShowClients;
