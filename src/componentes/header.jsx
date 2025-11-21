import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../config/api'; // Importa la URL de la API
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './header.css'; // Asegúrate de tener este archivo CSS
const Header = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [searchbarVisible, setSearchbarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const { totalItems } = useCart();
  const { user, token, logout: authLogout } = useAuth();
  let userSesion = token;

  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const searchRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);
  useEffect(() => {
    if (!menuAbierto) return;

    const handleClickOutside = (event) => {
      // Verifica que el click no sea en el menú ni en el botón hamburguesa
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuAbierto]);

  // Efecto para manejar clicks fuera del componente de búsqueda
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup del timeout cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, []);

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
    setSuggestions([]);
  };
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Limpiar timeout anterior si existe
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }

    // Si el campo está vacío, limpiar sugerencias inmediatamente
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    fetch(`${API_URL}/api/busqueda?q=${encodeURIComponent(value)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Error de red o servidor');
        return res.json();
      })
      .then((data) => {
        // Filtra los productos por nombre y selección
        const filtered = data.filter(
          (producto) =>
            (producto.nombre && producto.nombre.toLowerCase().includes(value.toLowerCase())) ||
            (producto.seleccionNombre &&
              producto.seleccionNombre.toLowerCase().includes(value.toLowerCase()))
        );
        setSuggestions(filtered.slice(0, 5)); // Máximo 5 sugerencias

        // Programar que las sugerencias desaparezcan después de 5 segundos
        suggestionTimeoutRef.current = setTimeout(() => {
          setSuggestions([]);
        }, 5000);
      })
      .catch((err) => {
        console.error('Error al buscar sugerencias:', err);
        setSuggestions([]); // Limpia las sugerencias en caso de error
      });
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
    authLogout();
    window.dispatchEvent(new Event('cart:token-change'));
    setMenuAbierto(false);
    setSearchbarVisible(false);
    navigate('/login');
  };

  const searchbarComponent = (
    <div ref={searchRef} className={`search-container ${searchbarVisible ? 'active' : ''}`}>
      <input
        type="text"
        className="search-bar"
        placeholder="Buscar articulos..."
        aria-label="Buscar articulos"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          // Cancelar timeout si el usuario vuelve a hacer focus
          if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
          }
        }}
      />
      <button
        className="search-button"
        aria-label="Buscar"
        onClick={toggleSearchbar}
        title="Buscar Productos"
      >
        <i className="fas fa-search"></i>
      </button>
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((producto) => (
            <li
              key={producto.idProduct}
              onClick={() => handleSuggestionClick(producto.nombre)}
              className="suggestion-item"
            >
              {producto.nombre}
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
        <Link to="/" className="nav-link" onClick={() => setMenuAbierto(false)}>
          <i className="fa-solid fa-house"></i> Inicio
        </Link>
        {user && user.admin !== true && (
          <>
            <Link to="/catalogo" className="nav-link" onClick={() => setMenuAbierto(false)}>
              <i className="fa-solid fa-layer-group"></i> Catalogo
            </Link>
            <Link to="/mis-pedidos" className="nav-link" onClick={() => setMenuAbierto(false)}>
              <i className="fas fa-box"></i> Mis Pedidos
            </Link>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" className="nav-link" onClick={() => setMenuAbierto(false)}>
              <i className="fas fa-sign-in-alt"></i> Iniciar sesión
            </Link>
          </>
        )}

        {userSesion && user && user.admin === true && (
          <>
            <Link to="/admin/catalogo" className="nav-link" onClick={() => setMenuAbierto(false)}>
              <i className="fas fa-cogs"></i> Administar Catálogo
            </Link>
            <Link to="/admin/crear" className="nav-link" onClick={() => setMenuAbierto(false)}>
              <i className="fas fa-plus"></i> Subir Producto
            </Link>
            <Link to="/admin/pedidos" className="nav-link" onClick={() => setMenuAbierto(false)}>
              <i className="fas fa-clipboard-list"></i> Gestión Pedidos
            </Link>
            <Link to="/admin/reportes" className="nav-link" onClick={() => setMenuAbierto(false)}>
              <i className="fas fa-chart-bar"></i> Reportes
            </Link>
          </>
        )}
        {userSesion && (
          <Link onClick={handleLogout} className="nav-link">
            <i className="fas fa-sign-out-alt"></i> Cerrar sesión
          </Link>
        )}
      </nav>

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
        <Link to="/pedidos" className="user-link cart-link">
          <i className="fas fa-shopping-cart"></i>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>
      </div>
    </header>
  );
};

export default Header;
