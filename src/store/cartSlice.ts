import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  ean: string;
  title: string;
  cover: string;
  priceHT: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existing = state.items.find(
        (item) => item.ean === action.payload.ean,
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
  },
});

export const { addItem } = cartSlice.actions;
export default cartSlice.reducer;
