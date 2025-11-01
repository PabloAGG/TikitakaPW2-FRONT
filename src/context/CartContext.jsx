import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(undefined);
const CART_STORAGE_KEY = 'cartItems';
const DEFAULT_PRICE = 300;

const readStoredCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('No se pudo leer el carrito almacenado:', error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => readStoredCart());

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    if (!product) {
      return;
    }

    const productId = product.idProduct ?? product.id ?? product.productoId;
    if (!productId) {
      console.warn('No se pudo agregar el producto al carrito: falta el identificador.');
      return;
    }

    const productSnapshot = {
      id: productId,
      nombre: product.nombre,
      seleccionNombre: product.seleccionNombre ?? product.seleccionnombre ?? '',
      genero: product.genero,
      img: product.img ?? product.Img ?? null,
      precio: product.precio ?? DEFAULT_PRICE,
    };

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === productId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prev,
        {
          productId,
          quantity,
          product: productSnapshot,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) => {
      const parsedQuantity = Number.parseInt(quantity, 10);
      if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return prev.filter((item) => item.productId !== productId);
      }

      return prev.map((item) =>
        item.productId === productId ? { ...item, quantity: parsedQuantity } : item
      );
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce(
    (total, item) => total + (item.product?.precio ?? DEFAULT_PRICE) * item.quantity,
    0
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      totalItems,
      totalAmount,
      DEFAULT_PRICE,
    }),
    [items, totalAmount, totalItems]
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
