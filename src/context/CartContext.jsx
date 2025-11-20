import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import API_URL from '../config/api';

const CartContext = createContext(undefined);
const DEFAULT_PRICE = 300;

const mapPedidoToItem = (pedido) => ({
  cartId: pedido.idPedido ?? pedido.idpedido ?? null,
  productId: pedido.producto,
  quantity: Number(pedido.cantidad) || 0,
  product: {
    nombre: pedido.productoNombre ?? '',
    seleccionNombre: pedido.seleccionNombre ?? '',
    genero: pedido.genero ?? '',
    descripcion: pedido.descripcion ?? '',
    img: pedido.img ?? null,
    precio: Number(pedido.precio ?? DEFAULT_PRICE) || DEFAULT_PRICE,
  },
});

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const ensureToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      const error = new Error('Se requiere sesión para usar el carrito');
      error.code = 'AUTH_REQUIRED';
      throw error;
    }
    return token;
  }, []);

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setItems([]);
      setIsInitialized(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/carrito`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('cart:token-change'));
        }
        throw new Error('No se pudo obtener el carrito');
      }

      const data = await response.json();
      const mappedItems = Array.isArray(data) ? data.map(mapPedidoToItem) : [];
      setItems(mappedItems);
    } catch (error) {
      console.error('No se pudo cargar el carrito:', error);
      setItems([]);
    } finally {
      setIsInitialized(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const handleTokenChange = () => {
      refreshCart();
    };

    window.addEventListener('storage', handleTokenChange);
    window.addEventListener('cart:token-change', handleTokenChange);

    return () => {
      window.removeEventListener('storage', handleTokenChange);
      window.removeEventListener('cart:token-change', handleTokenChange);
    };
  }, [refreshCart]);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      const productId = product?.idProduct ?? product?.id ?? product?.productoId;

      if (!productId) {
        console.warn('No se pudo agregar el producto al carrito: falta el identificador.');
        return false;
      }

      const parsedQuantity = Number(quantity) || 1;

      try {
        const token = ensureToken();

        const response = await fetch(`${API_URL}/api/carrito`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productoId: productId, cantidad: parsedQuantity }),
        });

        if (!response.ok) {
          throw new Error('No se pudo agregar el producto al carrito');
        }

        await refreshCart();
        return true;
      } catch (error) {
        if (error.code === 'AUTH_REQUIRED') {
          throw error;
        }

        console.error('Error al agregar producto al carrito:', error);
        throw error;
      }
    },
    [refreshCart, ensureToken]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      const parsedQuantity = Number.parseInt(quantity, 10);
      if (!Number.isFinite(parsedQuantity)) {
        return;
      }

      try {
        const token = ensureToken();

        const method = parsedQuantity > 0 ? 'PUT' : 'DELETE';
        const response = await fetch(`${API_URL}/api/carrito/${productId}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: method === 'PUT' ? JSON.stringify({ cantidad: parsedQuantity }) : undefined,
        });

        if (!response.ok) {
          throw new Error('No se pudo actualizar el carrito');
        }

        await refreshCart();
      } catch (error) {
        if (error.code === 'AUTH_REQUIRED') {
          throw error;
        }
        console.error('Error al actualizar cantidad en el carrito:', error);
        throw error;
      }
    },
    [refreshCart, ensureToken]
  );

  const removeItem = useCallback(
    async (productId) => {
      try {
        const token = ensureToken();

        const response = await fetch(`${API_URL}/api/carrito/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('No se pudo eliminar el artículo del carrito');
        }

        await refreshCart();
      } catch (error) {
        if (error.code === 'AUTH_REQUIRED') {
          throw error;
        }
        console.error('Error al eliminar producto del carrito:', error);
        throw error;
      }
    },
    [refreshCart, ensureToken]
  );

  const clearCart = useCallback(async () => {
    try {
      const token = ensureToken();

      const response = await fetch(`${API_URL}/api/carrito`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('No se pudo vaciar el carrito');
      }

      await refreshCart();
    } catch (error) {
      if (error.code === 'AUTH_REQUIRED') {
        throw error;
      }
      console.error('Error al vaciar el carrito:', error);
      throw error;
    }
  }, [refreshCart, ensureToken]);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
    [items]
  );

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + (Number(item.product?.precio ?? DEFAULT_PRICE) || DEFAULT_PRICE) * item.quantity,
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      totalItems,
      totalAmount,
      DEFAULT_PRICE,
      isLoading,
      isInitialized,
    }),
    [
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      totalItems,
      totalAmount,
      isLoading,
      isInitialized,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};
