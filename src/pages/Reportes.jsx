import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../componentes/loading';
import { useAuth } from '../context/AuthContext';
import './Reportes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Reportes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('productos-vendidos');

  const [productosVendidos, setProductosVendidos] = useState([]);
  const [productosCalificados, setProductosCalificados] = useState([]);
  const [usuariosNuevos, setUsuariosNuevos] = useState([]);
  const [usuariosPedidos, setUsuariosPedidos] = useState([]);

  useEffect(() => {
    if (!user?.admin) {
      navigate('/');
      return;
    }
    cargarReportes();
  }, [user, navigate]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [vendidos, calificados, nuevos, pedidos] = await Promise.all([
        fetch(`${API_URL}/api/reportes/productos-mas-vendidos`, { headers }),
        fetch(`${API_URL}/api/reportes/productos-mejor-calificados`, { headers }),
        fetch(`${API_URL}/api/reportes/usuarios-nuevos`, { headers }),
        fetch(`${API_URL}/api/reportes/usuarios-mas-pedidos`, { headers }),
      ]);

      const [vendidosData, calificadosData, nuevosData, pedidosData] = await Promise.all([
        vendidos.json(),
        calificados.json(),
        nuevos.json(),
        pedidos.json(),
      ]);

      setProductosVendidos(vendidosData);
      setProductosCalificados(calificadosData);
      setUsuariosNuevos(nuevosData);
      setUsuariosPedidos(pedidosData);
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="reportes-container">
      <h1 className="reportes-titulo">📊 Reportes y Estadísticas</h1>

      <div className="reportes-tabs">
        <button
          className={`tab-btn ${activeTab === 'productos-vendidos' ? 'active' : ''}`}
          onClick={() => setActiveTab('productos-vendidos')}
        >
          🏆 Más Vendidos
        </button>
        <button
          className={`tab-btn ${activeTab === 'productos-calificados' ? 'active' : ''}`}
          onClick={() => setActiveTab('productos-calificados')}
        >
          ⭐ Mejor Calificados
        </button>
        <button
          className={`tab-btn ${activeTab === 'usuarios-nuevos' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios-nuevos')}
        >
          👤 Usuarios Nuevos
        </button>
        <button
          className={`tab-btn ${activeTab === 'usuarios-pedidos' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios-pedidos')}
        >
          🛍️ Más Pedidos
        </button>
      </div>

      <div className="reportes-contenido">
        {activeTab === 'productos-vendidos' && (
          <div className="reporte-seccion">
            <h2>Productos Más Vendidos</h2>
            <div className="tabla-wrapper">
              <table className="reportes-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Género</th>
                    <th>Selección</th>
                    <th>Total Vendido</th>
                    <th>Num. Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {productosVendidos.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="texto-vacio">
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    productosVendidos.map((producto, index) => (
                      <tr key={producto.idProduct}>
                        <td>{index + 1}</td>
                        <td>
                          {producto.img ? (
                            <img src={producto.img} alt={producto.nombre} className="tabla-img" />
                          ) : (
                            <div className="tabla-img-placeholder">Sin imagen</div>
                          )}
                        </td>
                        <td className="texto-izquierda">{producto.nombre}</td>
                        <td>{producto.genero}</td>
                        <td>{producto.seleccionNombre || 'N/A'}</td>
                        <td className="texto-destacado">{producto.total_vendido}</td>
                        <td>{producto.num_pedidos}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'productos-calificados' && (
          <div className="reporte-seccion">
            <h2>Productos Mejor Calificados</h2>
            <div className="tabla-wrapper">
              <table className="reportes-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Género</th>
                    <th>Selección</th>
                    <th>Promedio</th>
                    <th>Calificaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosCalificados.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="texto-vacio">
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    productosCalificados.map((producto, index) => (
                      <tr key={producto.idProduct}>
                        <td>{index + 1}</td>
                        <td>
                          {producto.img ? (
                            <img src={producto.img} alt={producto.nombre} className="tabla-img" />
                          ) : (
                            <div className="tabla-img-placeholder">Sin imagen</div>
                          )}
                        </td>
                        <td className="texto-izquierda">{producto.nombre}</td>
                        <td>{producto.genero}</td>
                        <td>{producto.seleccionNombre || 'N/A'}</td>
                        <td className="texto-destacado">
                          ⭐ {parseFloat(producto.promedio_estrellas).toFixed(1)}
                        </td>
                        <td>{producto.num_calificaciones}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'usuarios-nuevos' && (
          <div className="reporte-seccion">
            <h2>Usuarios Nuevos</h2>
            <div className="tabla-wrapper">
              <table className="reportes-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Selección</th>
                    <th>Fecha Registro</th>
                    <th>Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosNuevos.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="texto-vacio">
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    usuariosNuevos.map((usuario, index) => (
                      <tr key={usuario.idUser}>
                        <td>{index + 1}</td>
                        <td className="texto-izquierda">{usuario.nombre}</td>
                        <td className="texto-izquierda">{usuario.apellidos}</td>
                        <td className="texto-izquierda">{usuario.correo}</td>
                        <td>{usuario.telf}</td>
                        <td>{usuario.seleccionNombre || 'N/A'}</td>
                        <td>{formatearFecha(usuario.fecha_registro)}</td>
                        <td>{usuario.num_pedidos}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'usuarios-pedidos' && (
          <div className="reporte-seccion">
            <h2>Usuarios con Más Pedidos</h2>
            <div className="tabla-wrapper">
              <table className="reportes-tabla">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Selección</th>
                    <th>Num. Pedidos</th>
                    <th>Total Productos</th>
                    <th>Último Pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosPedidos.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="texto-vacio">
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    usuariosPedidos.map((usuario, index) => (
                      <tr key={usuario.idUser}>
                        <td>{index + 1}</td>
                        <td className="texto-izquierda">{usuario.nombre}</td>
                        <td className="texto-izquierda">{usuario.apellidos}</td>
                        <td className="texto-izquierda">{usuario.correo}</td>
                        <td>{usuario.telf}</td>
                        <td>{usuario.seleccionNombre || 'N/A'}</td>
                        <td className="texto-destacado">{usuario.num_pedidos}</td>
                        <td>{usuario.total_productos}</td>
                        <td>{formatearFecha(usuario.ultimo_pedido)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reportes;
