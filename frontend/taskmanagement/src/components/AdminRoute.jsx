import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../auth';

function AdminRoute({ children }) {
  return auth.isAuthenticated() && auth.isAdmin() ? children : <Navigate to="/" />;
}

export default AdminRoute;