import React, { useState } from 'react';

const CloudinaryImage = ({ 
  url, 
  publicId, 
  alt, 
  className, 
  width, 
  height,
  loading = 'lazy'
}) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [hasError, setHasError] = useState(false);

  // Función para generar URLs alternativas
  const generateAlternativeUrls = (originalUrl, publicId) => {
    const alternatives = [];
    
    if (publicId) {
      // URL básica sin versión
      alternatives.push(`https://res.cloudinary.com/dmyrtncnm/image/upload/${publicId}`);
      
      // URL con extensión jpg
      alternatives.push(`https://res.cloudinary.com/dmyrtncnm/image/upload/${publicId}.jpg`);
      
      // URL con extensión png
      alternatives.push(`https://res.cloudinary.com/dmyrtncnm/image/upload/${publicId}.png`);
    }
    
    // Si la URL original tiene timestamp problemático, generar una limpia
    if (originalUrl && originalUrl.includes('/v1760291318/')) {
      const match = originalUrl.match(/\/v\d+\/([^\/]+)$/);
      if (match) {
        const filename = match[1];
        alternatives.push(`https://res.cloudinary.com/dmyrtncnm/image/upload/${filename}`);
      }
    }
    
    return alternatives;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      
      // Intentar URLs alternativas
      const alternatives = generateAlternativeUrls(url, publicId);
      
      if (alternatives.length > 0) {
        console.log('Imagen falló, intentando URL alternativa:', alternatives[0]);
        setCurrentUrl(alternatives[0]);
        setHasError(false); // Reset para intentar la alternativa
      } else {
        console.error('No se pudo cargar la imagen:', url);
      }
    }
  };

  const handleLoad = () => {
    if (hasError) {
      console.log('Imagen cargada exitosamente con URL alternativa:', currentUrl);
    }
  };

  if (hasError && generateAlternativeUrls(url, publicId).length === 0) {
    // Si no hay alternativas y falló, mostrar placeholder
    return (
      <div 
        className={`${className} image-placeholder`}
        style={{ 
          width: width || '200px', 
          height: height || '150px',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}
      >
        {alt || 'Imagen no disponible'}
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default CloudinaryImage;