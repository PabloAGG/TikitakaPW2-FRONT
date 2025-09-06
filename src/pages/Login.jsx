import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';
import API_URL from '../config/api';
import Loading from '../componentes/loading';
import AlertMsg from '../componentes/AlertMsg';
const Login = () => {   
const navigate = useNavigate();
    const [Tel, setTel] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
   const [telError, setTelError] = useState('');
    const [passwordError, setPasswordError] = useState('');
const location = useLocation();
const successMessage = location.state?.success || null;
const errorMessage = location.state?.error || null;
useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                navigate('/login'); // Redirige a la página de inicio de sesión después de mostrar
            }, 2000); // Espera 2 segundos antes de redirigir
            return () => clearTimeout(timer); 
        }
    }, [successMessage]);
    useEffect(() => {
        if (errorMessage) {
           const timer = setTimeout(() => {
                navigate('/login'); // Redirige a la página de inicio de sesión después de mostrar
            }, 2000); // Espera 2 segundos antes de redirigir
            return () => clearTimeout(timer); ;
        }
    }, [errorMessage]);

 useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Validación en tiempo real para teléfono
    const handleTelChange = (e) => {
        const value = e.target.value;
        setTel(value);
        if (/\D/.test(value)) {
      setTelError('El teléfono solo debe contener dígitos.');

    } else if (value.length > 0 && value.length !== 10) {
        setTelError('El teléfono debe tener 10 dígitos.');
    }
  else{
            setTelError('');
        }
    };

    // Validación en tiempo real para contraseña
    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (value.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres.');
        } else {
            setPasswordError('');
        }
    };

    useEffect(() => {
        if (telError) {
            const timer = setTimeout(() => setTelError(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [telError]);

    // Desaparecer error de contraseña tras 2 segundos de inactividad
    useEffect(() => {
        if (passwordError) {
            const timer = setTimeout(() => setPasswordError(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [passwordError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
           if (telError || passwordError || !Tel || !password) {
            setError('Corrige los errores antes de continuar.');
            return;
        }
        setLoading(true);
        setError(null); // Resetea el error al iniciar un nuevo intento de inicio de sesión
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ telefono:Tel, contraseña:password }),
            });

            if (!response.ok) {
                throw new Error('Error al iniciar sesión');
            }

            const data = await response.json();
            console.log('Inicio de sesión exitoso:', data);
            localStorage.setItem('token', data.token);
            navigate('/'); // Redirige al usuario a la página principal después de iniciar sesión
   // Retorna null para evitar renderizar nada más

             } catch (error) {
            console.error('Error:', error);
          setError('Credenciales Invalidas.');

        } finally {
            setLoading(false);
        }
    }
if (loading) {
        return <Loading />;
    }
return (

    <div className="login-container"> 

    {successMessage && (
        <AlertMsg message={successMessage} type="success" />
    )}
    {errorMessage && (
        <AlertMsg message={errorMessage} type="error" />
    )}
         <img className='logo-sesion' src="/IMG/logo.png" alt="" />
            <form onSubmit={handleSubmit}>
              <h2>Inicia Sesión</h2>  
               <div className="form-group">
                    <label htmlFor="telefono">Teléfono:</label>
                    <input
                        className='perfume-input'
                        type="tel"
                        id="telefono"
                        value={Tel}
                        onChange={handleTelChange}
                        required
                    />
                    {telError && <span className='field-error'>{telError}</span>}
                </div>
                <div className="form-group">
                    <label htmlFor="contraseña">Contraseña:</label>
                    <input
                    className='perfume-input'
                        type="password"
                        id="contraseña"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                    {passwordError && ( <span className='field-error'>{passwordError}</span>)}
                </div>
                <button className='perfume-button' type="submit">Iniciar Sesión</button>

    {error && (
        <AlertMsg message={error} type="error" />
                    )}
  <p className="register-link">
            ¿No tienes una cuenta? <a href="/registro">Regístrate!</a>
        </p>
            </form>
  

      
    </div>
);
};
export default Login;
