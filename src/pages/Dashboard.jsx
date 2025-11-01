import { useEffect, useState } from 'react';
import Loading from '../componentes/loading'; // Componente de carga
import PerfumeCard from '../componentes/PerfumeCard';
import API_URL from '../config/api'; // Asegúrate de que esta ruta sea correcta
import './Dashboard.css'; // Archivo para estilos del dashboard
const Dashboard = () => {
  // Estado para guardar los perfumes agrupados por marca
  const [perfumesPorMarca, setPerfumesPorMarca] = useState({});
  const [loading, setLoading] = useState(true);
  const [marcasOrdenadas, setMarcasOrdenadas] = useState([]);
  const [seleccionPreferida, setSeleccionPreferida] = useState(null);
  useEffect(() => {
    // Función para obtener los datos desde tu API
    const fetchPerfumes = async () => {
      try {
        // La URL de tu backend
        setLoading(true);

        const token = localStorage.getItem('token');
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined;

        const [productosResponse, perfilResponse] = await Promise.all([
          fetch(`${API_URL}/api/productos`),
          headers ? fetch(`${API_URL}/api/auth/perfil`, { headers }) : Promise.resolve(null),
        ]);

        if (!productosResponse.ok) {
          throw new Error(`HTTP error! status: ${productosResponse.status}`);
        }

        const data = await productosResponse.json();

        // Verificar que data es un array
        if (!Array.isArray(data)) {
          console.error('Los datos recibidos no son un array:', data);
          throw new Error('Formato de datos inválido');
        }

        let seleccionPersonalizada = null;
        if (perfilResponse && perfilResponse.ok) {
          const perfil = await perfilResponse.json();
          seleccionPersonalizada = perfil?.seleccionNombre ?? null;
          setSeleccionPreferida(seleccionPersonalizada);
        }

        // Agrupamos los productos por selección (no por marca)
        const agrupados = data.reduce((acc, producto) => {
          const seleccion = producto.seleccionNombre || producto.seleccionnombre || 'Sin selección';
          if (!acc[seleccion]) {
            acc[seleccion] = [];
          }
          acc[seleccion].push(producto);
          return acc;
        }, {});

        const ordenBasico = Object.keys(agrupados).sort((a, b) => a.localeCompare(b));

        const ordenFinal = seleccionPersonalizada
          ? [
              seleccionPersonalizada,
              ...ordenBasico.filter((nombre) => nombre !== seleccionPersonalizada),
            ]
          : ordenBasico;

        setPerfumesPorMarca(agrupados);
        setMarcasOrdenadas(ordenFinal);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener los productos:', error);
        setLoading(false);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    };

    fetchPerfumes();
  }, []); // El array vacío asegura que esto se ejecute solo una vez

  if (loading) return <Loading />; // Muestra el componente de carga mientras se obtienen los datos
  if (marcasOrdenadas.length === 0) {
    return <p>No hay productos disponibles.</p>;
  }
  return (
    <div className="dashboard">
      <h1>Productos disponibles</h1>
      {seleccionPreferida && (
        <p className="dashboard-highlight">
          Mostrando primero artículos de tu selección favorita:{' '}
          <strong>{seleccionPreferida}</strong>
        </p>
      )}

      {/* 1. Itera directamente sobre el arreglo de nombres de selecciones */}
      {marcasOrdenadas.map((seleccion) => (
        <div key={seleccion} className="marca-section">
          <h2 className="marca-title">{seleccion}</h2>
          <div className="perfume-list-seccion">
            <div className="perfume-list">
              {/* 2. Usa el objeto 'perfumesPorMarca' para obtener la lista de productos */}
              {perfumesPorMarca[seleccion].map((producto) => (
                <PerfumeCard key={producto.idProduct} producto={producto} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
