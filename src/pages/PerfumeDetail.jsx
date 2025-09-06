
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Hook para leer los parámetros de la URL
import './PerfumeDetail.css';

import Loading from '../componentes/loading'; // Componente de carga
import API_URL from '../config/api';
const PerfumeDetail = () => {
    // useParams nos da un objeto con los parámetros, en este caso { id: '...' }
    const { id } = useParams(); 
    const [perfume, setPerfume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
const capitalizarPrimeraPalabraExacto = (texto) => {
  if (!texto) return '';
  const palabras = texto.split(' ');
  palabras[0] = palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1);
  return palabras.join(' ');
};
    useEffect(() => {
        const fetchPerfume = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/perfume/${id}`);
                if (!response.ok) {
                    throw new Error('Perfume no encontrado');
                }
                const data = await response.json();
                setPerfume(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPerfume();
    }, [id]); // Se ejecuta cada vez que el 'id' de la URL cambie

    if (loading) return <Loading />; // Muestra el componente de carga mientras se obtienen los datos
    if (error) return <p>Error: {error}</p>;
    if (!perfume) return <p>No se encontró el perfume.</p>;

    return (
        <div className="perfume-detail">
            <div className="detail-image-container">
                <img 
           src={`/IMG/${perfume.genero}/${perfume.marcap}/${perfume.img_path}`|| 'https://via.placeholder.com/150'} 
                    alt={perfume.nombre} 
                />
                <img id='btMM' src='../IMG/MMbt.png' alt='Botella MariaMaria' loading='lazy' />
            </div>
            <div className="detail-info-container">
                <h1 className="detail-name">{perfume.nombre}</h1>
                <h2 className="detail-marca">{perfume.marcap}</h2>
                <p className="detail-description">{capitalizarPrimeraPalabraExacto(perfume.descripcion)}</p>
                <div className="detail-meta">
                    <p><strong>Género:</strong> {perfume.genero}</p>
                    <p><strong>Clima ideal:</strong> {perfume.clima}</p>
                </div>
                {/* Aquí podrías agregar un botón de "Añadir al pedido" en el futuro */}
            </div>
        </div>
    );
};

export default PerfumeDetail;

