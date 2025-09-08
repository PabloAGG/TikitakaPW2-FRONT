import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Registro.css';
import API_URL from '../config/api';
import Loading from '../componentes/loading';
import AlertMsg from '../componentes/AlertMsg';
import { use } from 'react';
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
const [correo, setCorreo] = useState('');
const [correoError, setCorreoError] = useState('');
const [seleccion, setSeleccion] = useState('');
const [seleccionError, setSeleccionError] = useState('');
  const [seleccionesObtenidas, setSeleccionesObtenidas] = useState([]);
const navigate = useNavigate();

useEffect(() => {
    try {
        fetch(`${API_URL}/api/selecciones`)
            .then(response => response.json())
            .then(data => {
                console.log('Selecciones obtenidas:', data);
                setSeleccionesObtenidas(data);
            })
            .catch(error => {
                console.error('Error al obtener selecciones:', error);
            }); 
    } catch (error) {
        console.error('Error en la petición de selecciones:', error);
    }   
}, []);

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
    const handleCorreoChange = (e) => {
        const value = e.target.value;
        setCorreo(value);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setCorreoError('Correo inválido.');
        } else {
            setCorreoError('');
        }
    };
    const handleSeleccionChange = (e) => {
        const value = e.target.value;
        setSeleccion(value);
        if (!value) {
            setSeleccionError('Debes seleccionar una opción.');
        } else {
            setSeleccionError('');
        }
    };

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
    useEffect(() => {
        if (correoError) {   
            const timer = setTimeout(() => setCorreoError(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [correoError]);
    useEffect(() => {
        if (seleccionError) {   
            const timer = setTimeout(() => setSeleccionError(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [seleccionError]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, apellidos:apellido, telefono, contraseña:password,correo,seleccion }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar usuario');
      }

      const data = await response.json();
      console.log('Registro exitoso');

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
                <label htmlFor="correo">Correo:</label>
                <input
                className='perfume-input'
                type="email"
                id="correo"
                value={correo}
                onChange={handleCorreoChange}
                required
                />
                       {correoError && <span className='field-error'>{correoError}</span>}
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
            <div className="form-group">
                <label htmlFor="Seleccion">Tu Seleccion:</label>
                <select
                className='perfume-input'
                id="seleccion"
                value={seleccion}
                onChange={handleSeleccionChange}
                required
                >
                   <option value="">Selecciona una opción</option>
                     {seleccionesObtenidas.map((sel) => (
                        <option key={sel.idSelec} value={sel.idSelec}>{sel.Nombre}</option>
                    ))}
               </select>
                       {seleccionError && <span className='field-error'>{seleccionError}</span>}
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