import { useEffect, useState } from 'react';
import AlertMsg from '../componentes/AlertMsg';
import Loading from '../componentes/loading';
import { useAuth } from '../context/AuthContext';
import './MisPedidos.css';

const MisPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ message: '', type: '', visible: false });
  const { token } = useAuth();

  const estadosColores = {
    pendiente: 'estado-pendiente',
    confirmado: 'estado-confirmado',
    completado: 'estado-completado',
    cancelado: 'estado-cancelado',
  };

  const estadosTexto = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    completado: 'Completado',
    cancelado: 'Cancelado',
  };

  useEffect(() => {
    cargarMisPedidos();
  }, []);

  const cargarMisPedidos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos/mis-pedidos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const marcarComoCompletado = async (pedidoId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: 'completado',
          cantidad: pedidos.find((p) => p.idPedido === pedidoId)?.cantidad,
        }),
      });

      if (response.ok) {
        setPedidos(
          pedidos.map((pedido) =>
            pedido.idPedido === pedidoId ? { ...pedido, estado: 'completado' } : pedido
          )
        );
        mostrarAlert('Pedido marcado como completado', 'success');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mis-pedidos">
      <div className="mis-pedidos-header">
        <h1>Mis Pedidos</h1>
        <p>Aquí puedes ver el estado de todos tus pedidos y confirmar cuando los hayas recibido.</p>
      </div>

      {alert.visible && (
        <AlertMsg
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ ...alert, visible: false })}
        />
      )}

      {pedidos.length === 0 ? (
        <div className="no-pedidos">
          <div className="no-pedidos-icon">
            <i className="fas fa-box-open"></i>
          </div>
          <h3>No tienes pedidos aún</h3>
          <p>Cuando realices tu primer pedido, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="pedidos-grid">
          {pedidos.map((pedido) => (
            <div key={pedido.idPedido} className="pedido-card">
              <div className="pedido-header">
                <span className="pedido-id">Pedido #{pedido.idPedido}</span>
                <span className={`estado-badge ${estadosColores[pedido.estado]}`}>
                  {estadosTexto[pedido.estado]}
                </span>
              </div>

              <div className="pedido-contenido">
                <div className="producto-info">
                  {pedido.img && (
                    <img src={pedido.img} alt={pedido.productoNombre} className="producto-imagen" />
                  )}
                  <div className="producto-detalles">
                    <h3>{pedido.productoNombre}</h3>
                    <p className="producto-categoria">{pedido.seleccionNombre}</p>
                    <p className="producto-genero">{pedido.productoGenero}</p>
                    <div className="cantidad">
                      <strong>Cantidad: {pedido.cantidad}</strong>
                    </div>
                  </div>
                </div>

                <div className="pedido-fecha">
                  <small>Realizado el {formatearFecha(pedido.created_at)}</small>
                </div>

                {pedido.estado === 'confirmado' && (
                  <div className="pedido-acciones">
                    <button
                      className="btn-completar"
                      onClick={() => marcarComoCompletado(pedido.idPedido)}
                    >
                      ✓ Confirmar recepción
                    </button>
                    <small className="ayuda-texto">
                      Marca como completado cuando hayas recibido tu pedido
                    </small>
                  </div>
                )}

                {pedido.estado === 'completado' && (
                  <div className="pedido-completado">
                    <span className="completado-icon">
                      <i className="fas fa-check-circle"></i>
                    </span>
                    <span>Pedido completado</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPedidos;
