import { useEffect, useState } from 'react';
import CloudinaryImage from './CloudinaryImage';
import './MediaCarousel.css';

const MediaCarousel = ({ multimedia, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [multimedia]);

  if (!multimedia || multimedia.length === 0) {
    return (
      <div className="media-carousel no-media">
        <img
          src={`https://via.placeholder.com/400x300?text=${encodeURIComponent(productName)}`}
          alt={productName}
          className="carousel-media placeholder"
        />
        <p className="no-media-text">No hay imágenes disponibles</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? multimedia.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === multimedia.length - 1 ? 0 : prevIndex + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const currentMedia = multimedia[currentIndex];

  return (
    <div className="media-carousel">
      {/* Media principal */}
      <div className="carousel-main">
        <div className="carousel-container">
          {currentMedia.tipo === 'video' ? (
            <video
              src={currentMedia.url}
              controls
              className="carousel-media"
              key={currentMedia.idmulti} // Force re-render when changing videos
            >
              Tu navegador no soporta videos.
            </video>
          ) : (
            <CloudinaryImage
              url={currentMedia.url}
              publicId={currentMedia.public_id}
              alt={`${productName} - imagen ${currentIndex + 1}`}
              className="carousel-media"
              key={currentMedia.idmulti || currentMedia.url}
            />
          )}

          {/* Controles de navegación (solo si hay más de 1 media) */}
          {multimedia.length > 1 && (
            <>
              <button
                className="carousel-btn carousel-btn-prev"
                onClick={goToPrevious}
                aria-label="Imagen anterior"
              >
                ‹
              </button>
              <button
                className="carousel-btn carousel-btn-next"
                onClick={goToNext}
                aria-label="Imagen siguiente"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Indicador de posición */}
        {multimedia.length > 1 && (
          <div className="carousel-counter">
            {currentIndex + 1} / {multimedia.length}
          </div>
        )}
      </div>

      {/* Thumbnails (solo si hay más de 1 media) */}
      {multimedia.length > 1 && (
        <div className="carousel-thumbnails">
          {multimedia.map((media, index) => (
            <div
              key={media.idmulti || index}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            >
              {media.tipo === 'video' ? (
                <div className="thumbnail-video">
                  <video src={media.url} className="thumbnail-media" muted />
                  <div className="video-overlay">▶</div>
                </div>
              ) : (
                <CloudinaryImage
                  url={media.url}
                  publicId={media.public_id}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="thumbnail-media"
                  width="80"
                  height="60"
                />
              )}
            </div>
          ))}
        </div>
      )}

    </div>
      
  );
};

export default MediaCarousel;
