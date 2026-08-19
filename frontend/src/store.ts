import { configureStore } from '@reduxjs/toolkit';
import { api } from './services/api';
import authReducer from './features/auth/authSlice';

// Redux holds the browser session, while RTK Query owns cached server data.
export const store = configureStore({ reducer: { auth: authReducer, [api.reducerPath]: api.reducer }, middleware: (getDefault) => getDefault().concat(api.middleware) });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
