import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🚀 TaskFlow Pro</h3>
          <p>Professional Task Management Solution</p>
          <p>Streamline your workflow today</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <a href="/">Dashboard</a>
          <a href="/tasks">My Tasks</a>
          <a href="/profile">Profile</a>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>📧 support@taskflow.com</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>🌐 www.taskflow.com</p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <p>📘 Facebook</p>
          <p>🐦 Twitter</p>
          <p>📸 Instagram</p>
          <p>💼 LinkedIn</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 TaskFlow Pro. All rights reserved. | Made with ❤️ for better productivity</p>
      </div>
    </footer>
  );
}

export default Footer;