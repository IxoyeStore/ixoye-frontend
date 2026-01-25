import { ProductType } from "@/types/product";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

interface CartStore {
  items: ProductType[];
  addItem: (data: ProductType) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeAll: () => void;
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],

      addItem: (data) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === data.id);

        const stockAvailable = Number(data.stock) ?? 0;

        if (existingItem) {
          const nextQuantity = (existingItem.quantity || 1) + 1;

          if (nextQuantity > stockAvailable) {
            toast.error("Límite de stock alcanzado", {
              description: `Solo hay ${stockAvailable} unidades disponibles.`,
            });
            return;
          }

          const updatedItems = currentItems.map((item) =>
            item.id === data.id ? { ...item, quantity: nextQuantity } : item
          );
          set({ items: updatedItems });
          toast.success("Cantidad actualizada.");
          return;
        }

        if (stockAvailable <= 0) {
          toast.error("Producto sin existencias.");
          return;
        }

        set({
          items: [...currentItems, { ...data, quantity: 1 }],
        });

        toast.success("Producto agregado al carrito.");
      },

      updateQuantity: (id: number, quantity: number) => {
        const currentItems = get().items;
        const item = currentItems.find((i) => i.id === id);
        if (!item) return;

        const stockAvailable = Number(item.stock) ?? 0;

        if (quantity > stockAvailable) {
          toast.error("Límite de compra alcanzado", {
            description: `Solo hay ${stockAvailable} disponibles.`,
          });
          return;
        }

        const updatedItems = currentItems.map((item) =>
          item.id === id ? { ...item, quantity: quantity } : item
        );
        set({ items: updatedItems });
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
        toast.info("Producto eliminado del carrito.");
      },

      removeAll: () => {
        set({ items: [] });
        toast.info("Carrito vaciado.");
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
