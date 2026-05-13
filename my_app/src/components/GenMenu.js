import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { NavLink } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import './ModernNavbar.css'; // Import the new CSS file


function GenMenu() {
  const [isDark, setIsDark] = useState(true);

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  // Save theme preference to localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <Navbar expand="md" className={`bg-body-tertiary shadow-sm ${isDark ? 'dark' : 'light'}`}>
      <Container>
        <Navbar.Brand href="/">NightMess</Navbar.Brand>
        
        {/* Theme toggle button positioned next to the hamburger menu */}
        <div className="d-flex align-items-center gap-2">
          <div className={`theme-toggle-wrapper ${isDark ? 'dark' : 'light'}`}>
            <button
              className="theme-toggle-button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `nav-link ${isActive ? 'text-primary fw-bold' : ''}`
              }
            >
              Signup
            </NavLink>

            <NavLink
              to="/login"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'text-primary fw-bold' : ''}`
              }
            >
              Login
            </NavLink>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default GenMenu;