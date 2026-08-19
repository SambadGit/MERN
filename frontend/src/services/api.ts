import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { Dashboard, Order, OrderStatus, Page, Product, User } from '../types';

// RTK Query adds the access token to every request and sends the HTTP-only
// refresh cookie automatically. Components use generated hooks below instead
// of writing fetch calls themselves.
const baseQuery = fetchBaseQuery({ baseUrl: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`, credentials: 'include', prepareHeaders: (headers, { getState }) => { const token = (getState() as RootState).auth.accessToken; if (token) headers.set('authorization', `Bearer ${token}`); return headers; } });
// Tags tell RTK Query which cached screens should reload after a mutation.
export const api = createApi({ reducerPath: 'api', baseQuery, tagTypes: ['Product', 'Order', 'User', 'Dashboard'], endpoints: (build) => ({
  login: build.mutation<{ data: { user: User; accessToken: string } }, { email: string; password: string }>({ query: (body) => ({ url: '/auth/login', method: 'POST', body }) }),
  register: build.mutation<{ data: { user: User; accessToken: string } }, { name: string; email: string; password: string }>({ query: (body) => ({ url: '/auth/register', method: 'POST', body }) }),
  refresh: build.mutation<{ data: { user: User; accessToken: string } }, void>({ query: () => ({ url: '/auth/refresh', method: 'POST' }) }),
  logout: build.mutation<void, void>({ query: () => ({ url: '/auth/logout', method: 'POST' }) }),
  dashboard: build.query<{ data: Dashboard }, void>({ query: () => '/dashboard', providesTags: ['Dashboard'] }),
  products: build.query<{ data: Page<Product> }, { page?: number; limit?: number; search?: string }>({ query: (params) => ({ url: '/products', params }), providesTags: ['Product'] }),
  createProduct: build.mutation<{ data: Product }, Partial<Product>>({ query: (body) => ({ url: '/products', method: 'POST', body }), invalidatesTags: ['Product', 'Dashboard'] }),
  deleteProduct: build.mutation<void, string>({ query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }), invalidatesTags: ['Product', 'Dashboard'] }),
  orders: build.query<{ data: Page<Order> }, { page?: number; status?: OrderStatus }>({ query: (params) => ({ url: '/orders', params }), providesTags: ['Order'] }),
  createOrder: build.mutation<{ data: Order }, { items: { productId: string; quantity: number }[] }>({ query: (body) => ({ url: '/orders', method: 'POST', body }), invalidatesTags: ['Order', 'Product', 'Dashboard'] }),
  users: build.query<{ data: Page<User> }, { page?: number; search?: string }>({ query: (params) => ({ url: '/users', params }), providesTags: ['User'] }),
  createUser: build.mutation<{ data: { user: User } }, { name: string; email: string; password: string; role: string }>({ query: (body) => ({ url: '/users', method: 'POST', body }), invalidatesTags: ['User', 'Dashboard'] }),
  updateUser: build.mutation<{ data: { user: User } }, { id: string; role?: string; isActive?: boolean }>({ query: ({ id, ...body }) => ({ url: `/users/${id}`, method: 'PATCH', body }), invalidatesTags: ['User'] }),
}) });
export const { useLoginMutation, useRegisterMutation, useRefreshMutation, useLogoutMutation, useDashboardQuery, useProductsQuery, useCreateProductMutation, useDeleteProductMutation, useOrdersQuery, useCreateOrderMutation, useUsersQuery, useCreateUserMutation, useUpdateUserMutation } = api;
