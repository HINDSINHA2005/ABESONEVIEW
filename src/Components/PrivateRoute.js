import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

const PrivateRoute = ({ children }) => { // Receive children prop
  const isAuthenticated = auth.currentUser;

  if (!isAuthenticated) {
    return <Navigate to="/landing" />;
  }

  return children; // Render the children
};

export default PrivateRoute;