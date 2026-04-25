import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import materialReducer from './slices/materialSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    materials: materialReducer,
  },
});
