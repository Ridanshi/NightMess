import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavLink } from 'react-router-dom';

function AdmMenu() {
  return (
    <>
      <Navbar expand="md" className="bg-body-tertiary shadow-sm">
        <Container>
          <Navbar.Brand href="/admin/adminhome">Admin Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <NavLink
                to="/admin/register_admin"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                Add Admin
              </NavLink>

              <NavLink
                to="/admin/register_vendors"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                Register Vendors
              </NavLink>

              <NavLink
                to="/admin/show_vendors"
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? 'text-primary fw-bold border-bottom border-2 border-primary' : 'text-dark'}`
                }
              >
                Manage Vendors
              </NavLink>

              <NavLink
                to="/admin/edit_admin"
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

export default AdmMenu;
