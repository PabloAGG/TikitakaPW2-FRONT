import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useMemo, useState } from 'react';
import AlertMsg from '../componentes/AlertMsg';
import CloudinaryImage from '../componentes/CloudinaryImage';
import Loading from '../componentes/loading';
import API_URL from '../config/api';
import { useCart } from '../context/CartContext';
import './PerfumeDetail.css';

const DATOS_PAGO = {
  banco: 'Mercado Pago',
  titular: 'Sillage Scents',
  numeroCuenta: '5428 7851 7132 4840',
};

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

const PedidosTemporales = () => {
  const { items, updateQuantity, removeItem, clearCart, totalAmount, totalItems, DEFAULT_PRICE } =
    useCart();
  const [processing, setProcessing] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState({
    metodo: 'tarjeta',
    titular: '',
    referencia: '',
  });

  const totalConFormato = useMemo(() => currencyFormatter.format(totalAmount), [totalAmount]);

  const handleQuantityChange = (productId, delta) => {
    const item = items.find((current) => current.productId === productId);
    if (!item) return;
    const nuevaCantidad = item.quantity + delta;
    updateQuantity(productId, nuevaCantidad);
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const generarPdf = (pedidosConfirmados, referencia) => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-MX');

    doc.setFontSize(20);
    doc.text('Comprobante de compra - Sillage', 10, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fecha}`, 10, 30);
    if (referencia) {
      doc.text(`Referencia de pago: ${referencia}`, 10, 38);
    }

    const tableColumn = ['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'];
    const tableRows = pedidosConfirmados.map((pedido) => {
      const producto = items.find((item) => item.productId === pedido.producto) ?? null;
      const precioUnitario = producto?.product?.precio ?? DEFAULT_PRICE;
      const subtotal = precioUnitario * pedido.cantidad;
      return [
        pedido.productoNombre || producto?.product?.nombre || 'Producto',
        pedido.cantidad,
        currencyFormatter.format(precioUnitario),
        currencyFormatter.format(subtotal),
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      headStyles: {
        fillColor: [26, 26, 26],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text(`Total del pedido: ${totalConFormato}`, 10, finalY + 15);
    doc.setFontSize(12);
    doc.text('Instrucciones de pago simuladas', 10, finalY + 25);
    doc.text(`Banco: ${DATOS_PAGO.banco}`, 10, finalY + 33);
    doc.text(`Titular: ${paymentData.titular || DATOS_PAGO.titular}`, 10, finalY + 41);
    doc.text(`Número de tarjeta: ${DATOS_PAGO.numeroCuenta}`, 10, finalY + 49);
    doc.text('Gracias por tu compra.', 10, finalY + 63);

    doc.save(`pedido-sillage-${Date.now()}.pdf`);
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
      setError('Completa los datos del pago simulado.');
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
      clearCart();
      setMensaje('¡Pago simulado exitosamente! Revisa el PDF con tu comprobante.');
      setPaymentData({ metodo: 'tarjeta', titular: '', referencia: '' });
    } catch (checkoutError) {
      console.error('Error durante el checkout:', checkoutError);
      setError(checkoutError.message);
    } finally {
      setProcessing(false);
    }
  };

  if (processing && items.length === 0) {
    return <Loading />;
  }

  if (items.length === 0) {
    return (
      <div className="perfume-detail-container empty-cart">
        <h2>Tu carrito está vacío.</h2>
        {mensaje && <AlertMsg message={mensaje} type="success" />}
        {error && <AlertMsg message={error} type="error" />}
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <h1>Tu carrito</h1>
      {mensaje && <AlertMsg message={mensaje} type="success" />}
      {error && <AlertMsg message={error} type="error" />}

      <div className="pedidos-list">
        {items.map((item) => {
          const { product, productId, quantity } = item;
          const precioUnitario = product?.precio ?? DEFAULT_PRICE;
          const subtotal = precioUnitario * quantity;

          return (
            <div className="carrito-item" key={productId}>
              <div className="detail-image-container">
                {product?.img ? (
                  <CloudinaryImage
                    url={product.img}
                    alt={product.nombre}
                    className="carousel-media"
                  />
                ) : (
                  <img
                    src={`https://via.placeholder.com/200x200?text=${encodeURIComponent(
                      product?.nombre ?? 'Producto'
                    )}`}
                    alt={product?.nombre ?? 'Producto'}
                  />
                )}
              </div>
              <div className="detail-info-container">
                <h2 className="detail-name">{product?.nombre}</h2>
                {product?.seleccionNombre && (
                  <p className="detail-marca">{product.seleccionNombre}</p>
                )}
                <p className="detail-description">Cantidad: {quantity}</p>
                <p className="detail-description">
                  Precio unitario: {currencyFormatter.format(precioUnitario)}
                </p>
                <p className="detail-description">Subtotal: {currencyFormatter.format(subtotal)}</p>

                <div className="quantity-section">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(productId, -1)}
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(productId, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button className="dltPerf" onClick={() => removeItem(productId)}>
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="total-section">
        <h2>
          Total ({totalItems} artículos): {totalConFormato}
        </h2>
      </div>

      <form className="pago-form" onSubmit={handleCheckout}>
        <h2>Simulación de pago</h2>
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
          <label htmlFor="metodo">Método de pago</label>
          <select
            id="metodo"
            name="metodo"
            className="perfume-input"
            value={paymentData.metodo}
            onChange={handlePaymentChange}
          >
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia</option>
            <option value="oxxo">Oxxo</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="referencia">Referencia de pago</label>
          <input
            id="referencia"
            name="referencia"
            className="perfume-input"
            value={paymentData.referencia}
            onChange={handlePaymentChange}
            placeholder="Ingresa una referencia para este pago simulado"
            required
          />
        </div>

        <button className="completeCarr" type="submit" disabled={processing}>
          {processing ? 'Procesando...' : 'Confirmar pago simulado'}
        </button>
      </form>
    </div>
  );
};

export default PedidosTemporales;
