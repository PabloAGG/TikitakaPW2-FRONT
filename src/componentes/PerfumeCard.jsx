import React, {use, useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate para navegar programáticamente
import './PerfumeCard.css'; // Crearemos este archivo para los estilos
import AlertMsg from './AlertMsg'; // Asegúrate de que la ruta sea correcta
// Este componente recibe un objeto 'perfume' con sus datos
const PerfumeCard = ({ perfume , isAdmin=false}) => {
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
        const perfumeExistenteIndex = pedidos.findIndex(p => p.idperfume === perfume.idperfume);
  let message;
    if (perfumeExistenteIndex > -1) {
        // Si existe, aumentamos la cantidad
        pedidos[perfumeExistenteIndex].cantidad += 1;
        message=`Se agregó otra unidad de "${perfume.nombre}" a tu pedido.`;
    } else {
        // Si no existe, lo agregamos como un nuevo pedido
        pedidos.push({
            idperfume: perfume.idperfume,
            cantidad: 1,
            fecha: new Date().toISOString()
        });
        message=`Perfume "${perfume.nombre}" agregado a tu pedido.`;
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
    navigate(`/perfume/${perfume.idperfume}`);
  };
const IrAEditar = (e) => {
  e.stopPropagation();
        navigate(`/admin/editar/${perfume.idperfume}`);
    };
  const handleDelete = (e) => {
        e.stopPropagation();
        
        // Mostrar mensaje de confirmación
        setAlertInfo({
            show: true,
            message: `¿Estás seguro de que quieres eliminar el perfume "${perfume.nombre}"?`,
            type: 'warning',
            isConfirm: true
        });
    };

    const confirmarEliminacion = async () => {
        try {
            const response = await fetch(`${API_URL}/api/perfumes/${perfume.idperfume}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar el perfume');
            }

            setAlertInfo({
                show: true,
                message: `Perfume "${perfume.nombre}" eliminado correctamente.`,
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
                message: 'Hubo un problema al eliminar el perfume. Inténtalo de nuevo más tarde.',
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
      {perfume.top && (
        <div className="top-badge">
          ⭐ Alta similitud
        </div>
      )}
      <div className='perfume-img-container'>
      <img 
        // Asumimos que tienes una columna 'imagen_url' o similar en tu tabla de perfumes
        src={`/IMG/${perfume.genero}/${perfume.marcap}/${perfume.img_path}` || 'https://via.placeholder.com/150'} 
        alt={`Perfume ${perfume.nombre}`} 
        className="perfume-image"
      />
       <img id='btMMCard' src='../IMG/cardBot.png' alt='Botella MariaMaria' loading='lazy' />
      </div>
         <p className='perfume-gen'>{perfume.genero}</p>
     
         <h3 className="perfume-name">{perfume.nombre}</h3>
         
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
    <Link to={irADetalle} className="perfume-button detailBtn">
      Ver más
    </Link>

</>
      )}
  </div>
    </div>
  );
};

export default PerfumeCard;
