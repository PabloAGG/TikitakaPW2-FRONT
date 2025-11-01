import { Box, Button, Rating, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Hook para leer los parámetros de la URL
import AlertMsg from '../componentes/AlertMsg';
import Loading from '../componentes/loading'; // Componente de carga
import MediaCarousel from '../componentes/MediaCarousel'; // Nuevo carrusel
import ProductoCard from '../componentes/PerfumeCard';
import API_URL from '../config/api';
import './PerfumeDetail.css';
const ProductoDetail = () => {
  // useParams nos da un objeto con los parámetros, en este caso { id: '...' }
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [multimedia, setMultimedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estrellas, setEstrellas] = useState({ promedio: 0, total: 0 });
  const [miCalificacion, setMiCalificacion] = useState(null);
  const [nuevaCalificacion, setNuevaCalificacion] = useState(0);
  const [enviandoCalificacion, setEnviandoCalificacion] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [comentarioMensaje, setComentarioMensaje] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [recomendados, setRecomendados] = useState([]);
  const capitalizarPrimeraPalabraExacto = (texto) => {
    if (!texto) return '';
    const palabras = texto.split(' ');
    palabras[0] = palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1);
    return palabras.join(' ');
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (error) {
      return '';
    }
  };

  // Función para enviar calificación
  const enviarCalificacion = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMensaje({ texto: 'Debes iniciar sesión para calificar', tipo: 'error' });
      return;
    }

    if (nuevaCalificacion === 0) {
      setMensaje({ texto: 'Selecciona una calificación', tipo: 'error' });
      return;
    }

    setEnviandoCalificacion(true);

    try {
      const response = await fetch(`${API_URL}/api/productos/${id}/calificar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estrellas: nuevaCalificacion }),
      });

      if (response.ok) {
        const data = await response.json();
        setMiCalificacion(nuevaCalificacion);
        setMensaje({ texto: data.message, tipo: 'success' });

        // Recargar las estrellas para actualizar el promedio
        await cargarEstrellas();
      } else {
        const errorData = await response.json();
        setMensaje({ texto: errorData.error || 'Error al enviar calificación', tipo: 'error' });
      }
    } catch (error) {
      console.error('Error enviando calificación:', error);
      setMensaje({ texto: 'Error de conexión', tipo: 'error' });
    } finally {
      setEnviandoCalificacion(false);
    }
  };

  // Limpiar mensaje después de 3 segundos
  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);
  useEffect(() => {
    if (comentarioMensaje) {
      const timer = setTimeout(() => setComentarioMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [comentarioMensaje]);
  // Función para cargar las estrellas del producto
  const cargarEstrellas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/productos/${id}/estrellas`);
      if (response.ok) {
        const data = await response.json();
        setEstrellas(data);
      }
    } catch (error) {
      console.error('Error cargando estrellas:', error);
    }
  };

  const cargarComentarios = async () => {
    try {
      const response = await fetch(`${API_URL}/api/productos/${id}/comentarios`);
      if (response.ok) {
        const data = await response.json();
        setComentarios(data);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    }
  };

  // Función para cargar la calificación del usuario actual
  const cargarMiCalificacion = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/productos/${id}/mi-calificacion`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMiCalificacion(data.calificacion);
        setNuevaCalificacion(data.calificacion || 0);
      }
    } catch (error) {
      console.error('Error cargando mi calificación:', error);
    }
  };

  const cargarRecomendados = async (seleccionId) => {
    if (!seleccionId) return;
    try {
      const response = await fetch(
        `${API_URL}/api/productos?seleccion=${seleccionId}&exclude=${id}&limit=4`
      );
      if (response.ok) {
        const data = await response.json();
        setRecomendados(data);
      }
    } catch (error) {
      console.error('Error cargando recomendados:', error);
    }
  };

  const enviarComentario = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setComentarioMensaje({ texto: 'Debes iniciar sesión para comentar', tipo: 'error' });
      return;
    }

    if (!nuevoComentario.trim()) {
      setComentarioMensaje({ texto: 'Escribe un comentario antes de enviarlo', tipo: 'error' });
      return;
    }

    setEnviandoComentario(true);

    try {
      const response = await fetch(`${API_URL}/api/productos/${id}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contenido: nuevoComentario }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'No se pudo enviar el comentario');
      }

      const comentarioCreado = await response.json();
      setComentarios((prev) => [comentarioCreado, ...prev]);
      setNuevoComentario('');
      setComentarioMensaje({ texto: '¡Comentario publicado!', tipo: 'success' });
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      setComentarioMensaje({ texto: error.message, tipo: 'error' });
    } finally {
      setEnviandoComentario(false);
    }
  };

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        setComentarios([]);
        setRecomendados([]);
        setMensaje(null);
        setComentarioMensaje(null);

        // Cargar producto, multimedia y estrellas en paralelo
        const [productoResponse, multimediaResponse] = await Promise.all([
          fetch(`${API_URL}/api/producto/${id}`),
          fetch(`${API_URL}/api/multimedia/${id}`),
        ]);

        if (!productoResponse.ok) {
          throw new Error('Producto no encontrado');
        }

        const productoData = await productoResponse.json();
        setProducto(productoData);

        // Cargar multimedia (siempre, aunque esté vacío)
        if (multimediaResponse.ok) {
          const multimediaData = await multimediaResponse.json();
          console.log('Multimedia cargada para el producto:', multimediaData);
          setMultimedia(multimediaData || []);
        } else {
          console.warn('No se pudo cargar multimedia para el producto', id);
          setMultimedia([]);
        }

        // Cargar estrellas y calificación del usuario
        await Promise.all([cargarEstrellas(), cargarMiCalificacion(), cargarComentarios()]);
        await cargarRecomendados(productoData.seleccion);
      } catch (err) {
        console.error('Error cargando producto:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id]); // Se ejecuta cada vez que el 'id' de la URL cambie

  if (loading) return <Loading />; // Muestra el componente de carga mientras se obtienen los datos
  if (error) return <p>Error: {error}</p>;
  if (!producto) return <p>No se encontró el producto.</p>;

  return (
    <div className="perfume-detail">
      <div className="detail-image-container">
        {/* Usar el nuevo carrusel de multimedia */}
        <MediaCarousel multimedia={multimedia} productName={producto.nombre} />
      </div>
      <div className="detail-info-container">
        <h1 className="detail-name">{producto.nombre}</h1>
        <h2 className="detail-marca">{producto.seleccionnombre || 'Sin selección'}</h2>
        <p className="detail-description">
          {capitalizarPrimeraPalabraExacto(producto.descripcion)}
        </p>
        <div className="detail-meta">
          <p>
            <strong>Género:</strong> {producto.genero}
          </p>
          {producto.top && <p className="destacado-badge">⭐ Producto Destacado</p>}
        </div>
        <div className="detail-rating">
          <Typography variant="h6" component="h3" gutterBottom>
            Calificaciones
          </Typography>
          <Box display="flex" alignItems="center" mb={2}>
            <Rating
              name="average-rating"
              value={estrellas.promedio}
              readOnly
              precision={0.1}
              size="large"
            />
            <Typography variant="body1" ml={1}>
              {estrellas.promedio.toFixed(1)} ({estrellas.total}{' '}
              {estrellas.total === 1 ? 'calificación' : 'calificaciones'})
            </Typography>
          </Box>

          {/* Sección para calificar */}
          <Box
            className="user-rating-section"
            p={2}
            border={1}
            borderColor="grey.300"
            borderRadius={2}
          >
            <Typography variant="h6" gutterBottom>
              {miCalificacion ? 'Tu calificación' : 'Califica este producto'}
            </Typography>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Rating
                name="user-rating"
                value={nuevaCalificacion}
                onChange={(event, newValue) => {
                  setNuevaCalificacion(newValue || 0);
                }}
                size="large"
                precision={1}
              />
              <Typography variant="body2">
                {nuevaCalificacion > 0 &&
                  `${nuevaCalificacion} estrella${nuevaCalificacion !== 1 ? 's' : ''}`}
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="primary"
              onClick={enviarCalificacion}
              disabled={enviandoCalificacion || nuevaCalificacion === 0}
              size="small"
            >
              {enviandoCalificacion
                ? 'Enviando...'
                : miCalificacion
                ? 'Actualizar calificación'
                : 'Enviar calificación'}
            </Button>

            {miCalificacion && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                Calificación anterior: {miCalificacion} estrella{miCalificacion !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>

          {mensaje && (
            <Box mt={2}>
              <AlertMsg message={mensaje.texto} type={mensaje.tipo} />
            </Box>
          )}
        </div>
        <div className="detail-comments">
          <Typography variant="h6" component="h3" gutterBottom>
            Comentarios
          </Typography>
          {comentarios.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aún no hay comentarios. ¡Sé la primera persona en opinar!
            </Typography>
          ) : (
            <ul className="comentarios-list">
              {comentarios.map((comentario) => (
                <li key={comentario.id} className="comentario-item">
                  <p className="comentario-autor">
                    <strong>
                      {comentario.usuario?.nombre} {comentario.usuario?.apellidos}
                    </strong>
                    <span>{formatearFecha(comentario.createdAt)}</span>
                  </p>
                  <p>{comentario.contenido}</p>
                </li>
              ))}
            </ul>
          )}

          <Box component="form" onSubmit={enviarComentario} className="comentario-form">
            <TextField
              label="Escribe un comentario"
              multiline
              minRows={3}
              fullWidth
              value={nuevoComentario}
              onChange={(event) => setNuevoComentario(event.target.value)}
            />
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              disabled={enviandoComentario}
            >
              {enviandoComentario ? 'Enviando...' : 'Publicar comentario'}
            </Button>
          </Box>
          {comentarioMensaje && (
            <Box mt={2}>
              <AlertMsg message={comentarioMensaje.texto} type={comentarioMensaje.tipo} />
            </Box>
          )}
        </div>
      </div>
      {recomendados.length > 0 && (
        <div className="detail-recommendations">
          <Typography variant="h6" component="h3" gutterBottom>
            También podría interesarte
          </Typography>
          <div className="recommendations-grid">
            {recomendados.map((recomendado) => (
              <ProductoCard key={recomendado.idProduct} producto={recomendado} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductoDetail;
