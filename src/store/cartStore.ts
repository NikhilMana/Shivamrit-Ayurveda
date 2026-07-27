import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  clearCart: () => void;
  getTotals: () => { totalItems: number; totalPrice: number };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true };
        });
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: quantity > 0 
            ? state.items.map((i) => (i.id === id ? { ...i, quantity } : i))
            : state.items.filter((i) => i.id !== id),
        })),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen) => set({ isOpen }),
      clearCart: () => set({ items: [] }),
      getTotals: () => {
        const state = get();
        return state.items.reduce(
          (acc, item) => ({
            totalItems: acc.totalItems + item.quantity,
            totalPrice: acc.totalPrice + item.price * item.quantity,
          }),
          { totalItems: 0, totalPrice: 0 }
        );
      },
    }),
    {
      name: 'shivamrit-cart',
    }
  )
);
