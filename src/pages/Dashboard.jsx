
import React, { useState, useEffect } from 'react';
import PerfumeCard from '../componentes/PerfumeCard';
import './Dashboard.css'; // Archivo para estilos del dashboard
import Loading from '../componentes/loading'; // Componente de carga
import API_URL from '../config/api'; // Asegúrate de que esta ruta sea correcta
const Dashboard = () => {
    // Estado para guardar los perfumes agrupados por marca
    const [perfumesPorMarca, setPerfumesPorMarca] = useState({});
    const [loading, setLoading] = useState(true);
    const [marcasOrdenadas, setMarcasOrdenadas] = useState([]);
    useEffect(() => {
        // Función para obtener los datos desde tu API
        const fetchPerfumes = async () => {
            try {
                // La URL de tu backend
                setLoading(true);
                const response = await fetch(`${API_URL}/api/perfumes`);
                const data = await response.json();

                // Agrupamos los perfumes por marca
                const agrupados = data.reduce((acc, perfume) => {
                    // La API ya nos da el nombre de la marca como 'marcap'
                    const marca = perfume.marcap;
                    if (!acc[marca]) {
                        acc[marca] = [];
                    }
                    acc[marca].push(perfume);
                    return acc;
                }, {});

               
    const marcasOrdenadas = Object.keys(agrupados).sort();
    setPerfumesPorMarca(agrupados);
    setMarcasOrdenadas(marcasOrdenadas);
    setLoading(false);

            } catch (error) {
                console.error("Error al obtener los perfumes:", error);
            }
        };

        fetchPerfumes();
    }, []); // El array vacío asegura que esto se ejecute solo una vez

    if (loading) return <Loading />; // Muestra el componente de carga mientras se obtienen los datos
    if (Object.keys(marcasOrdenadas).length === 0) {
        return <p>No hay perfumes disponibles.</p>;
    }
    return (
        <div className="dashboard">
            <h1>Perfumes disponibles</h1>

            {/* 1. Itera directamente sobre el arreglo de nombres de marcas */}
            {marcasOrdenadas.map(marca => (
                <div key={marca} className="marca-section">
                    <h2 className="marca-title">{marca}</h2>
                    <div className="perfume-list-seccion">
                        <div className="perfume-list">

                            {/* 2. Usa el objeto 'perfumesPorMarca' para obtener la lista de perfumes */}
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

export default Dashboard;



