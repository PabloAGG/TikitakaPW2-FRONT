import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './header.css'; // Asegúrate de tener este archivo CSS
import { useNavigate } from 'react-router-dom';
import API_URL from '../config/api'; // Importa la URL de la API
import { jwtDecode } from 'jwt-decode';
const Header = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [searchbarVisible, setSearchbarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  let user = null;
  let userSesion = localStorage.getItem('token');

  try {
    if (userSesion) {
      user = jwtDecode(userSesion);
      // Verifica si el token ha expirado
      if (user.exp && user.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        userSesion = null;
        user = null;
      }
    }
  } catch (error) {
    console.error('Token inválido:', error);
    localStorage.removeItem('token');
    userSesion = null;
    user = null;
  }

  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  useEffect(() => {
    if (!menuAbierto) return;

    const handleClickOutside = (event) => {
      // Verifica que el click no sea en el menú ni en el botón hamburguesa
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          hamburgerRef.current && !hamburgerRef.current.contains(event.target)) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAbierto]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };
  const toggleSearchbar = () => {
    setSearchbarVisible(!searchbarVisible);
  }
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    fetch(`${API_URL}/api/busqueda?q=${encodeURIComponent(value)}`)
      .then(res => {
        if (!res.ok) throw new Error('Error de red o servidor');
        return res.json();
      })
      .then(data => {
        // Filtra los perfumes por nombre (ajusta según tu estructura de datos)
        const filtered = data.filter(perfume =>
          perfume.nombre.toLowerCase().includes(value.toLowerCase()) ||
          perfume.marcap.toLowerCase().includes(value.toLowerCase()) // También filtra por marca
        );
        setSuggestions(filtered.slice(0, 5)); // Máximo 5 sugerencias
      })
      .catch(err => {
        console.error("Error al buscar sugerencias:", err);
        setSuggestions([]); // Limpia las sugerencias en caso de error
      }
      );
  };

  const handleSuggestionClick = (nombre) => {
    setSearchTerm(nombre);
    setSuggestions([]);
    // Opcional: navegar directamente a la página del perfume
    navigate(`/busqueda/${encodeURIComponent(nombre)}`);
    toggleSearchbar(); // Cierra la barra de búsqueda
    setMenuAbierto(false); // Cierra el menú si está abierto
    setSearchTerm(''); // Limpia el campo de búsqueda

  };



  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Redirige a la página de búsqueda with query param
      navigate(`/busqueda/${encodeURIComponent(searchTerm)}`);

      setSuggestions([]); // Limpia las sugerencias
      toggleSearchbar(); // Cierra la barra de búsqueda

      setMenuAbierto(false); // Cierra el menú si está abierto
      setSearchTerm(''); // Limpia el campo de búsqueda
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    setMenuAbierto(false);
    setSearchbarVisible(false);
    navigate('/login');
    window.location.reload(); // <-- Fuerza recarga para actualizar el estado de userSesion
  };// Redirige a la página de inicio

  const searchbarComponent = (
    <div className={`search-container ${searchbarVisible ? 'active' : ''}`}>
      <input
        type="text"
        className="search-bar"
        placeholder="Buscar perfumes..."
        aria-label="Buscar perfumes"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button className="search-button" aria-label="Buscar" onClick={toggleSearchbar} title='Buscar perfumes'>
        <i className="fas fa-search"></i>
      </button>
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((perfume) => (
            <li
              key={perfume.idperfume}
              onClick={() => handleSuggestionClick(perfume.nombre)}
              className="suggestion-item"
            >
              {perfume.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  return (
    <header className="header">

      <button
        ref={hamburgerRef}
        className={`hamburger ${menuAbierto ? 'activo' : ''}`}
        onClick={toggleMenu}
        aria-label="Menú de navegación"
        aria-expanded={menuAbierto}
        title="Menú"

      >
        <span />
        <span />
        <span />
      </button>


      <nav ref={menuRef} className={`nav-links ${menuAbierto ? 'activo' : ''}`}>
        {isMobile && menuAbierto && searchbarComponent}
        <Link to="/" className="nav-link" onClick={() => setMenuAbierto(false)}><i className="fa-solid fa-house"></i> Inicio</Link>
        <Link to="/catalogo" className="nav-link" onClick={() => setMenuAbierto(false)}><i className="fa-solid fa-layer-group"></i> Catalogo</Link>
        {userSesion && user.admin && (  
          <>
          <Link to="/admin/catalogo" className="nav-link" onClick={() => setMenuAbierto(false)}>
 <i className="fas fa-cogs"></i> Administar Catálogo
</Link>
<Link to="/admin/crear" className="nav-link" onClick={() => setMenuAbierto(false)}>
            <i className="fas fa-plus"></i> Subir Producto
          </Link>
          
          </>

)}
        {userSesion && (
          <Link onClick={handleLogout} className="nav-link">
            <i className="fas fa-sign-out-alt"></i> Cerrar sesión
          </Link>
        )}
      </nav>


      <div className="logo-container">
        <Link to="/" className="logo-link">
          <img src="/IMG/LogoPrin.png" alt="Logo de la empresa" className="logo" />
        </Link>
      </div>

      <div className="user-menu">

        {!isMobile && searchbarComponent}
        {userSesion ? (
          <Link to="/perfil" className="user-link">
            <i className="fas fa-user"></i>
          </Link>
        ) : (
          <Link to="/login" className="user-link">
            <i className="fa-regular fa-user"></i>
          </Link>
        )}
        <Link to="/pedidos" className="user-link">
          <i className="fas fa-shopping-cart"></i>
        </Link>



      </div>
    </header>
  );
};

export default Header;
