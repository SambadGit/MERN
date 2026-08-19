import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState { accessToken: string | null; user: User | null; }
// Restore the session after a refresh so protected routes do not flash first.
const saved = localStorage.getItem('commerce-session');
const initialState: AuthState = saved ? JSON.parse(saved) : { accessToken: null, user: null };
const authSlice = createSlice({ name: 'auth', initialState, reducers: {
  // Store the short-lived access token and safe user profile in browser state.
  setSession: (state, action: PayloadAction<AuthState>) => { state.accessToken = action.payload.accessToken; state.user = action.payload.user; localStorage.setItem('commerce-session', JSON.stringify(state)); },
  // Clear client state when the user signs out or the session expires.
  clearSession: (state) => { state.accessToken = null; state.user = null; localStorage.removeItem('commerce-session'); },
} });
export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
