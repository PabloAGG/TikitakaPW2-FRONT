// frontend/src/pages/Catalogo.jsx

import React, { useState, useEffect, useRef } from 'react'; // 1. Importa useRef
import { useLocation,useNavigate} from 'react-router-dom';
import API_URL from '../config/api';
import ProductoCard from '../componentes/PerfumeCard';
import Loading from '../componentes/loading';
import './Catalogo.css';
import AlertMsg from '../componentes/AlertMsg';

const Catalogo = ({isAdmin=false}) => {
    const [productosPorSeleccion, setProductosPorSeleccion] = useState({});
    const [seleccionesOrdenadas, setSeleccionesOrdenadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seleccionSeleccionada, setSeleccionSeleccionada] = useState(null);
    const [generoSeleccionado, setGeneroSeleccionado] = useState(null);
const location = useLocation();
    const successMessage = location.state?.success || null;
    // --- MEJORA 1: Estado para sidebar en móvil ---
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile); // Abierto en desktop, cerrado en móvil por defecto

    // --- MEJORA 2: Referencia para el contenedor principal ---
    const mainContentRef = useRef(null);
    const navigate = useNavigate(); 
    
    // Importa useNavigate para redirigir después de mostrar el mensaje
useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                navigate('/admin/catalogo'); // Redirige a la página de inicio de sesión después de mostrar
            }, 2000); // Espera 2 segundos antes de redirigir
            return () => clearTimeout(timer); 
        }
    }, [successMessage]);
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                   setLoading(true);
                const response = await fetch(`${API_URL}/api/productos`);
                const data = await response.json();

                // Agrupamos los productos por selección
                const agrupados = data.reduce((acc, producto) => {
                    // La API ya nos da el nombre de la selección como 'seleccionNombre'
                    const seleccion = producto.seleccionnombre || 'Sin selección';
                    if (!acc[seleccion]) {
                        acc[seleccion] = [];
                    }
                    acc[seleccion].push(producto);
                    return acc;
                }, {});

               
    const seleccionesOrdenadas = Object.keys(agrupados).sort();
    setProductosPorSeleccion(agrupados);
    setSeleccionesOrdenadas(seleccionesOrdenadas);
    setLoading(false);

            } catch (error) {
                console.error("Error al obtener los productos:", error);
            }
        };

        fetchProductos();

        // Listener para redimensionar la pantalla
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Si pasamos a desktop, nos aseguramos que la sidebar esté abierta

                setIsSidebarOpen(true);
            
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Llama una vez al inicio

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSeleccionClick = (seleccion) => {
        setSeleccionSeleccionada(prevSeleccion => (prevSeleccion === seleccion ? null : seleccion));
        setGeneroSeleccionado(null);

        // --- MEJORA 2: Lógica de scroll ---
        // Hacemos scroll solo en desktop para que el usuario vea los nuevos productos
        if (!isMobile && mainContentRef.current) {
            setTimeout(() => { // Pequeño delay para dar tiempo a que el DOM se actualice
                mainContentRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }, 100);
        }
    };

    const handleGeneroClick = (genero) => {
        setGeneroSeleccionado(prevGenero => (prevGenero === genero ? null : genero));
    };
    
    const getProductosFiltrados = () => {
        if (!seleccionSeleccionada) return [];
        let productos = productosPorSeleccion[seleccionSeleccionada];
        if (generoSeleccionado) {
            productos = productos.filter(p => p.genero === generoSeleccionado);
        }
        return productos;
    };

    const productosAMostrar = getProductosFiltrados();

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="catalogo-container">
            {successMessage && (
                <AlertMsg
                    message={successMessage}
                    type= "success"
                    isConfirm= {false}
                    show= {true}
                />
            )}
            {isMobile && (
                <button 
                    className="sidebar-toggle-button" 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? 'Ocultar Selecciones' : 'Mostrar Selecciones'}
                </button>
            )}

            <aside className={`catalogo-sidebar ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
                <h2>Selecciones</h2>
                {isAdmin && (
                    <button 
                        className="crear-producto-btn"
                        onClick={() => navigate('/admin/crear')}
                    >
                        + Crear Producto
                    </button>
                )}
                <ul className="marcas-list">
                    {seleccionesOrdenadas.map(seleccion => (
                        <li key={seleccion} className={`marca-item ${seleccionSeleccionada === seleccion ? 'active' : ''}`}>
                            <button onClick={() => handleSeleccionClick(seleccion)}>{seleccion}</button>
                            {seleccionSeleccionada === seleccion && (
                                <ul className="genero-submenu">
                                    <li className={generoSeleccionado === 'masculino' ? 'active-genero' : ''}>
                                        <button onClick={() => handleGeneroClick('masculino')}>Masculino</button>
                                    </li>
                                    <li className={generoSeleccionado === 'femenino' ? 'active-genero' : ''}>
                                        <button onClick={() => handleGeneroClick('femenino')}>Femenino</button>
                                    </li>
                                    <li className={generoSeleccionado === 'unisex' ? 'active-genero' : ''}>
                                        <button onClick={() => handleGeneroClick('unisex')}>Unisex</button>
                                    </li>
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* --- MEJORA 2: Se añade la referencia aquí --- */}
            <main className="catalogo-main" ref={mainContentRef}>
                 {isAdmin && <h1><i className="fas fa-cogs"></i> - Catálogo de Productos</h1>}
                {seleccionSeleccionada ? (
                    productosAMostrar.length > 0 ? (
                        <div className="perfume-grid">
                            {productosAMostrar.map(producto => (
                                <ProductoCard key={producto.idProduct} producto={producto} isAdmin={isAdmin} />
                            ))}
                        </div>
                    ) : (
                        <p className="catalogo-mensaje">No se encontraron productos para los filtros seleccionados.</p>
                    )
                ) : (
                    <p className="catalogo-mensaje">Selecciona una selección para ver los productos.</p>
                )}
            </main>
        </div>
    );
};

export default Catalogo;