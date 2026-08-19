import { useState } from 'react';
import { useCreateUserMutation, useUpdateUserMutation, useUsersQuery } from '../services/api';
import type { Role } from '../types';

const initialForm = { name: '', email: '', password: '', role: 'user' };

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const { data, isLoading, isError } = useUsersQuery({ search: search || undefined });
  const [create, createState] = useCreateUserMutation();
  const [update] = useUpdateUserMutation();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await create(form).unwrap();
      setForm(initialForm);
    } catch (_error) {
      // The mutation state below displays a safe, user-friendly error.
    }
  };

  if (isLoading) return <div className="state">Loading users...</div>;
  if (isError || !data) return <div className="state error-box">Users could not be loaded.</div>;

  return <section className="page">
    <div className="page-heading"><div><span className="eyebrow">Access control</span><h2>Users</h2></div><input className="search" placeholder="Search users" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search users" /></div>
    <div className="content-grid users-layout">
      <div className="panel"><div className="panel-heading"><h3>Team members</h3><span className="muted">{data.data.pagination.total} users</span></div><div className="table-wrap"><table><thead><tr><th>Person</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead><tbody>{data.data.items.map((user) => <tr key={user._id}><td><strong>{user.name}</strong><small>{user.email}</small></td><td><select value={user.role} onChange={(event) => update({ id: user._id, role: event.target.value as Role })} aria-label={`Role for ${user.name}`}><option value="admin">Admin</option><option value="manager">Manager</option><option value="user">User</option></select></td><td><button className="status-toggle" onClick={() => update({ id: user._id, isActive: !user.isActive })}>{user.isActive ? 'Active' : 'Inactive'}</button></td><td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td></tr>)}</tbody></table></div></div>
      <div className="panel form-panel"><span className="eyebrow">New account</span><h3>Add user</h3><form onSubmit={submit}><label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Temporary password<input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="user">User</option><option value="manager">Manager</option><option value="admin">Admin</option></select></label>{createState.isError && <p className="error-box" role="alert">User could not be created. Check the email or try another one.</p>}<button disabled={createState.isLoading}>{createState.isLoading ? 'Creating user...' : 'Create user'}</button></form></div>
    </div>
  </section>;
}
