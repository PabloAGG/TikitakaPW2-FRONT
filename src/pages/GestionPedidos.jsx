import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Loading from '../componentes/loading';
import AlertMsg from '../componentes/AlertMsg';
import './GestionPedidos.css';

const GestionPedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ message: '', type: '', visible: false });
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const { token, user } = useAuth();

    const estadosColores = {
        'carrito': 'estado-carrito',
        'pendiente': 'estado-pendiente',
        'confirmado': 'estado-confirmado', 
        'completado': 'estado-completado',
        'cancelado': 'estado-cancelado'
    };

    const estadosTexto = {
        'carrito': 'En Carrito',
        'pendiente': 'Pendiente',
        'confirmado': 'Confirmado',
        'completado': 'Completado',
        'cancelado': 'Cancelado'
    };

    const estadosDisponibles = ['pendiente', 'confirmado', 'completado', 'cancelado'];

    useEffect(() => {
        if (user?.admin) {
            cargarTodosPedidos();
        }
    }, [user]);

    const cargarTodosPedidos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPedidos(data);
            } else {
                throw new Error('Error al cargar pedidos');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarAlert('Error al cargar los pedidos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
        try {
            const pedido = pedidos.find(p => p.idPedido === pedidoId);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos/${pedidoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    estado: nuevoEstado,
                    cantidad: pedido?.cantidad || 1
                })
            });

            if (response.ok) {
                setPedidos(pedidos.map(pedido => 
                    pedido.idPedido === pedidoId 
                        ? { ...pedido, estado: nuevoEstado }
                        : pedido
                ));
                mostrarAlert(`Pedido actualizado a ${estadosTexto[nuevoEstado]}`, 'success');
            } else {
                throw new Error('Error al actualizar pedido');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarAlert('Error al actualizar el pedido', 'error');
        }
    };

    const mostrarAlert = (message, type) => {
        setAlert({ message, type, visible: true });
        setTimeout(() => {
            setAlert({ message: '', type: '', visible: false });
        }, 4000);
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const pedidosFiltrados = pedidos.filter(pedido => {
        if (filtroEstado === 'todos') return pedido.estado !== 'carrito';
        return pedido.estado === filtroEstado;
    });

    const contarPorEstado = (estado) => {
        return pedidos.filter(p => p.estado === estado).length;
    };

    if (!user?.admin) {
        return (
            <div className="acceso-denegado">
                <h2>Acceso Denegado</h2>
                <p>Solo los administradores pueden acceder a esta sección.</p>
            </div>
        );
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="gestion-pedidos">
            <div className="gestion-header">
                <h1>Gestión de Pedidos</h1>
                <p>Administra todos los pedidos del sistema</p>
            </div>

            {alert.visible && (
                <AlertMsg 
                    message={alert.message} 
                    type={alert.type} 
                    onClose={() => setAlert({ ...alert, visible: false })} 
                />
            )}

            {/* Estadísticas rápidas */}
            <div className="estadisticas">
                <div className="stat-card">
                    <span className="stat-numero">{contarPorEstado('pendiente')}</span>
                    <span className="stat-label">Pendientes</span>
                </div>
                <div className="stat-card">
                    <span className="stat-numero">{contarPorEstado('confirmado')}</span>
                    <span className="stat-label">Confirmados</span>
                </div>
                <div className="stat-card">
                    <span className="stat-numero">{contarPorEstado('completado')}</span>
                    <span className="stat-label">Completados</span>
                </div>
                <div className="stat-card">
                    <span className="stat-numero">{contarPorEstado('cancelado')}</span>
                    <span className="stat-label">Cancelados</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="filtros">
                <label htmlFor="filtro-estado">Filtrar por estado:</label>
                <select 
                    id="filtro-estado"
                    value={filtroEstado} 
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="filtro-select"
                >
                    <option value="todos">Todos los pedidos</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="confirmado">Confirmados</option>
                    <option value="completado">Completados</option>
                    <option value="cancelado">Cancelados</option>
                </select>
            </div>

            {pedidosFiltrados.length === 0 ? (
                <div className="no-pedidos">
                    <div className="no-pedidos-icon">📋</div>
                    <h3>No hay pedidos con ese filtro</h3>
                    <p>Cambia el filtro para ver otros pedidos.</p>
                </div>
            ) : (
                <div className="pedidos-tabla">
                    <div className="tabla-header">
                        <div className="th">ID</div>
                        <div className="th">Cliente</div>
                        <div className="th">Producto</div>
                        <div className="th">Cantidad</div>
                        <div className="th">Estado</div>
                        <div className="th">Fecha</div>
                        <div className="th">Acciones</div>
                    </div>
                    
                    {pedidosFiltrados.map((pedido) => (
                        <div key={pedido.idPedido} className="tabla-fila">
                            <div className="td">#{pedido.idPedido}</div>
                            <div className="td">
                                <div className="cliente-info">
                                    <strong>{pedido.usuarioNombre} {pedido.usuarioApellidos}</strong>
                                </div>
                            </div>
                            <div className="td">
                                <div className="producto-info-mini">
                                    <strong>{pedido.productoNombre}</strong>
                                </div>
                            </div>
                            <div className="td">
                                <span className="cantidad-badge">{pedido.cantidad}</span>
                            </div>
                            <div className="td">
                                <span className={`estado-badge ${estadosColores[pedido.estado]}`}>
                                    {estadosTexto[pedido.estado]}
                                </span>
                            </div>
                            <div className="td">
                                <small>{formatearFecha(pedido.created_at)}</small>
                            </div>
                            <div className="td">
                                <div className="acciones">
                                    <select 
                                        value={pedido.estado}
                                        onChange={(e) => cambiarEstadoPedido(pedido.idPedido, e.target.value)}
                                        className="estado-select"
                                        disabled={pedido.estado === 'completado'}
                                    >
                                        {estadosDisponibles.map(estado => (
                                            <option key={estado} value={estado}>
                                                {estadosTexto[estado]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="totales">
                <p>Mostrando {pedidosFiltrados.length} de {pedidos.filter(p => p.estado !== 'carrito').length} pedidos</p>
            </div>
        </div>
    );
};

export default GestionPedidos;