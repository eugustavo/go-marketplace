/* eslint-disable no-param-reassign */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMarketplace:Products');

      if (data) {
        setProducts([...JSON.parse(data)]);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const findProduct = products.find(pro => pro.id === product.id);

      if (findProduct) {
        const allProducts = products.map(pro =>
          pro.id === product.id
            ? { ...product, quantity: pro.quantity + 1 }
            : pro,
        );

        setProducts(allProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:Products',
          JSON.stringify(allProducts),
        );
      } else {
        const newProduct = {
          ...product,
          quantity: 1,
        };

        setProducts([...products, newProduct]);
        await AsyncStorage.setItem(
          '@GoMarketplace:Products',
          JSON.stringify(newProduct),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProductQuantity = products.map(pro =>
        pro.id === id ? { ...pro, quantity: pro.quantity + 1 } : pro,
      );

      setProducts(incrementProductQuantity);
      await AsyncStorage.setItem(
        '@GoMarketplace:Products',
        JSON.stringify(incrementProductQuantity),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementProductQuantity = products.map(pro =>
        pro.id === id ? { ...pro, quantity: pro.quantity - 1 } : pro,
      );

      setProducts(decrementProductQuantity);
      await AsyncStorage.setItem(
        '@GoMarketplace:Products',
        JSON.stringify(decrementProductQuantity),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
