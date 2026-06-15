import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../auth';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const user = auth.getCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🚀</span>
          <span className="brand-text">TaskFlow Pro</span>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                📊 Dashboard
              </Link>
              <Link to="/tasks" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                ✅ My Tasks
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                👤 Profile
              </Link>
              {auth.isAdmin() && (
                <Link to="/admin/users" className="nav-link admin-link" onClick={() => setMobileMenuOpen(false)}>
                  👥 Manage Users
                </Link>
              )}
              <div className="user-menu">
                <span className="user-avatar">{user.avatar || '👤'}</span>
                <span className="user-name">{user.firstName}</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="nav-link signup-link" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;