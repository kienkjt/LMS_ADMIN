import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    loading: false,
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.total = action.payload.total || 0;
    },
    addToCart: (state, action) => {
      const exists = state.items.find(i => i.courseId === action.payload.courseId);
      if (!exists) state.items.push(action.payload);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.courseId !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    setTotal: (state, action) => { state.total = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setCart, addToCart, removeFromCart, clearCart, setTotal, setLoading } = cartSlice.actions;
export default cartSlice.reducer;
