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
const [perfumesPorMarca, setPerfumesPorMarca] = useState({}); // Estado para guardar los perfumes agrupados por marca
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
         const agrupados = data.reduce((acc, perfume) => {
                    // La API ya nos da el nombre de la marca como 'marcap'
                    const marca = perfume.marcap; 
                    if (!acc[marca]) {
                        acc[marca] = [];
                    }
                    acc[marca].push(perfume);
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
    return <h1>No se encontarron perfumes para: "{q}"</h1>;
  }
return (
    <div className="dashboard ">
        <h1>Resultados de la búsqueda para: "{q}"</h1>
        {Object.keys(perfumesPorMarca).map(marca => (
                <div key={marca} className="marca-section">
                    <h2 className="marca-title">{marca}</h2>
                    <div className="perfume-list-seccion">
                    <div className="perfume-list">
                       
                        {perfumesPorMarca[marca].map(perfume => (
                            <PerfumeCard key={perfume.idperfume} perfume={perfume} />
                        ))}
                    </div>
                    </div>
                </div>
            ))}
    </div>
  );
};

export default Busqueda;
