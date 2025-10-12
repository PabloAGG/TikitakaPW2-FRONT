import React, {use, useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate para navegar programáticamente
import './PerfumeCard.css'; // Crearemos este archivo para los estilos
import AlertMsg from './AlertMsg'; // Asegúrate de que la ruta sea correcta
import CloudinaryImage from './CloudinaryImage';
import API_URL from '../config/api';

// Este componente recibe un objeto 'producto' con sus datos
const ProductoCard = ({ producto , isAdmin=false}) => {
   const [alertInfo, setAlertInfo] = useState({ 
        show: false, 
        message: '', 
        type: 'info', 
        isConfirm: false 
    });

      const navigate = useNavigate();


const AgregarPedido= (e) => {
        e.stopPropagation();
        
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        const productoExistenteIndex = pedidos.findIndex(p => p.idproducto === producto.idProduct);
  let message;
    if (productoExistenteIndex > -1) {
        // Si existe, aumentamos la cantidad
        pedidos[productoExistenteIndex].cantidad += 1;
        message=`Se agregó otra unidad de "${producto.nombre}" a tu pedido.`;
    } else {
        // Si no existe, lo agregamos como un nuevo pedido
        pedidos.push({
            idproducto: producto.idProduct,
            cantidad: 1,
            fecha: new Date().toISOString()
        });
        message=`Producto "${producto.nombre}" agregado a tu pedido.`;
    }

    // Guardamos el array actualizado en localStorage
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    setAlertInfo({ 
            show: true, 
            message, 
            type: 'success', 
            isConfirm: false 
        });
      }

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
            isConfirm: true
          
        });
    };

    const confirmarEliminacion = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/producto/${producto.idProduct}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el producto');
            }

            setAlertInfo({
                show: true,
                message: `Producto "${producto.nombre}" eliminado correctamente.`,
                type: 'success',
                isConfirm: false
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
                isConfirm: false
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

  // Debug: console log para ver los datos del producto
  console.log('Datos del producto en PerfumeCard:', {
    nombre: producto.nombre,
    Img: producto.Img,
    img: producto.img, // Por si acaso está en minúscula
    seleccionNombre: producto.seleccionNombre,
    seleccionnombre: producto.seleccionnombre
  });

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
      {producto.top && (
        <div className="top-badge">
          ⭐ Producto Destacado
        </div>
      )}
      <div className='perfume-img-container'>
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
         <p className='perfume-gen'>{producto.genero}</p>
         <p className='perfume-seleccion'>{producto.seleccionNombre || producto.seleccionnombre || 'Sin selección'}</p>
     
         <h3 className="perfume-name">{producto.nombre}</h3>
         
      <div className="perfume-card-buttons">
        {isAdmin ? (
          <>
    <button
      className="perfume-button editBtn"
      onClick={IrAEditar}
    >
     <i className="fa-solid fa-pen-to-square"></i> Editar
    </button>
    <button className="perfume-button bajaBtn" onClick={handleDelete}>
     <i className="fa-solid fa-trash"></i> Eliminar
    </button>
    </>
  ) : (
<>

<button
      className="perfume-button addBtn"
      onClick={AgregarPedido}
    >
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
