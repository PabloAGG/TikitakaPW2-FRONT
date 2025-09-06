import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import Loading from '../componentes/loading';
import './PerfumeDetail.css';
 //
// CAMBIO 1: Importar jsPDF y la función autoTable de forma explícita.
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PedidosTemporales = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const PRECIO_POR_PERFUME = 300; 
    const DATOS_PAGO = {
        banco: "Mercado Pago",
        titular: "Santiago De la Rosa Hernández",
        numeroCuenta: "5428 7851 7132 4840",
        concepto: "Sillage"
    };

    useEffect(() => {
        const fetchPedidos = async () => {
            const pedidosGuardados = JSON.parse(localStorage.getItem('pedidos')) || [];
            if (pedidosGuardados.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Hacemos la llamada al backend para obtener los detalles completos
                const response = await fetch(`${API_URL}/api/pedidos/temporales`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pedidos: pedidosGuardados })
                });

                if (!response.ok) throw new Error('Error al cargar los detalles del pedido');
                const data = await response.json();
                
                // data.pedidos ya viene con la información enriquecida del backend.
                // Esta es la información que usaremos para renderizar y para el PDF.
                setPedidos(data.pedidos);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPedidos();
    }, []);

    // ... (Las funciones EliminarPedido y modificarPedido pueden quedar como las tenías si funcionaban bien)
    const EliminarPedido = (idperfumeAEliminar) => {
        const pedidosActuales = JSON.parse(localStorage.getItem('pedidos')) || [];
        const nuevosPedidosStorage = pedidosActuales.filter(pedido => pedido.idperfume !== idperfumeAEliminar);
        localStorage.setItem('pedidos', JSON.stringify(nuevosPedidosStorage));
        
        const nuevosPedidosEstado = pedidos.filter(p => p.perfume.idperfume !== idperfumeAEliminar);
        setPedidos(nuevosPedidosEstado);
    };

    const modificarPedido = (idperfume, cambio) => {
        const nuevosPedidosEstado = pedidos.map(p => {
            if (p.perfume.idperfume === idperfume) {
                const nuevaCantidad = p.cantidad + cambio;
                // Actualizar también localStorage
                const pedidosStorage = JSON.parse(localStorage.getItem('pedidos')) || [];
                const pedidoEnStorage = pedidosStorage.find(ps => ps.idperfume === idperfume);
                if(pedidoEnStorage) {
                    pedidoEnStorage.cantidad = nuevaCantidad;
                }
                localStorage.setItem('pedidos', JSON.stringify(pedidosStorage.filter(ps => ps.cantidad > 0)));
                
                return { ...p, cantidad: nuevaCantidad };
            }
            return p;
        }).filter(p => p.cantidad > 0);
        setPedidos(nuevosPedidosEstado);
    };

    const totalPedido = pedidos.reduce((total, pedido) => {
        return total + (pedido.cantidad * PRECIO_POR_PERFUME);
    }, 0);

    const CerrarPedidoYGenerarPDF = async () => {
      
        if (pedidos.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }
 try {
        setLoading(true);
        const pedidosLocal = JSON.parse(localStorage.getItem('pedidos')) || [];
        
        if (pedidosLocal.length === 0) {
            alert('No hay pedidos en el carrito.');
            setLoading(false);
            return;
        }

        const idpedidotemp = Date.now();
  
        const pedidoParaEnviar = pedidosLocal.map(pedido => ({
            idperfume: pedido.idperfume,
            cantidad: pedido.cantidad,
            fecha: pedido.fecha,
            idpedidotemp: idpedidotemp
        }));

        // 3. Enviamos el array completo en el cuerpo de la petición.
        const response = await fetch(`${API_URL}/api/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoParaEnviar), // Enviamos el array directamente
        });


        if (response.ok) {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(` Pedido ${idpedidotemp} - Sillage`, 10, 20);
        doc.addImage('/IMG/Logo.png', 'PNG', 150, 10, 30, 30); // Ajusta la ruta de la imagen según tu estructura
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 30);

        const tableColumn = ["Perfume", "Cantidad", "Precio Unit.", "Subtotal"];
        const tableRows = [];

        // Usamos el estado 'pedidos' que ya tiene toda la información.
        pedidos.forEach(pedido => {
            const subtotal = pedido.cantidad * PRECIO_POR_PERFUME;
            const pedidoData = [
                pedido.perfume.nombre, // Accedemos a los detalles a través de 'pedido.perfume'
                pedido.cantidad,
                `$${PRECIO_POR_PERFUME.toFixed(2)} MXN`,
                `$${subtotal.toFixed(2)} MXN`
            ];
            tableRows.push(pedidoData);
        });

        // CAMBIO 2: Usar la función autoTable() pasando el 'doc' como primer argumento.
        autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 50,
    
    // ---  ESTILOS PERSONALIZADOS ---
    
    // Estilos para el encabezado (la fila superior)
    headStyles: {
        fillColor: [26, 26, 26], 
        textColor: [255, 255, 255],
        fontStyle: 'bold',
    },

    alternateRowStyles: {
        fillColor: [245, 245, 245] 
    },

    styles: {
        lineColor: [220, 220, 220], 
        lineWidth: 0.2,
        linePadding: 2, 
    }
        });

        const finalY = doc.lastAutoTable.finalY; // Forma correcta de obtener la posición Y
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total del Pedido: $${totalPedido.toFixed(2)} MXN`, 10, finalY + 15);
        doc.text(`Para separar tu pedido: $${(PRECIO_POR_PERFUME/2).toFixed(2)} MXN`, 10, finalY + 22);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Instrucciones de Pago", 10, finalY + 35);
        
        doc.setFont('helvetica', 'normal');
        doc.text(`Por favor, realiza el depósito a la siguiente cuenta:`, 10, finalY + 42);
        doc.text(`Banco: ${DATOS_PAGO.banco}`, 10, finalY + 49);
        doc.text(`Titular: ${DATOS_PAGO.titular}`, 10, finalY + 57);
        doc.text(`Número de Tarjeta: ${DATOS_PAGO.numeroCuenta}`, 10, finalY + 65);
        doc.text(`Concepto de Pago: ${DATOS_PAGO.concepto} Pedido:${idpedidotemp}`, 10, finalY + 73);
doc.setFontSize(14);
doc.text("No olvides enviar tu comprobante a Sillage Scents en Instagram", 10, finalY + 84);
        doc.setFontSize(10);
        doc.text("Gracias por tu compra.", 10, finalY + 100);

        doc.save(`Pedido${idpedidotemp}-Sillage.pdf`);
        
        localStorage.removeItem('pedidos');
        setPedidos([]);
        alert("¡Pedido completado y PDF descargado! Revisa tus descargas.");
        }
        } catch (err) {
        console.error("Error en CerrarPedido:", err);
        alert(`No se pudo cerrar el pedido: ${err.message}`);
    } finally {
        setLoading(false);
    }
};
  
    if (loading) return <Loading />;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (pedidos.length === 0) {
        return <div className="perfume-detail-container empty-cart"><h2>Tu carrito de pedidos está vacío.</h2></div>;
    }
    
    function capitalizarPrimeraPalabraExacto(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    return (
        <div className="perfume-detail">
            <h1>Pedido</h1>
            <div className="pedidos-list">
                {pedidos.map((pedido) => ( // Cambié idx a pedido.perfume.idperfume para una key más estable
                    <div className="perfume-detail" key={pedido.perfume?.idperfume} style={{ marginBottom: 32 }}>
                        <div className="detail-image-container">
                            <img
                                src={`../IMG/${pedido.perfume?.genero}/${pedido.perfume?.marcap}/${pedido.perfume?.img_path}`
                                    || 'https://via.placeholder.com/150'
                                }
                                alt={pedido.perfume?.nombre || 'Perfume'}
                            />
                        </div>
                        <div className="detail-info-container">
                            <h2 className="detail-name">{pedido.perfume?.nombre || 'Perfume'}</h2>
                            <h3 className="detail-marca">{pedido.perfume?.marcap}</h3>
                            <p className="detail-description">
                                {capitalizarPrimeraPalabraExacto(pedido.perfume?.descripcion)}
                            </p>
                            <div className="detail-meta">
                                <p><strong>Género:</strong> {pedido.perfume?.genero}</p>
                                <p><strong>Clima ideal:</strong> {pedido.perfume?.clima}</p>
                                 <div className="quantity-section">
                                <div className="quantity-controls">
                                    <button className="quantity-btn" onClick={() => modificarPedido(pedido.perfume?.idperfume, -1)}>-</button>
                                    <span className="quantity-display">{pedido.cantidad}</span>
                                    <button className="quantity-btn" onClick={() => modificarPedido(pedido.perfume?.idperfume, 1)}>+</button>
                                </div>
                            </div>

                
                            </div>
                          <br />
                            <button className='dltPerf' onClick={() => EliminarPedido(pedido.perfume.idperfume)}>Eliminar</button>
                        </div>
                    </div>
                    
                ))}
               <div className="total-section">
                    <h2>Total: ${totalPedido.toFixed(2)} MXN</h2>
                    <button className='completeCarr' onClick={CerrarPedidoYGenerarPDF}>Cerrar pedido</button>
                </div>
            </div>
        </div>
    );
};
export default PedidosTemporales;