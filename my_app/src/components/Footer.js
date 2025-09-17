// Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="nightmess-footer">
      {/* Background Elements */}
      <div className="footer-bg-element-1"></div>
      <div className="footer-bg-element-2"></div>
      <div className="footer-bg-element-3"></div>
      <div className="footer-bg-element-4"></div>

      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-circle">
                <span className="footer-logo-text">NM</span>
              </div>
              <div className="footer-brand-info">
                <h3 className="footer-brand-title">NightMess</h3>
                <p className="footer-brand-subtitle">Satisfy your late-night cravings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              <span className="footer-copyright-symbol">©</span> 2025 NightMess. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#sitemap" className="footer-bottom-link">Sitemap</a>
              <span className="footer-divider">•</span>
              <a href="#accessibility" className="footer-bottom-link">Accessibility</a>
              <span className="footer-divider">•</span>
              <a href="#security" className="footer-bottom-link">Security</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;