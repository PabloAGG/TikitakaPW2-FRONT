
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Hook para leer los parámetros de la URL
import './PerfumeDetail.css';

import Loading from '../componentes/loading'; // Componente de carga
import MediaCarousel from '../componentes/MediaCarousel'; // Nuevo carrusel
import API_URL from '../config/api';
const ProductoDetail = () => {
    // useParams nos da un objeto con los parámetros, en este caso { id: '...' }
    const { id } = useParams(); 
    const [producto, setProducto] = useState(null);
    const [multimedia, setMultimedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
const capitalizarPrimeraPalabraExacto = (texto) => {
  if (!texto) return '';
  const palabras = texto.split(' ');
  palabras[0] = palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1);
  return palabras.join(' ');
};
    useEffect(() => {
        const fetchProducto = async () => {
            try {
                setLoading(true);
                
                // Cargar producto y multimedia en paralelo
                const [productoResponse, multimediaResponse] = await Promise.all([
                    fetch(`${API_URL}/api/producto/${id}`),
                    fetch(`${API_URL}/api/multimedia/${id}`)
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
                <MediaCarousel 
                    multimedia={multimedia} 
                    productName={producto.nombre}
                />
            </div>
            <div className="detail-info-container">
                <h1 className="detail-name">{producto.nombre}</h1>
                <h2 className="detail-marca">{producto.seleccionnombre || 'Sin selección'}</h2>
                <p className="detail-description">{capitalizarPrimeraPalabraExacto(producto.descripcion)}</p>
                <div className="detail-meta">
                    <p><strong>Género:</strong> {producto.genero}</p>
                    {producto.top && <p className="destacado-badge">⭐ Producto Destacado</p>}
                </div>
                {/* Aquí podrías agregar un botón de "Añadir al pedido" en el futuro */}
            </div>
        </div>
    );
};

export default ProductoDetail;

