import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PerfumeEdit.css';
import Loading from '../componentes/loading';
import API_URL from '../config/api';
import AlertMsg from '../componentes/AlertMsg'; 

const PerfumeEdit = ({isCreating=false}) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '', type: 'info', isConfirm: false });
    const [perfume, setPerfume] = useState(null);
    const [marcas, setMarcas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
 
    
    // Estados para los campos del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        marca: '',
        descripcion: '',
        genero: '',
        clima: '',
        top: false
    });

    const capitalizarPrimeraPalabraExacto = (texto) => {
        if (!texto) return '';
        const palabras = texto.split(' ');
        palabras[0] = palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1);
        return palabras.join(' ');
    };

    // Cargar datos del perfume y marcas
    useEffect(() => {
        if (!isCreating){
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Cargar perfume y marcas en paralelo
                const [perfumeResponse, marcasResponse] = await Promise.all([
                    fetch(`${API_URL}/api/perfume/${id}`),
                    fetch(`${API_URL}/api/marcas`)
                ]);

                if (!perfumeResponse.ok) {
                    throw new Error('Perfume no encontrado');
                }
                if (!marcasResponse.ok) {
                    throw new Error('Error al cargar marcas');
                }

                const perfumeData = await perfumeResponse.json();
                const marcasData = await marcasResponse.json();

                setPerfume(perfumeData);
                setMarcas(marcasData);
                
                // Llenar el formulario con los datos existentes
                setFormData({
                    nombre: perfumeData.nombre || '',
                    marca: perfumeData.marca || '',
                    descripcion: perfumeData.descripcion || '',
                    genero: perfumeData.genero || '',
                    clima: perfumeData.clima || '',
                    top: perfumeData.top || false
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }   else {
        const fetchMarcas = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/marcas`);
                if (!response.ok) {
                    throw new Error('Error al cargar marcas');
                }
                const marcasData = await response.json();
                setMarcas(marcasData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMarcas();

        setFormData({
            nombre: '', 
            marca: '',
            descripcion: '',
            genero: '',
            clima: '',
            top: false
        });
    }
    }, [id]);

    // Manejar cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        if (!formData.marca) {
            newErrors.marca = 'La marca es requerida';
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
        if (!isCreating) {
        try {
            const response = await fetch(`${API_URL}/api/perfume/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el perfume');
            }

                navigate('/admin/catalogo',{state: { success: 'Perfume actualizado correctamente.' } });
            

        } catch (error) {
            console.error('Error:', error);
            setAlertInfo({
                message: 'Error al actualizar el perfume. Inténtalo de nuevo.',
                type: 'error',
                isConfirm: false
            });
        } finally {
    setLoading(false);
        }
    } else {
        try {
            const response = await fetch(`${API_URL}/api/perfume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    img_path: 'default.jpg' // Asignar una imagen por defecto o manejarlo según tu lógica
                })
            });

            if (!response.ok) {
                throw new Error('Error al crear el perfume');
            }

            navigate('/admin/catalogo',{state: { success: 'Perfume creado correctamente.' } });
        } catch (error) {
            console.error('Error:', error);
            setAlertInfo({
                message: 'Error al crear el perfume. Inténtalo de nuevo.',
                type: 'error',
                isConfirm: false
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
    if (!isCreating && !perfume) return <p>No se encontró el perfume.</p>;

    return (
        <div className='perfume-edit-container'>
             
            {alertInfo.show && (
                <AlertMsg 
                    message={alertInfo.message}
                    type={alertInfo.type}
                    isConfirm={alertInfo.isConfirm}
                    onCancel={cerrarAlert}
                />
            )}
            { !isCreating && (
            <div className='detail-image-container'>
                <img 
                    src={`/IMG/${perfume.genero}/${perfume.marcap}/${perfume.img_path}` || 'https://via.placeholder.com/150'} 
                    alt={perfume.nombre} 
                />
            </div>
            )}
            <div className='Edit-info-container'>
                { !isCreating ? (
                <h2>Editar Perfume</h2>
): (<h2>Crear Perfume</h2>)}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre:</label>
                            <input
                                className='perfume-input'
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.nombre && <span className='field-error'>{errors.nombre}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="marca">Marca:</label>
                            <select
                                className='perfume-input'
                                id="marca"
                                name="marca"
                                value={formData.marca}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecciona una marca</option>
                                {marcas.map(marca => (
                                    <option key={marca.idmarca} value={marca.idmarca}>
                                        {marca.nombre}
                                    </option>
                                ))}
                            </select>
                            {errors.marca && <span className='field-error'>{errors.marca}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="genero">Género:</label>
                            <select
                                className='perfume-input'
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
                            {errors.genero && <span className='field-error'>{errors.genero}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="clima">Clima:</label>
                            <select
                                className='perfume-input'
                                id="clima"
                                name="clima"
                                value={formData.clima}
                                onChange={handleInputChange}
                            >
                                <option value="">Selecciona un clima</option>
                                <option value="Cálido">Cálido</option>
                                <option value="Frío">Frío</option>
                                <option value="Templado">Templado</option>
                                <option value="Cualquiera">Cualquiera</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción:</label>
                        <textarea
                            className='perfume-input'
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
                            ¿Es un perfume destacado?
                        </label>
                    </div>

                    <div className="form-buttons">
                        <button 
                            type="button" 
                            className="perfume-button cancel-btn"
                            onClick={() => navigate('/admin/catalogo')}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="perfume-button save-btn"   
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PerfumeEdit;