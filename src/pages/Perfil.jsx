import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMsg from '../componentes/AlertMsg';
import Loading from '../componentes/loading';
import SwitchComponent from '../componentes/Switch';
import API_URL from '../config/api';
import './Perfil.css';

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
  const [seleccionInfo, setSeleccionInfo] = useState({ nombre: '', datos: '', bandera: '' });
  const [seleccionId, setSeleccionId] = useState('');
  const [selecciones, setSelecciones] = useState([]);
  const navigate = useNavigate();
  const esDatoImagen = (dato) => {
    if (!dato) return false;
    return /^https?:\/\//i.test(dato) || dato.startsWith('data:image');
  };

  const normalizarTexto = (texto) =>
    texto
      ? texto
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
      : '';

  const banderaMap = {
    mexico: 'mx',
    canada: 'ca',
    'estados unidos': 'us',
    japon: 'jp',
    'corea del sur': 'kr',
    australia: 'au',
    'nueva zelanda': 'nz',
    argentina: 'ar',
    brasil: 'br',
    uruguay: 'uy',
    colombia: 'co',
    ecuador: 'ec',
    paraguay: 'py',
    marruecos: 'ma',
    jordania: 'jo',
    uzbekistan: 'uz',
    iran: 'ir',
  };

  const getBanderaUrl = (nombreSeleccion) => {
    if (!nombreSeleccion) return '';
    const clave = normalizarTexto(nombreSeleccion.trim());
    const codigo = banderaMap[clave];
    return codigo ? `https://flagcdn.com/h160/${codigo}.png` : '';
  };

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
    } else if (
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z\!@#$%^&*)]{8,}$/.test(value) === false
    ) {
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

    if (!seleccionId) {
      setError('Selecciona una selección favorita.');
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
        navigate('/login', {
          state: { error: 'Por favor, inicia sesión para actualizar tu perfil.' },
        });
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('cart:token-change'));
        return;
      }
      const bodyPayload = {
        nombre,
        apellido,
        telefono,
        seleccion: Number(seleccionId),
      };

      if (changePassword) {
        bodyPayload.contraseña = password;
      }
      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al Modificar Datos del Usuario');
      }

      const data = await response.json();
      if (data) {
        setNombre(data.nombre || '');
        setApellido(data.apellidos || '');
        setTelefono(data.telf || '');
        setPassword('');
        setPasswordConfirm('');
        setChangePassword(false);
        setSuccess('Datos actualizados correctamente.');
        setSeleccionId(String(data.seleccion || ''));
        setSeleccionInfo({
          nombre: data.seleccionNombre || '',
          datos: data.seleccionDatos || '',
          bandera: getBanderaUrl(data.seleccionNombre),
        });
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
          navigate('/login', {
            state: { error: 'Por favor, inicia sesión para acceder a tu perfil.' },
          });
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('cart:token-change'));
          return;
        }
        const response = await fetch(`${API_URL}/api/auth/perfil`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const data = await response.json();
        setNombre(data.nombre || '');
        setApellido(data.apellidos || '');
        setTelefono(data.telf || '');
        setSeleccionId(String(data.seleccion || ''));
        setSeleccionInfo({
          nombre: data.seleccionNombre || '',
          datos: data.seleccionDatos || '',
          bandera: getBanderaUrl(data.seleccionNombre),
        });
      } catch (err) {
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('cart:token-change'));
        navigate('/login', {
          state: { error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' },
        });
        return;
      }
    };

    const fetchSelecciones = async () => {
      try {
        const response = await fetch(`${API_URL}/api/selecciones`);
        if (!response.ok) {
          throw new Error('Error al obtener selecciones');
        }
        const data = await response.json();
        setSelecciones(data);
      } catch (fetchError) {
        console.error('Error cargando selecciones:', fetchError);
      }
    };

    fetchSelecciones();
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!seleccionId || selecciones.length === 0) return;

    const seleccionEncontrada = selecciones.find((item) => {
      const idActual = item.idSelec ?? item.idselec ?? item.id;
      return String(idActual) === String(seleccionId);
    });

    if (seleccionEncontrada) {
      const nombreSeleccion = seleccionEncontrada.Nombre || seleccionEncontrada.nombre || '';
      const datosSeleccion = seleccionEncontrada.Datos || seleccionEncontrada.datos || '';
      setSeleccionInfo({
        nombre: nombreSeleccion,
        datos: datosSeleccion,
        bandera: getBanderaUrl(nombreSeleccion),
      });
    }
  }, [seleccionId, selecciones]);

  return (
    <div className="Perfil-container">
      <h2>Mis Datos</h2>
      {seleccionInfo.nombre && (
        <div className="seleccion-preview">
          <h3>Mi selección</h3>
          <p className="seleccion-nombre">{seleccionInfo.nombre}</p>
          {seleccionInfo.bandera && (
            <img
              src={seleccionInfo.bandera}
              alt={`Bandera de ${seleccionInfo.nombre}`}
              className="seleccion-bandera"
            />
          )}
          {!seleccionInfo.bandera && esDatoImagen(seleccionInfo.datos) && (
            <img src={seleccionInfo.datos} alt={`Selección ${seleccionInfo.nombre}`} />
          )}
          {seleccionInfo.datos && !esDatoImagen(seleccionInfo.datos) && (
            <p className="seleccion-descripcion">{seleccionInfo.datos}</p>
          )}
        </div>
      )}
      <br />
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
                className="perfume-input"
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
                className="perfume-input"
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
              className="perfume-input"
              type="tel"
              id="telefono"
              value={telefono}
              onChange={handleTelChange}
              required
            />
            {telError && <span className="error">{telError}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="seleccion">Selección que apoyo:</label>
            <select
              id="seleccion"
              className="perfume-input"
              value={seleccionId}
              onChange={(e) => setSeleccionId(e.target.value)}
              required
            >
              <option value="" disabled>
                Selecciona tu selección favorita
              </option>
              {selecciones.map((seleccion) => {
                const idActual = seleccion.idSelec ?? seleccion.idselec ?? seleccion.id;
                const nombreSeleccion = seleccion.Nombre || seleccion.nombre;
                return (
                  <option key={idActual} value={idActual}>
                    {nombreSeleccion}
                  </option>
                );
              })}
            </select>
          </div>
          {changePassword && (
            <>
              <div className="form-group">
                <label htmlFor="password">Contraseña:</label>
                <input
                  className="perfume-input"
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
                  className="perfume-input"
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

          <button type="submit" className="perfume-button">
            Actualizar
          </button>
        </form>
      )}
      
    </div>
  );
};
export default Perfil;
