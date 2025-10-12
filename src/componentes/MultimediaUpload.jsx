import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import API_URL from '../config/api';
import CloudinaryImage from './CloudinaryImage';
import './MultimediaUpload.css';

const MultimediaUpload = forwardRef(({ 
  productoId, 
  onUploadComplete, 
  disabled = false,
  replaceMode = false // Nuevo prop para modo reemplazo
}, ref) => {
  const [multimedia, setMultimedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [multimediaAnterior, setMultimediaAnterior] = useState([]); // Backup de multimedia original

  // Función para generar URL válida de Cloudinary
  const generateCloudinaryUrl = (publicId, resourceType = 'image', format = 'jpg') => {
    const baseUrl = 'https://res.cloudinary.com/dmyrtncnm';
    return `${baseUrl}/${resourceType}/upload/${publicId}.${format}`;
  };

  // Función para limpiar URLs problemáticas
  const cleanCloudinaryUrl = (url, publicId, resourceType, format) => {
    // Si la URL original no funciona, generar una nueva
    if (url && url.includes('/v1760291318/')) {
      return generateCloudinaryUrl(publicId, resourceType, format);
    }
    return url;
  };

  // Cargar multimedia existente si hay un productoId
  useEffect(() => {
    if (productoId) {
      fetchMultimedia();
    }
  }, [productoId]);



  const fetchMultimedia = async () => {
    try {
      const response = await fetch(`${API_URL}/api/multimedia/${productoId}`);
      if (response.ok) {
        const data = await response.json();
        setMultimedia(data);
        setMultimediaAnterior(data); // Guardar backup para poder eliminar después
      }
    } catch (error) {
      console.error('Error al cargar multimedia:', error);
    }
  };

  const handleUpload = () => {
    if (disabled) return;

    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dmyrtncnm', // Tu Cloud Name
        uploadPreset: 'ml_default', // Tu Upload Preset
        sources: ['local', 'url', 'camera'],
        multiple: true, // Permitir múltiples archivos
        maxFiles: 10, // Máximo 10 archivos
        resourceType: 'auto', // Permitir imágenes y videos
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv'],
        maxFileSize: 10000000, // 10MB máximo
        maxVideoFileSize: 50000000, // 50MB para videos
        showPoweredBy: false,
        secure: true, // Forzar HTTPS
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            menuIcons: '#5A616A',
            textDark: '#000000',
            textLight: '#FFFFFF',
            link: '#0078FF',
            action: '#FF620C',
            inactiveTabIcon: '#C4C4C4',
            error: '#F44235',
            inProgress: '#0078FF',
            complete: '#20B832',
            sourceBg: '#E4EBF1'
          }
        }
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          console.log('¡Archivo subido con éxito!', result.info);
          
          // Generar URL limpia - usar siempre la versión sin timestamp problemático
          const cleanUrl = generateCloudinaryUrl(
            result.info.public_id,
            result.info.resource_type,
            result.info.format
          );
          
          const newFile = {
            url: cleanUrl, // Usar la URL limpia
            originalUrl: result.info.secure_url, // Guardar la original para referencia
            tipo: result.info.resource_type, // 'image' o 'video'
            public_id: result.info.public_id,
            format: result.info.format,
            bytes: result.info.bytes,
            width: result.info.width,
            height: result.info.height,
            duration: result.info.duration // Solo para videos
          };
          
          console.log('URL limpia generada:', cleanUrl);
          console.log('URL original:', result.info.secure_url);

          if (replaceMode) {
            // En modo reemplazo, reemplazar todo el array
            setMultimedia([newFile]);
            
            // Notificar al padre con el archivo individual (para acumular)
            if (onUploadComplete) {
              onUploadComplete([newFile]);
            }
          } else {
            // Modo normal: añadir a la lista
            setMultimedia(prev => [...prev, newFile]);

            // Si hay un producto, guardar en base de datos inmediatamente
            if (productoId) {
              saveToDatabase([newFile]);
            }

            // Notificar al componente padre
            if (onUploadComplete) {
              onUploadComplete([newFile]);
            }
          }
        }

        if (error) {
          console.error('Error al subir archivo:', error);
        }
      }
    );

    myWidget.open();
  };

  const saveToDatabase = async (files) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/multimedia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          producto: productoId,
          urls: files.map(file => ({
            url: file.url,
            tipo: file.tipo
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar en base de datos');
      }

      const data = await response.json();
      console.log('Multimedia guardada:', data);
    } catch (error) {
      console.error('Error al guardar multimedia:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para reemplazar toda la multimedia del producto
  const replaceAllMultimedia = async (newFiles) => {
    if (!productoId || !newFiles || newFiles.length === 0) {
      console.warn('No se puede reemplazar multimedia: falta productoId o archivos');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Reemplazando multimedia del producto', productoId);
      console.log('Multimedia anterior:', multimediaAnterior);
      console.log('Nuevos archivos:', newFiles);

      // Llamar al endpoint de reemplazo
      const response = await fetch(`${API_URL}/api/multimedia/replace/${productoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          urls: newFiles.map(file => ({
            url: file.url,
            tipo: file.tipo
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Error al reemplazar multimedia en base de datos');
      }

      const data = await response.json();
      console.log('Multimedia reemplazada exitosamente:', data);
      
      // Actualizar el estado local
      setMultimedia(newFiles);
      setMultimediaAnterior(newFiles);
      
      return data;
    } catch (error) {
      console.error('Error al reemplazar multimedia:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Exponer funciones al componente padre
  useImperativeHandle(ref, () => ({
    replaceAllMultimedia
  }), [productoId, multimediaAnterior]);

  const deleteMultimedia = async (id, index) => {
    try {
      const token = localStorage.getItem('token');
      
      // Si tiene ID (está en BD), eliminar de BD
      if (id) {
        const response = await fetch(`${API_URL}/api/multimedia/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar de base de datos');
        }
      }

      // Eliminar de la lista local
      setMultimedia(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error al eliminar multimedia:', error);
    }
  };

  const getFileIcon = (tipo, format) => {
    if (tipo === 'video') {
      return '🎥';
    }
    switch (format?.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return '🖼️';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="multimedia-upload">
      <div className="upload-header">
        <h3>Multimedia del Producto</h3>
        <button 
          type="button"
          onClick={handleUpload} 
          disabled={disabled || loading}
          className="upload-btn"
        >
          {loading ? 'Subiendo...' : replaceMode ? '� Reemplazar Archivos' : '�📤 Subir Archivos'}
        </button>
        {replaceMode && (
          <p className="replace-mode-warning">
            ⚠️ Modo reemplazo: Las nuevas imágenes reemplazarán todas las anteriores
          </p>
        )}
      </div>

      <div className="multimedia-grid">
        {multimedia.map((file, index) => (
          <div key={index} className="multimedia-item">
            <div className="media-preview">
              {file.tipo === 'video' ? (
                <video 
                  src={file.url} 
                  controls 
                  className="media-thumbnail"
                  preload="metadata"
                >
                  Tu navegador no soporta videos.
                </video>
              ) : (
                <CloudinaryImage 
                  url={file.url}
                  publicId={file.public_id}
                  alt={`Media ${index + 1}`}
                  className="media-thumbnail"
                  loading="lazy"
                />
              )}
              
              <div className="media-overlay">
                <button 
                  type="button"
                  onClick={() => deleteMultimedia(file.idmulti, index)}
                  className="delete-btn"
                  title="Eliminar archivo"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="media-info">
              <span className="media-type">
                {getFileIcon(file.tipo, file.format)} {file.tipo}
              </span>
              {file.bytes && (
                <span className="media-size">
                  {formatFileSize(file.bytes)}
                </span>
              )}
              {file.duration && (
                <span className="media-duration">
                  {Math.floor(file.duration)}s
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {multimedia.length === 0 && (
        <div className="no-media">
          <p>No hay archivos multimedia</p>
          <small>Haz clic en "Subir Archivos" para añadir imágenes o videos</small>
        </div>
      )}
    </div>
  );
});

MultimediaUpload.displayName = 'MultimediaUpload';

export default MultimediaUpload;