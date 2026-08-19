import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../services/api';
import { useAppDispatch } from '../hooks';
import { setSession } from '../features/auth/authSlice';

const schema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(8, 'Use at least 8 characters') });
type FormData = z.infer<typeof schema>;
export function LoginPage() { const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) }); const [login, state] = useLoginMutation(); const dispatch = useAppDispatch(); const navigate = useNavigate();
  const submit = async (values: FormData) => { try { const result = await login(values).unwrap(); dispatch(setSession({ accessToken: result.data.accessToken, user: result.data.user })); navigate('/'); } catch (_error) { /* The API error is represented below using the mutation state. */ } };
  return <div className="auth-layout"><section className="auth-art"><span className="brand-mark">C</span><h1>Run commerce<br /><em>with clarity.</em></h1><p>A focused command center for teams that care about every order, customer, and decision.</p></section><section className="auth-panel"><span className="eyebrow">Welcome back</span><h2>Sign in to your workspace</h2><form onSubmit={handleSubmit(submit)} noValidate><label>Email<input type="email" {...register('email')} autoComplete="email" /></label>{errors.email && <small className="field-error">{errors.email.message}</small>}<label>Password<input type="password" {...register('password')} autoComplete="current-password" /></label>{errors.password && <small className="field-error">{errors.password.message}</small>}{state.isError && <p className="error-box">Unable to sign in. Check your credentials and try again.</p>}<button disabled={state.isLoading}>{state.isLoading ? 'Signing in...' : 'Sign in'}</button></form><p className="muted">New here? <Link to="/register">Create an account</Link></p></section></div>;
}
