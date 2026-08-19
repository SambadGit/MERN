export type Role = 'admin' | 'manager' | 'user';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export interface User { _id: string; name: string; email: string; role: Role; isActive: boolean; createdAt?: string; }
export interface Product { _id: string; name: string; description: string; price: number; stock: number; soldCount: number; category: string; status: 'active' | 'draft' | 'archived'; image?: string; }
export interface Order { _id: string; customer: User; total: number; status: OrderStatus; createdAt: string; items: { name: string; quantity: number; price: number }[]; }
export interface Page<T> { items: T[]; pagination: { page: number; limit: number; total: number; pages: number } }
export interface Dashboard { totals: { users: number; products: number; orders: number; revenue: number }; recentOrders: Order[]; recentUsers: User[]; }
