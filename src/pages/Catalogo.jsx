// frontend/src/pages/Catalogo.jsx

import React, { useState, useEffect, useRef } from 'react'; // 1. Importa useRef
import { useLocation,useNavigate} from 'react-router-dom';
import API_URL from '../config/api';
import PerfumeCard from '../componentes/PerfumeCard';
import Loading from '../componentes/loading';
import './Catalogo.css';
import AlertMsg from '../componentes/AlertMsg';

const Catalogo = ({isAdmin=false}) => {
    const [perfumesPorMarca, setPerfumesPorMarca] = useState({});
    const [marcasOrdenadas, setMarcasOrdenadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
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
        const fetchPerfumes = async () => {
            try {
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

    const handleMarcaClick = (marca) => {
        setMarcaSeleccionada(prevMarca => (prevMarca === marca ? null : marca));
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
    
    const getPerfumesFiltrados = () => {
        if (!marcaSeleccionada) return [];
        let perfumes = perfumesPorMarca[marcaSeleccionada];
        if (generoSeleccionado) {
            perfumes = perfumes.filter(p => p.genero === generoSeleccionado);
        }
        return perfumes;
    };

    const perfumesAMostrar = getPerfumesFiltrados();

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
                    {isSidebarOpen ? 'Ocultar Marcas' : 'Mostrar Marcas'}
                </button>
            )}

            <aside className={`catalogo-sidebar ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
                <h2>Marcas</h2>
                <ul className="marcas-list">
                    {marcasOrdenadas.map(marca => (
                        <li key={marca} className={`marca-item ${marcaSeleccionada === marca ? 'active' : ''}`}>
                            <button onClick={() => handleMarcaClick(marca)}>{marca}</button>
                            {marcaSeleccionada === marca && (
                                <ul className="genero-submenu">
                                    <li className={generoSeleccionado === 'Masculino' ? 'active-genero' : ''}>
                                        <button onClick={() => handleGeneroClick('masculino')}>Masculino</button>
                                    </li>
                                    <li className={generoSeleccionado === 'Femenino' ? 'active-genero' : ''}>
                                        <button onClick={() => handleGeneroClick('femenino')}>Femenino</button>
                                    </li>
                                    <li className={generoSeleccionado === 'Unisex' ? 'active-genero' : ''}>
                                        <button onClick={() => handleGeneroClick('unisex')}>Unisex</
button>
                                    </li>
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* --- MEJORA 2: Se añade la referencia aquí --- */}
            <main className="catalogo-main" ref={mainContentRef}>
                 {isAdmin && <h1><i className="fas fa-cogs"></i> - Catálogo</h1>}
                {marcaSeleccionada ? (
                    perfumesAMostrar.length > 0 ? (
                        <div className="perfume-grid">
                            {perfumesAMostrar.map(perfume => (
                                <PerfumeCard key={perfume.idperfume} perfume={perfume} isAdmin={isAdmin} />
                            ))}
                        </div>
                    ) : (
                        <p className="catalogo-mensaje">No se encontraron perfumes para los filtros seleccionados.</p>
                    )
                ) : (
                    <p className="catalogo-mensaje">Selecciona una marca para ver los perfumes.</p>
                )}
            </main>
        </div>
    );
};

export default Catalogo;