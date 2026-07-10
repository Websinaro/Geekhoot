import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    category: string;
    sizeStock?: Record<string, number> | null;
  };
}

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  addItem: (product: any, quantity?: number, size?: string | null) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      setItems: (items) => set({ items }),
      addItem: (product, quantity = 1, size = null) => {
        const items = get().items;
        // Items are matched by product + size, so the same product in two
        // different sizes is tracked as two separate cart lines.
        const existingItem = items.find(
          (item) => item.productId === product.id && (item.size || null) === (size || null)
        );
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: Math.random().toString(36).substring(7),
                productId: product.id,
                quantity,
                size: size || undefined,
                product,
              },
            ],
          });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),
      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
