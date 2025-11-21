import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMsg from '../componentes/AlertMsg';
import Loading from '../componentes/loading';
import MultimediaUpload from '../componentes/MultimediaUpload';
import API_URL from '../config/api';
import './PerfumeEdit.css';

const ProductoEdit = ({ isCreating = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    message: '',
    type: 'info',
    isConfirm: false,
  });
  const [producto, setProducto] = useState(null);
  const [selecciones, setSelecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [archivosSubidos, setArchivosSubidos] = useState([]);
  const multimediaUploadRef = useRef(null);

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    seleccion: '',
    descripcion: '',
    genero: '',
    top: false,
    precio: 300,
  });

  const capitalizarPrimeraPalabraExacto = (texto) => {
    if (!texto) return '';
    const palabras = texto.split(' ');
    palabras[0] = palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1);
    return palabras.join(' ');
  };

  // Cargar datos del producto y selecciones
  useEffect(() => {
    if (!isCreating) {
      const fetchData = async () => {
        try {
          setLoading(true);

          // Cargar producto y selecciones en paralelo
          const [productoResponse, seleccionesResponse] = await Promise.all([
            fetch(`${API_URL}/api/producto/${id}`),
            fetch(`${API_URL}/api/selecciones`),
          ]);

          if (!productoResponse.ok) {
            throw new Error('Producto no encontrado');
          }
          if (!seleccionesResponse.ok) {
            throw new Error('Error al cargar selecciones');
          }

          const productoData = await productoResponse.json();
          const seleccionesData = await seleccionesResponse.json();

          setProducto(productoData);
          setSelecciones(seleccionesData);

          // Llenar el formulario con los datos existentes
          setFormData({
            nombre: productoData.nombre || '',
            seleccion: productoData.seleccion || '',
            descripcion: productoData.descripcion || '',
            genero: productoData.genero || '',
            top: productoData.top || false,
            Img: productoData.Img || '',
            precio: productoData.precio || 300,
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      const fetchSelecciones = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_URL}/api/selecciones`);
          if (!response.ok) {
            throw new Error('Error al cargar selecciones');
          }
          const seleccionesData = await response.json();
          setSelecciones(seleccionesData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchSelecciones();

      setFormData({
        nombre: '',
        seleccion: '',
        descripcion: '',
        genero: '',
        top: false,
        precio: 300,
      });
    }
  }, [id, isCreating]);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.seleccion) {
      newErrors.seleccion = 'La selección es requerida';
    }
    if (!formData.genero) {
      newErrors.genero = 'El género es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Obtener token para autenticación
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    if (!isCreating) {
      try {
        // 1. Actualizar el producto
        const response = await fetch(`${API_URL}/api/producto/${id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al actualizar el producto');
        }

        // 2. Si hay archivos nuevos subidos, reemplazar la multimedia
        if (archivosSubidos.length > 0 && multimediaUploadRef.current) {
          try {
            console.log('Reemplazando multimedia con:', archivosSubidos);
            await multimediaUploadRef.current.replaceAllMultimedia(archivosSubidos);
            console.log('Multimedia reemplazada exitosamente');
          } catch (multimediaError) {
            console.error('Error al reemplazar multimedia:', multimediaError);
            // Mostrar advertencia pero no fallar el proceso
            setAlertInfo({
              show: true,
              message:
                'Producto actualizado, pero hubo un problema con las imágenes. Inténtalo de nuevo.',
              type: 'warning',
              isConfirm: false,
            });
            return; // No navegar si hay error con multimedia
          }
        }

        navigate('/admin/catalogo', { state: { success: 'Producto actualizado correctamente.' } });
      } catch (error) {
        console.error('Error:', error);
        setAlertInfo({
          show: true,
          message: error.message || 'Error al actualizar el producto. Inténtalo de nuevo.',
          type: 'error',
          isConfirm: false,
        });
      } finally {
        setLoading(false);
      }
    } else {
      try {
        console.log('Enviando datos del producto:', formData);
        const response = await fetch(`${API_URL}/api/producto`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error del servidor:', errorData);
          throw new Error(errorData.error || 'Error al crear el producto');
        }

        const nuevoProducto = await response.json();
        console.log('Producto creado exitosamente:', nuevoProducto);

        // Si hay archivos subidos, guardarlos en la base de datos
        if (archivosSubidos.length > 0) {
          try {
            await fetch(`${API_URL}/api/multimedia`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                producto: nuevoProducto.idProduct,
                urls: archivosSubidos.map((archivo) => ({
                  url: archivo.url,
                  tipo: archivo.tipo,
                })),
              }),
            });
            console.log('Multimedia guardada exitosamente');
          } catch (multimediaError) {
            console.error('Error al guardar multimedia:', multimediaError);
            // No fallar el proceso completo por multimedia
          }
        }

        navigate('/admin/catalogo', { state: { success: 'Producto creado correctamente.' } });
      } catch (error) {
        console.error('Error completo:', error);
        setAlertInfo({
          show: true,
          message: error.message || 'Error al crear el producto. Inténtalo de nuevo.',
          type: 'error',
          isConfirm: false,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const cerrarAlert = () => {
    setAlertInfo({ show: false, message: '', type: 'info', isConfirm: false });
  };

  if (loading) return <Loading />;
  if (error) return <p>Error: {error}</p>;
  if (!isCreating && !producto) return <p>No se encontró el producto.</p>;

  return (
    <div className="perfume-edit-container">
      {alertInfo.show && (
        <AlertMsg
          message={alertInfo.message}
          type={alertInfo.type}
          isConfirm={alertInfo.isConfirm}
          onCancel={cerrarAlert}
        />
      )}
      {!isCreating && producto && (
        <div className="detail-image-container">
          <img src={`${producto.Img}`} alt={producto.nombre} />
        </div>
      )}
      <div className="Edit-info-container">
        {!isCreating ? <h2>Editar Producto</h2> : <h2>Crear Producto</h2>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                className="perfume-input"
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
              {errors.nombre && <span className="field-error">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="seleccion">Selección:</label>
              <select
                className="perfume-input"
                id="seleccion"
                name="seleccion"
                value={formData.seleccion}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona una selección</option>
                {selecciones.map((seleccion) => (
                  <option key={seleccion.idSelec} value={seleccion.idSelec}>
                    {seleccion.Nombre}
                  </option>
                ))}
              </select>
              {errors.seleccion && <span className="field-error">{errors.seleccion}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genero">Género:</label>
              <select
                className="perfume-input"
                id="genero"
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona un género</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="unisex">Unisex</option>
              </select>
              {errors.genero && <span className="field-error">{errors.genero}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="precio">Precio:</label>
              <input
                className="perfume-input"
                type="number"
                id="precio"
                name="precio"
                min="0"
                step="0.01"
                value={formData.precio}
                onChange={handleInputChange}
                required
              />
              {errors.precio && <span className="field-error">{errors.precio}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción:</label>
            <textarea
              className="perfume-input"
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="top"
                checked={formData.top}
                onChange={handleInputChange}
              />
              ¿Es un Producto destacado?
            </label>
          </div>

          {/* Componente de subida de multimedia */}
          <div className="form-group">
            <MultimediaUpload
              ref={multimediaUploadRef}
              productoId={!isCreating ? id : null}
              replaceMode={!isCreating} // Modo reemplazo solo al editar
              onUploadComplete={(files) => {
                console.log('Archivos subidos:', files);
                // Acumular archivos tanto para crear como para editar
                setArchivosSubidos((prev) => {
                  // Evitar duplicados comparando por URL
                  const nuevosArchivos = files.filter(
                    (nuevoArchivo) => !prev.some((existente) => existente.url === nuevoArchivo.url)
                  );
                  return [...prev, ...nuevosArchivos];
                });
              }}
              disabled={loading}
            />
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="perfume-button cancel-btn"
              onClick={() => navigate('/admin/catalogo')}
            >
              Cancelar
            </button>
            <button type="submit" className="perfume-button save-btn">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoEdit;
