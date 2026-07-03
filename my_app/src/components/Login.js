import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Eye, EyeOff } from "lucide-react";
import './Login.css';
import API from 'axiosConfig';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

const handleOnSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await API.post('/check_login', { email, password });
    
    console.log("Login response:", response.data);
    
    const ut = response.data.usertype;
    if (ut === "admin") {
      navigate('/admin/adminhome', { replace: true });
    } else if (ut === "vendor") {
      navigate('/vendor/vendorhome', { replace: true });
    } else if (ut === "client") {
      if (response.data.hasSelectedMess) {
        navigate('/client', { replace: true });
      } else {
        navigate('/select-nightmess', { replace: true });
      }
    } else {
      setMsg("Contact admin for access");
    }
  } catch (error) {
    console.error("Login error:", error);
    if (error.response?.status === 401) {
      setMsg("Invalid Email and/or Password");
    } else {
      setMsg("Server error. Please try again.");
    }
  }
};

  const handleSignupClick = () => {
    navigate('/'); // Navigate to signup page
  };

  return (
    <div className="login-container">
      {/* Animated Background Elements */}
      <div className="login-bg-element-1"></div>
      <div className="login-bg-element-2"></div>
      <div className="login-bg-element-3"></div>
      {/* <div className="login-bg-element-4"></div> */}
      {/* <div className="login-bg-element-5"></div> */}
      {/* <div className="login-bg-element-6"></div> */}
      <div className="login-bg-element-7"></div>
      {/* <div className="login-bg-element-8"></div> */}
      {/* <div className="login-bg-element-9"></div> */}
      {/* <div className="login-bg-element-10"></div> */}
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            {/* Logo and Title Section */}
            <div className="text-center mb-4">
              <div className="logo-circle">
                <div className="logo-text">NM</div>
              </div>
              <h2 className="brand-title">Welcome Back</h2>
              <p className="brand-subtitle">Login to NightMess and order your favorites</p>
            </div>
            <Card className="shadow-lg border-0">
              <Card.Body>
                <Form onSubmit={handleOnSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="form-input password-input"
                        style={{ width: "100%" }}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(prev => !prev)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </Form.Group>
                  <div className="d-grid">
                    <Button type="submit" variant="primary">
                      Login
                    </Button>
                  </div>
                </Form>
                {msg && (
                  <Alert
                    variant={msg.includes("Invalid") ? "danger" : "warning"}
                    className="mt-4 text-center"
                  >
                    {msg}
                  </Alert>
                )}
                <div className="signin-link-section">
                  <p className="signin-text">
                    Don't have an account? <span className="signin-link" onClick={handleSignupClick}>Sign up here</span>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
