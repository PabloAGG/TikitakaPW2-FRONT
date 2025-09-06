import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/login" state={{ error: 'Necesitas iniciar sesión para acceder a esta página.' }} />;
  }

  try {
    const decodedToken = jwtDecode(token);
    // Asumimos que tu token JWT tiene un campo 'role'
    const isAdmin = decodedToken.admin === true;
 // Para depuración, puedes eliminarlo después
    if (isAdmin) {
      return children; // Si es admin, muestra el contenido de la ruta
    } else {
      // Si no es admin, redirige al inicio
      return <Navigate to="/" />;
    }
  } catch (error) {
    // Si el token es inválido, limpia y redirige al login
    localStorage.removeItem('token');
    return <Navigate to="/login" state={{ error: 'Tu sesión ha expirado o es inválida.' }} />;
  }
};

export default AdminRoute;