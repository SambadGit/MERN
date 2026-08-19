import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState { accessToken: string | null; user: User | null; }
const saved = localStorage.getItem('commerce-session');
const initialState: AuthState = saved ? JSON.parse(saved) : { accessToken: null, user: null };
const authSlice = createSlice({ name: 'auth', initialState, reducers: {
  setSession: (state, action: PayloadAction<AuthState>) => { state.accessToken = action.payload.accessToken; state.user = action.payload.user; localStorage.setItem('commerce-session', JSON.stringify(state)); },
  clearSession: (state) => { state.accessToken = null; state.user = null; localStorage.removeItem('commerce-session'); },
} });
export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
