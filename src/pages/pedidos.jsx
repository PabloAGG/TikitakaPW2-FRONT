import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMsg from '../componentes/AlertMsg';
import CloudinaryImage from '../componentes/CloudinaryImage';
import Loading from '../componentes/loading';
import API_URL from '../config/api';
import { useCart } from '../context/CartContext';
import './PerfumeDetail.css';

// Estilos adicionales para el checkout success
const successStyles = `
  .checkout-success {
    text-align: center;
    padding: 3rem;
    max-width: 500px;
    margin: 0 auto;
  }

  .success-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 0.6s ease-in-out;
  }

  .loading-dots {
    display: inline-flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #3498db;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .loading-dots span:nth-child(2) {
    animation-delay: 0.3s;
  }

  .loading-dots span:nth-child(3) {
    animation-delay: 0.6s;
  }

  @keyframes bounce {
    0%, 20%, 60%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-20px);
    }
    80% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .btn-primary {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
    transition: background-color 0.2s ease;
  }

  .btn-primary:hover {
    background-color: #2980b9;
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = successStyles;
  document.head.appendChild(styleElement);
}

const DATOS_PAGO = {
  banco: 'Mercado Pago',
  titular: 'Tikitaka',
  numeroCuenta: '5428 7851 7132 4840',
};

const METODOS_PAGO = [
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'oxxo', label: 'Oxxo' },
];

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

const PedidosTemporales = () => {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeItem: removeCartItem,
    clearCart,
    totalAmount,
    totalItems,
    DEFAULT_PRICE,
    refreshCart,
    isLoading,
    isInitialized,
  } = useCart();
  const [processing, setProcessing] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);
  const [paymentData, setPaymentData] = useState({
    metodo: 'tarjeta',
    titular: '',
    referencia: '',
  });

  const totalConFormato = useMemo(() => currencyFormatter.format(totalAmount), [totalAmount]);

  const handleQuantityChange = async (productId, delta) => {
    const item = items.find((current) => current.productId === productId);
    if (!item) return;
    const nuevaCantidad = item.quantity + delta;
    try {
      await updateQuantity(productId, nuevaCantidad);
    } catch (quantityError) {
      if (quantityError.code === 'AUTH_REQUIRED') {
        navigate('/login', {
          replace: true,
          state: { error: 'Inicia sesión para administrar tu carrito.' },
        });
        return;
      }
      setError('No se pudo actualizar la cantidad. Intenta nuevamente.');
      console.error('Error al actualizar la cantidad:', quantityError);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeCartItem(productId);
    } catch (removeError) {
      if (removeError.code === 'AUTH_REQUIRED') {
        navigate('/login', {
          replace: true,
          state: { error: 'Inicia sesión para administrar tu carrito.' },
        });
        return;
      }
      setError('No se pudo quitar el producto del carrito.');
      console.error('Error al remover del carrito:', removeError);
    }
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMetodoClick = (metodo) => {
    setPaymentData((prev) => ({ ...prev, metodo }));
  };

  const generarPdf = (pedidosConfirmados, referencia) => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const numeroOrden = `TK-${Date.now().toString().slice(-8)}`;

    // Colores del tema
    const primaryColor = [52, 152, 219]; // Azul
    const darkColor = [44, 62, 80]; // Gris oscuro
    const lightGray = [248, 249, 250];

    // Header con logo y título
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('TIKITAKA', 15, 22);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante de Compra', 15, 30);

    // Información del pedido
    doc.setTextColor(...darkColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PEDIDO', 15, 50);
    
    // Línea separadora
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, 52, 195, 52);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Número de orden: ${numeroOrden}`, 15, 62);
    doc.text(`Fecha: ${fecha}`, 15, 70);
    if (referencia) {
      doc.text(`Referencia de pago: ${referencia}`, 15, 78);
    }
    doc.text(`Método de pago: ${paymentData.metodo.charAt(0).toUpperCase() + paymentData.metodo.slice(1)}`, 15, 86);

    // Tabla de productos mejorada
    const tableColumn = ['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal'];
    const tableRows = pedidosConfirmados.map((pedido) => {
      const producto = items.find((item) => item.productId === pedido.producto) ?? null;
      const precioUnitario = producto?.product?.precio ?? DEFAULT_PRICE;
      const subtotal = precioUnitario * pedido.cantidad;
      return [
        pedido.productoNombre || producto?.product?.nombre || 'Producto',
        pedido.cantidad.toString(),
        currencyFormatter.format(precioUnitario),
        currencyFormatter.format(subtotal),
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 95,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 5,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
      margin: { left: 15, right: 15 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Total con estilo mejorado
    doc.setFillColor(...primaryColor);
    doc.rect(15, finalY, 180, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${totalConFormato}`, 20, finalY + 10);

    // Información de pago
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DE PAGO (DEMO)', 15, finalY + 30);
    
    doc.setDrawColor(...primaryColor);
    doc.line(15, finalY + 32, 195, finalY + 32);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Banco: ${DATOS_PAGO.banco}`, 15, finalY + 42);
    doc.text(`Titular: ${paymentData.titular || DATOS_PAGO.titular}`, 15, finalY + 50);
    doc.text(`Número de cuenta: ${DATOS_PAGO.numeroCuenta}`, 15, finalY + 58);

    // Nota importante
    doc.setFillColor(255, 243, 205); // Amarillo suave
    doc.rect(15, finalY + 68, 180, 20, 'F');
    doc.setDrawColor(255, 193, 7); // Amarillo
    doc.rect(15, finalY + 68, 180, 20, 'S');
    
    doc.setTextColor(133, 100, 4); // Texto amarillo oscuro
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTA:', 20, finalY + 78);
    doc.setFont('helvetica', 'normal');
    doc.text('Este es un comprobante de demostración. No se realizó ningún cargo real.', 35, finalY + 78);
    doc.text('Para soporte contacta: tikitaka@demo.com | Tel: (555) 123-4567', 20, finalY + 85);

    // Footer
    doc.setTextColor(...primaryColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('¡Gracias por tu compra en Tikitaka!', 15, finalY + 105);
    doc.text('www.tikitaka-demo.com', 15, finalY + 112);

    doc.save(`Comprobante-Tikitaka-${numeroOrden}.pdf`);
  };

  const handleCheckout = async (event) => {
    event.preventDefault();
    if (items.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Inicia sesión para completar tu compra.');
      return;
    }

    if (!paymentData.titular.trim() || !paymentData.referencia.trim()) {
      setError('Completa los datos del pago.');
      return;
    }

    setProcessing(true);
    setError(null);
    setMensaje(null);

    try {
      const response = await fetch(`${API_URL}/api/pedidos/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productoId: item.productId,
            cantidad: item.quantity,
          })),
          pago: paymentData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'No se pudo registrar el pedido');
      }

    const data = await response.json();
    generarPdf(data.pedidos, paymentData.referencia);
    await clearCart();
    setMensaje('¡Pedido confirmado exitosamente! 🎉 Tu comprobante se ha descargado automáticamente.');
    setPaymentData({ metodo: 'tarjeta', titular: '', referencia: '' });
    
    // Redirigir después de 3 segundos para mostrar el mensaje
    setTimeout(() => {
      navigate('/mis-pedidos', { 
        replace: true,
        state: { success: 'Pedido confirmado. Puedes revisar el estado en "Mis Pedidos".' }
      });
    }, 3000);
    } catch (checkoutError) {
      console.error('Error durante el checkout:', checkoutError);
      if (checkoutError.code === 'AUTH_REQUIRED') {
        navigate('/login', {
          replace: true,
          state: { error: 'Inicia sesión para completar tu compra.' },
        });
        return;
      }
      setError(checkoutError.message);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', {
        replace: true,
        state: { error: 'Inicia sesión para ver tu carrito.' },
      });
      return;
    }

    refreshCart();
  }, [navigate, refreshCart]);

  if (!isInitialized || (isLoading && items.length === 0)) {
    return <Loading />;
  }

  if (items.length === 0) {
    return (
      <div className="perfume-detail-container empty-cart">
        {mensaje ? (
          <div className="checkout-success">
            <div className="success-icon">✅</div>
            <h2>¡Pedido realizado con éxito!</h2>
            <AlertMsg message={mensaje} type="success" />
            <p>Serás redirigido a "Mis Pedidos" en unos segundos...</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : (
          <>
            <h2>Tu carrito está vacío.</h2>
            <p>Agrega algunos productos para comenzar tu compra.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/catalogo')}
            >
              Ver Catálogo
            </button>
          </>
        )}
        {error && <AlertMsg message={error} type="error" />}
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        <div>
          <h1>Tu carrito</h1>
          <p className="carrito-subtitle">Revisa los artículos antes de confirmar tu pedido</p>
        </div>
        <div className="carrito-resumen-mini">
          <span className="resumen-mini-total">{totalConFormato}</span>
          <span className="resumen-mini-items">{totalItems} artículos</span>
        </div>
      </div>

      {mensaje && <AlertMsg message={mensaje} type="success" />}
      {error && <AlertMsg message={error} type="error" />}

      <div className="carrito-contenido">
        <div className="pedidos-list">
        {items.map((item) => {
          const { product, productId, quantity } = item;
          const precioUnitario = product?.precio ?? DEFAULT_PRICE;
          const subtotal = precioUnitario * quantity;

          return (
              <div className="carrito-item" key={productId}>
                <div className="carrito-item-media">
                  <div className="carrito-item-media-wrapper">
                    {product?.img ? (
                      <CloudinaryImage
                        url={product.img}
                        alt={product.nombre}
                        className="carrito-item-media-img"
                      />
                    ) : (
                      <img
                        src={`https://via.placeholder.com/200x200?text=${encodeURIComponent(
                          product?.nombre ?? 'Producto'
                        )}`}
                        alt={product?.nombre ?? 'Producto'}
                        className="carrito-item-media-img"
                      />
                    )}
                  </div>
                </div>
                <div className="carrito-item-info">
                  <div className="carrito-item-header">
                    <div>
                      <h2 className="detail-name">{product?.nombre}</h2>
                      {product?.seleccionNombre && (
                        <p className="detail-marca">{product.seleccionNombre}</p>
                      )}
                    </div>
                    <button className="carrito-remove" onClick={() => handleRemove(productId)}>
                      Quitar
                    </button>
                  </div>

                  <div className="carrito-item-precios">
                    <div>
                      <span className="carrito-precio-label">Precio unitario</span>
                      <span className="carrito-precio-valor">
                        {currencyFormatter.format(precioUnitario)}
                      </span>
                    </div>
                    <div>
                      <span className="carrito-precio-label">Subtotal</span>
                      <span className="carrito-precio-total">
                        {currencyFormatter.format(subtotal)}
                      </span>
                    </div>
                  </div>

                  <div className="carrito-item-controles">
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(productId, -1)}
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="quantity-display">{quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(productId, 1)}
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          );
        })}
      </div>
        <aside className="carrito-resumen">
          <div className="total-section">
            <div className="total-header">
              <h2>Resumen</h2>
              <span className="total-articulos">{totalItems} artículos</span>
            </div>
            <div className="total-cifra">{totalConFormato}</div>
            <p className="total-nota">Incluye estimación de impuestos y cargos.</p>
          </div>

          <form className="pago-form" onSubmit={handleCheckout}>
            <h3>Confirmación de pago</h3>
            <p className="pago-hint">
              Este checkout funciona como demostración: los datos no generan un cobro real, pero sí
              un comprobante que puedes descargar.
            </p>
            <div className="payment-pill-group">
              {METODOS_PAGO.map((metodo) => (
                <button
                  key={metodo.value}
                  type="button"
                  className={`payment-pill ${paymentData.metodo === metodo.value ? 'active' : ''}`}
                  onClick={() => handleMetodoClick(metodo.value)}
                >
                  {metodo.label}
                </button>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="titular">Nombre del titular</label>
              <input
                id="titular"
                name="titular"
                className="perfume-input"
                value={paymentData.titular}
                onChange={handlePaymentChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="referencia">Referencia de pago</label>
              <input
                id="referencia"
                name="referencia"
                className="perfume-input"
                value={paymentData.referencia}
                onChange={handlePaymentChange}
                placeholder="Ingresa una referencia para identificar este pago"
                required
              />
            </div>

            <div className="pago-meta">
              <span>
                <strong>Institución:</strong> {DATOS_PAGO.banco}
              </span>
              <span>
                <strong>Cuenta demostrativa:</strong> {DATOS_PAGO.numeroCuenta}
              </span>
            </div>

            <div className="pago-instrucciones">
              <strong>Cómo finalizar:</strong> ingresa un nombre y una referencia única. Con eso
              generaremos el PDF con el resumen del pedido y los datos de pago de prueba.
            </div>

            <button className="completeCarr" type="submit" disabled={processing}>
              {processing ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default PedidosTemporales;
