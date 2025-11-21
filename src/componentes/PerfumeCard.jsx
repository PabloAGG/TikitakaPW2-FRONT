import { Rating } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL from '../config/api';
import { useCart } from '../context/CartContext';
import AlertMsg from './AlertMsg'; // Asegúrate de que la ruta sea correcta
import CloudinaryImage from './CloudinaryImage';
import './PerfumeCard.css'; // Crearemos este archivo para los estilos

// Este componente recibe un objeto 'producto' con sus datos
const ProductoCard = ({ producto, isAdmin = false }) => {
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: '',
    type: 'info',
    isConfirm: false,
  });
  const [ratingInfo, setRatingInfo] = useState({ promedio: 0, total: 0 });
  const [ratingLoaded, setRatingLoaded] = useState(false);

  const navigate = useNavigate();
  const { addItem, items, DEFAULT_PRICE } = useCart();

  const AgregarPedido = async (e) => {
    e.stopPropagation();
    const alreadyInCart = items.some((item) => item.productId === producto.idProduct);

    try {
      const agregado = await addItem({ ...producto, precio: producto.precio ?? DEFAULT_PRICE });

      if (!agregado) {
        return;
      }

      const message = alreadyInCart
        ? `Se agregó otra unidad de "${producto.nombre}" a tu pedido.`
        : `Producto "${producto.nombre}" agregado a tu pedido.`;

      setAlertInfo({
        show: true,
        message,
        type: 'success',
        isConfirm: false,
      });
    } catch (error) {
      if (error.code === 'AUTH_REQUIRED') {
        setAlertInfo({
          show: true,
          message: 'Inicia sesión para agregar productos al carrito.',
          type: 'warning',
          isConfirm: false,
        });
        navigate('/login', {
          state: { error: 'Inicia sesión para agregar productos al carrito.' },
        });
        return;
      }

      setAlertInfo({
        show: true,
        message: 'No se pudo agregar el producto al carrito. Intenta nuevamente.',
        type: 'error',
        isConfirm: false,
      });
    }
  };

  const irADetalle = () => {
    navigate(`/producto/${producto.idProduct}`);
  };
  const IrAEditar = (e) => {
    e.stopPropagation();
    navigate(`/admin/editar/${producto.idProduct}`);
  };
  const handleDelete = (e) => {
    e.stopPropagation();

    // Mostrar mensaje de confirmación
    setAlertInfo({
      show: true,
      message: `¿Estás seguro de que quieres eliminar el producto "${producto.nombre}"?`,
      type: 'warning',
      isConfirm: true,
    });
  };

  const confirmarEliminacion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/producto/${producto.idProduct}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      setAlertInfo({
        show: true,
        message: `Producto "${producto.nombre}" eliminado correctamente.`,
        type: 'success',
        isConfirm: false,
      });

      // Opcional: redirigir después de un delay
      setTimeout(() => {
        navigate('/admin/catalogo');
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setAlertInfo({
        show: true,
        message: 'Hubo un problema al eliminar el producto. Inténtalo de nuevo más tarde.',
        type: 'error',
        isConfirm: false,
      });
    }
  };

  const cerrarAlert = () => {
    setAlertInfo({ show: false, message: '', type: 'info', isConfirm: false });
  };

  useEffect(() => {
    // Limpiar el mensaje de alerta al desmontar el componente
    return () => {
      setAlertInfo({ show: false, message: '', type: 'info', isConfirm: false });
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (alertInfo.show) {
        setAlertInfo({ ...alertInfo, show: false });
      }
    }, 3000); // Ocultar después de 5 segundos
  }, [alertInfo.show]);

  useEffect(() => {
    let isActive = true;

    const fetchRating = async () => {
      try {
        const response = await fetch(`${API_URL}/api/productos/${producto.idProduct}/estrellas`);
        if (!response.ok) {
          throw new Error('No se pudo obtener la calificación');
        }
        const data = await response.json();
        if (isActive) {
          setRatingInfo({
            promedio: Number(data.promedio) || 0,
            total: Number(data.total) || 0,
          });
          setRatingLoaded(true);
        }
      } catch (error) {
        if (isActive) {
          setRatingInfo({ promedio: 0, total: 0 });
          setRatingLoaded(true);
        }
      }
    };

    fetchRating();

    return () => {
      isActive = false;
    };
  }, [producto.idProduct]);

  // Usar la imagen que esté disponible
  const imagenUrl = producto.img || producto.Img;

  return (
    <div className="perfume-card" onClick={irADetalle}>
      {alertInfo.show && (
        <AlertMsg
          message={alertInfo.message}
          type={alertInfo.type}
          isConfirm={alertInfo.isConfirm}
          onConfirm={alertInfo.isConfirm ? confirmarEliminacion : null}
          onCancel={cerrarAlert}
        />
      )}
      {producto.top && <div className="top-badge">Producto Destacado</div>}
      <div className="perfume-img-container">
        {imagenUrl ? (
          <CloudinaryImage
            url={imagenUrl}
            alt={`Producto ${producto.nombre}`}
            className="perfume-image"
            loading="lazy"
            width="200"
            height="150"
          />
        ) : (
          <img
            src={`https://via.placeholder.com/200x150?text=${encodeURIComponent(producto.nombre)}`}
            alt={`Producto ${producto.nombre}`}
            className="perfume-image"
            loading="lazy"
          />
        )}
      </div>
      <p className="perfume-gen">{producto.genero}</p>
      <p className="perfume-seleccion">
        {producto.seleccionNombre || producto.seleccionnombre || 'Sin selección'}
      </p>

      <h3 className="perfume-name">{producto.nombre}</h3>

      <div className="perfume-rating">
        <Rating
          value={ratingInfo.promedio}
          precision={0.5}
          readOnly
          size="small"
          icon={<span style={{ fontSize: '1.2em' }}>⚽</span>}
          emptyIcon={<span style={{ fontSize: '1.2em', opacity: 0.3 }}>⚽</span>}
        />
        <span className="perfume-rating-text">
          {ratingLoaded
            ? ratingInfo.total > 0
              ? `${ratingInfo.promedio.toFixed(1)} (${ratingInfo.total})`
              : '0 (0)'
            : 'Cargando...'}
        </span>
      </div>

      <p className="perfume-price">
        ${producto.precio ? Number(producto.precio).toFixed(2) : '300.00'}
      </p>

      <div className="perfume-card-buttons">
        {isAdmin ? (
          <>
            <button className="perfume-button editBtn" onClick={IrAEditar}>
              <i className="fa-solid fa-pen-to-square"></i> Editar
            </button>
            <button className="perfume-button bajaBtn" onClick={handleDelete}>
              <i className="fa-solid fa-trash"></i> Eliminar
            </button>
          </>
        ) : (
          <>
            <button className="perfume-button addBtn" onClick={AgregarPedido}>
              Agregar a pedido
            </button>
            <Link to={`/producto/${producto.idProduct}`} className="perfume-button detailBtn">
              Ver más
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductoCard;
