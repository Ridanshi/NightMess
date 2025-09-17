import React, { useState } from "react";
import { User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import "./DarkTheme.css";


function Signup() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // New state for phone error message
  const [phoneError, setPhoneError] = useState("");


  const handleOnSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setPhoneError("");


    // Validate phone number: must be exactly 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(contact)) {
      setPhoneError("Phone number must be exactly 10 digits.");
      return;
    }


    // Password match check
    if (password !== confirmpass) {
      setMsg("Oops! Your passwords don't match. Please re-enter them.");
      return;
    }


    // Password strength check
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongRegex.test(password)) {
      setMsg("Please choose a stronger password: at least 8 characters, with uppercase, lowercase, number, and special character.");
      return;
    }


    try {
      const res = await fetch("http://localhost:5000/register_client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, email, password })
      });


      const data = await res.json();
      console.log(data);


      if (!res.ok) {
        setMsg(data.msg || "An error occurred during registration.");
      } else {
        setMsg(data.msg || "Account created successfully!");
      }
    } catch (err) {
      console.error(err);
      setMsg("Server error occurred. Please try again.");
    }
  };


  return (
    <div className={`signup-container ${isDark ? 'dark' : 'light'}`}>
      <div className="background-element-1" />
      <div className="background-element-2" />
      <div className="background-element-3" />


      <div className="main-content">
        <div className="content-wrapper">
          <div className="brand-section">
            <div className="logo-circle">
              <span className="logo-text">NM</span>
            </div>
            <h1 className="brand-title">Welcome to NightMess</h1>
            <p className="brand-subtitle">Join us and satisfy your late-night cravings</p>
          </div>


          <form onSubmit={handleOnSubmit}>
            <div className="signup-card">
              <div className="form-container">


                {/* Name Input */}
                <div className="input-group">
                  <div className="input-icon"><User size={20} /></div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>


                {/* Contact Input */}
                <div className="input-group">
                  <div className="input-icon"><Phone size={20} /></div>
                  <input
                    type="tel"
                    placeholder="Contact Number"
                    value={contact}
                    onChange={e => {
                      // Allow only digits in input
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        setContact(val);
                        setPhoneError("");
                      }
                    }}
                    required
                    maxLength={10}
                    className="form-input"
                  />
                </div>


                {/* Show phone error if any */}
                {phoneError && (
                  <div style={{
                    color: "red",
                    fontWeight: "600",
                    marginBottom: "1rem",
                    fontSize: "0.9rem",
                    fontFamily: "'Poppins', sans-serif",
                    backgroundColor: "rgba(255, 0, 0, 0.1)",
                    borderRadius: "8px",
                    padding: "6px 10px"
                  }}>
                    {phoneError}
                  </div>
                )}


                {/* Email Input */}
                <div className="input-group">
                  <div className="input-icon"><Mail size={20} /></div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>


                {/* Password Input */}
                <div className="input-group">
                  <div className="input-icon"><Lock size={20} /></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="form-input password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>


                {/* Confirm Password Input */}
                <div className="input-group">
                  <div className="input-icon"><Lock size={20} /></div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmpass}
                    onChange={e => setConfirmPass(e.target.value)}
                    required
                    className="form-input password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>


                {/* Submit Button */}
                <button
                  type="submit"
                  className="submit-button"
                >
                  Create Account
                </button>
              </div>


              {/* Message Display */}
              {msg && (
                <div className={`message ${
                  msg.toLowerCase().includes('error') || msg.toLowerCase().includes('not match') || msg.toLowerCase().includes('strong')
                    ? 'error strong-error' : 'success'}`}>
                  {msg}
                </div>
              )}


              {/* Sign In Link */}
              <div className="signin-link-section">
                <p className="signin-text">
                  Already have an account?{' '}
                  <a href="/login" className="signin-link">
                    Sign In
                  </a>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


export default Signup;