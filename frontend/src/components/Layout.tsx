import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { clearSession } from '../features/auth/authSlice';
import { useLogoutMutation } from '../services/api';

export function Layout() {
  const user = useAppSelector((state) => state.auth.user); const dispatch = useAppDispatch(); const navigate = useNavigate(); const [logout] = useLogoutMutation();
  const signOut = async () => { await logout(); dispatch(clearSession()); navigate('/login'); };
  return <div className="shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">C</span><span>CommerceOS</span></div><p className="eyebrow">Workspace</p><nav aria-label="Primary navigation"><NavLink to="/" end>Overview</NavLink>{user?.role !== 'user' && <><NavLink to="/products">Products</NavLink><NavLink to="/products/new">Add product</NavLink></>}<NavLink to="/orders">Orders</NavLink>{user?.role === 'admin' && <NavLink to="/users">Users</NavLink>}</nav><div className="sidebar-footer"><small>Signed in as</small><strong>{user?.name}</strong><button className="link-button" onClick={signOut}>Sign out</button></div></aside><main className="main"><header className="topbar"><div><span className="eyebrow">Operations console</span><h1>Good morning, {user?.name?.split(' ')[0]}</h1></div><div className="avatar" aria-label={`Signed in as ${user?.name}`}>{user?.name?.slice(0, 1)}</div></header><Outlet /></main></div>;
}
