import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

const footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">© 2025 Tikitaka. Todos los derechos reservados.</p>
        
        {/* <nav className="footer-nav">
          <Link to="/privacy" className="footer-link">Política de Privacidad</Link>
          <Link to="/terms" className="footer-link">Términos de Servicio</Link>
          <Link to="/contact" className="footer-link">Contacto</Link>
           <Link to="/about" className="footer-link">Sobre nosotros</Link>
           <Link to="/FAQ" className="footer-link">FAQ</Link>
        </nav> */}
      </div>
    </footer>
  );
}

export default footer;