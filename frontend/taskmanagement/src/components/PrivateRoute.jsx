import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../auth';

function PrivateRoute({ children }) {
  return auth.isAuthenticated() ? children : <Navigate to="/login" />;
}

export default PrivateRoute;