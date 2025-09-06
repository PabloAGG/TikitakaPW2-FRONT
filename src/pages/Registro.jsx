import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Registro.css';
import API_URL from '../config/api';
import Loading from '../componentes/loading';
import AlertMsg from '../componentes/AlertMsg';
const Registro = () => {
  const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordConfirm, setPasswordConfirm] = useState('');
const [telError, setTelError] = useState('');
    const [PassError, setPassError] = useState('');
const [PassCError, setPassCError] = useState('');
const navigate = useNavigate();


   const handleTelChange = (e) => {
        const value = e.target.value;
        setTelefono(value);
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
            setPassError('La contraseña debe tener al menos 8 caracteres.');
        } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z\!@#$%^&*)]{8,}$/.test(value) === false) {
            setPassError('Usa al menos una mayúscula y un carácter especial.');
        }else{
            setPassError('');
        }
    };
    const handlePasswordConfirmChange = (e) => {
        const value = e.target.value;
        setPasswordConfirm(value);
        if (value !== password) {
            setPassCError('Las contraseñas deben coincidir.');
        } else {
            setPassCError('');
        }
    }
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
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, apellidos:apellido, telefono, contraseña:password }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar usuario');
      }

      const data = await response.json();
      console.log('Registro exitoso');
      localStorage.setItem('token', data.token);
      navigate('/login', {state:{success:'¡Registro exitoso! Inicia Sesion'}}); // Redirige al usuario a la página principal después de registrarse
    } catch (error) {
      console.error('Error:', error);
setError('Error al registrar usuario. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="registro-container">
         <img className='logo-sesion' src="/IMG/logo.png" alt="" />
            <form onSubmit={handleSubmit}>
           <h2>Crea tu cuenta</h2>
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
            </div>
            </div>
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
                       {telError && <span className='field-error'>{telError}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="password">Contraseña:</label>
                <input
                className='perfume-input'
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                required
                />
                       {PassError && <span className='field-error'>{PassError}</span>}
            </div>
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
                <input
                className='perfume-input'
                type="password"
                id="confirmPassword"
                value={passwordConfirm}
                onChange={handlePasswordConfirmChange}
                required
                />
                       {PassCError && <span className='field-error'>{PassCError}</span>}
            </div>
            <button className='perfume-button' type="submit">Registrate</button>
            {error && (
              <AlertMsg message={error} type="error" />
            )}
                <p className="login-link">
            ¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a>
        </p>
            </form>
      
    </div>
  );
}
export default Registro;