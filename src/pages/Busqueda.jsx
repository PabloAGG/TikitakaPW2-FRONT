import React, { useState, useEffect } from 'react';
import PerfumeCard from '../componentes/PerfumeCard';
import './Dashboard.css'; // Archivo para estilos del dashboard
import Loading from '../componentes/loading'; // Componente de carga
import { useParams } from 'react-router-dom'; // Hook para leer los parámetros de la URL
import API_URL from '../config/api';

const Busqueda = () => {
  const [resultados, setResultados] = useState([]);
  const {q} = useParams(); // Obtenemos el parámetro de búsqueda de la URL;
const [loading, setLoading] = useState(true);
const [perfumesPorMarca, setPerfumesPorMarca] = useState({}); // Estado para guardar los productos agrupados por selección
    useEffect(() => {
    const query = q ? q.trim() : ''; // Aseguramos que la búsqueda no sea vacía
   if (!q) return; // Si no hay query, no hacemos nada


      setLoading(true); // ✅ Lo movemos dentro del useEffect
      fetch(`${API_URL}/api/busqueda?q=${encodeURIComponent(q)}`)
          .then(res => {
      if (!res.ok) throw new Error('Error de red o servidor');
      return res.json();
    })
        .then(data =>{ 
            
            setResultados(data)
            // Agrupamos los productos por selección (igual que en Dashboard)
            const agrupados = data.reduce((acc, producto) => {
                const seleccion = producto.seleccionNombre || producto.seleccionnombre || 'Sin selección';
                if (!acc[seleccion]) {
                    acc[seleccion] = [];
                }
                acc[seleccion].push(producto);
                return acc;
            }, {});

            setPerfumesPorMarca(agrupados);
        
        })

        .catch(err => {
    console.error("Error al buscar perfumes:", err);
    setResultados([]); // Evita que queden datos anteriores si falla
  })
        .finally(() => setLoading(false)); // ✅ Finaliza la carga
  
  }, [q]);
  if (loading) return <Loading />; // Muestra el componente de carga mientras se obtienen los datos
 if (resultados.length === 0) {
    return (
        <div className="dashboard">
            <h1>No se encontraron productos para: "{q}"</h1>
            <p>Intenta con otros términos de búsqueda.</p>
        </div>
    );
  }
return (
    <div className="dashboard">
        <h1>Resultados de la búsqueda para: "{q}"</h1>
        {Object.keys(perfumesPorMarca).sort((a, b) => a.localeCompare(b)).map(seleccion => (
                <div key={seleccion} className="marca-section">
                    <h2 className="marca-title">{seleccion}</h2>
                    <div className="perfume-list-seccion">
                        <div className="perfume-list">
                            {(perfumesPorMarca[seleccion] ?? []).map(producto => (
                                <PerfumeCard key={producto.idProduct} producto={producto} />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
    </div>
  );
};

export default Busqueda;
