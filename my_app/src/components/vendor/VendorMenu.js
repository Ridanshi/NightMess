import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavLink, Routes, Route } from 'react-router-dom';

function VendorMenu() {
  return (
    <>
      <Navbar expand="md" className="bg-body-tertiary shadow-sm">
        <Container>
          <Navbar.Brand href="/vendor/vendorhome">Vendor Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <NavLink
                to="/vendor/orders"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                Orders
              </NavLink>

              <NavLink
                to="/vendor/avail_food"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                Food Items List
              </NavLink>

              <NavLink
                to="/vendor/order_food"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                Upload Food Items
              </NavLink>

              <NavLink
                to="/vendor/recharge_client"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                Manage Users
              </NavLink>

              <NavLink
                to="/vendor/edit_vendor"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                Edit Profile
              </NavLink>

              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'text-danger fw-bold border-bottom border-danger border-2' : 'text-dark'}`
                }
              >
                Logout
              </NavLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

    </>
  );
}

export default VendorMenu;
