
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
                console.log('Obteniendo productos desde:', `${API_URL}/api/productos`);
                const response = await fetch(`${API_URL}/api/productos`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Datos recibidos:', data);

                // Verificar que data es un array
                if (!Array.isArray(data)) {
                    console.error('Los datos recibidos no son un array:', data);
                    throw new Error('Formato de datos inválido');
                }

                // Agrupamos los productos por selección (no por marca)
                const agrupados = data.reduce((acc, producto) => {
                    // Usar selección en lugar de marca
                    const seleccion = producto.seleccionnombre || 'Sin selección';
                    if (!acc[seleccion]) {
                        acc[seleccion] = [];
                    }
                    acc[seleccion].push(producto);
                    return acc;
                }, {});

               
                const marcasOrdenadas = Object.keys(agrupados).sort();
                setPerfumesPorMarca(agrupados);
                setMarcasOrdenadas(marcasOrdenadas);
                setLoading(false);

            } catch (error) {
                console.error("Error al obtener los productos:", error);
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

            {/* 1. Itera directamente sobre el arreglo de nombres de selecciones */}
            {marcasOrdenadas.map(seleccion => (
                <div key={seleccion} className="marca-section">
                    <h2 className="marca-title">{seleccion}</h2>
                    <div className="perfume-list-seccion">
                        <div className="perfume-list">

                            {/* 2. Usa el objeto 'perfumesPorMarca' para obtener la lista de productos */}
                            {perfumesPorMarca[seleccion].map(producto => (
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



