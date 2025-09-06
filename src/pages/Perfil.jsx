import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Perfil.css';
import API_URL from '../config/api';
import Loading from '../componentes/loading';
import AlertMsg from '../componentes/AlertMsg';
import { use } from 'react';
import SwitchComponent from '../componentes/Switch';

const Perfil = () => {

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [telError, setTelError] = useState('');
    const [PassError, setPassError] = useState('');
    const [PassCError, setPassCError] = useState('');
        const [changePassword, setChangePassword] = useState(false);
    const navigate = useNavigate();
    
    // Validación en tiempo real para teléfono
    const handleTelChange = (e) => {
        const value = e.target.value;
        setTelefono(value);
        if (/\D/.test(value)) {
        setTelError('El teléfono solo debe contener dígitos.');
        } else if (value.length > 0 && value.length !== 10) {
        setTelError('El teléfono debe tener 10 dígitos.');
        } else {
        setTelError('');
        }
    };
    
    // Validación en tiempo real para contraseña
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (value.length < 8) {
        setPassError('La contraseña debe tener al menos 8 caracteres.');
        } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z\!@#$%^&*)]{8,}$/.test(value) === false) {
        setPassError('Usa al menos una mayúscula y un carácter especial.');
        } else {
        setPassError('');
        }
    };
    
    // Validación en tiempo real para confirmación de contraseña
    const handlePasswordConfirmChange = (e) => {
        const value = e.target.value;
        setPasswordConfirm(value);
        if (value !== password) {
        setPassCError('Las contraseñas deben coincidir.');
        } else {
        setPassCError('');
        }
    };
    
    useEffect(() => {
        if (error) {
        const timer = setTimeout(() => setError(null), 2000);
        return () => clearTimeout(timer);   
        }
    }, [error]);

    useEffect(() => {
        if (success) {
        const timer = setTimeout(() => setSuccess(null), 2000);
        return () => clearTimeout(timer);   
        }
    }, [success]);

    useEffect(() => {
        if (telError) {
        const timer = setTimeout(() => setTelError(''), 2000);
        return () => clearTimeout(timer);
        }
    }, [telError]);
    useEffect(() => {
        if (PassError) {        
        const timer = setTimeout(() => setPassError(''), 2000);
        return () => clearTimeout(timer);
        }
    }, [PassError]);
    useEffect(() => {
        if (PassCError) {
        const timer = setTimeout(() => setPassCError(''), 2000);
        return () => clearTimeout(timer);
        }
    }, [PassCError]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

      if (!nombre || !apellido || !telefono) {
            setError('Nombre, apellido y teléfono son obligatorios.');
            setLoading(false);
            return;
        }

        if (changePassword && (!password || !passwordConfirm)) {
            setError('Para cambiar la contraseña, ambos campos son obligatorios.');
            setLoading(false);
            return;
        }

        if (telError || (changePassword && (PassError || PassCError))) {
            setLoading(false);
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login', { state: { error: 'Por favor, inicia sesión para actualizar tu perfil.' } });
                localStorage.removeItem('token');
                return;
            }
                   const bodyPayload = {
                nombre,
                apellido,
                telefono,
            };

            if (changePassword) {
                bodyPayload.contraseña =password;
            }
            const response = await fetch(`${API_URL}/api/auth/perfil`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(
                 bodyPayload
                ),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al Modificar Datos del Usuario');
            }

            const data = await response.json();
            if (data) {
                setNombre(data.nombre || '');
                setApellido(data.apellidos || '');
                setTelefono(data.telefono || '');
                setPassword('');
                setPasswordConfirm('');
                setChangePassword(false);
                setSuccess('Datos actualizados correctamente.');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login',{state:{error: 'Por favor, inicia sesión para acceder a tu perfil.'}});
                    localStorage.removeItem('token');
                return;
                }    
                const response = await fetch(`${API_URL}/api/auth/perfil`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al obtener datos del usuario');
              
                }

                const data = await response.json();
                setNombre(data.nombre || '');
                setApellido(data.apellidos || '');
                setTelefono(data.telefono || '');
            } catch (err) {
                        localStorage.removeItem('token');
                        navigate('/login', { state: { error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' } });
                        return;
            }
        };

        fetchUserData();
    }, []);

    return (
        <div className="Perfil-container">
            <h2>Mis Datos</h2>
            {success && <AlertMsg message={success} type="success" />}
            {error && <AlertMsg message={error} type="error" />}
            {loading ? (
                <Loading />
            ) : (
                <form onSubmit={handleSubmit} className="Perfil-form">
                    <div className="NameUser">
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre:</label>
                        <input
                            className='perfume-input'
                            type="text"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="apellido">Apellido:</label>
                        <input
                            className='perfume-input'
                            type="text"
                            id="apellido"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            required
                        />
                    </div></div>
                    <div className="form-group">
                        <label htmlFor="telefono">Teléfono:</label>
                        <input
                            className='perfume-input'
                            type="tel"
                            id="telefono"
                            value={telefono}
                            onChange={handleTelChange}
                            required
                        />
                        {telError && <span className="error">{telError}</span>}
                    </div>
                     { changePassword && (
                        <>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            className='perfume-input'
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                          
                        />
                        {PassError && <span className="error">{PassError}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="passwordConfirm">Confirmar Contraseña:</label>
                        <input
                            className='perfume-input'
                            type="password"
                            id="passwordConfirm"
                            value={passwordConfirm}
                            onChange={handlePasswordConfirmChange}
                         
                        />
                        {PassCError && <span className="error">{PassCError}</span>}
                    </div>
                    </>
                    )}
                    <div className="psw-group">
                        <label htmlFor="CambioContraseña">Cambiar contraseña:</label>
                        <SwitchComponent checked={changePassword} onChange={setChangePassword} />
                    </div>
                   
                    <button type="submit" className="perfume-button">Actualizar</button>
                </form>
            )}
</div>
    );
}   
export default Perfil;