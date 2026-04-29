import { useState, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/auth';
import type { ProblemDetails } from '@/types';
import styles from './Login.module.css';

export function LoginPage() {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  function clearErrors() {
    setFieldErrors({});
    setFormError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearErrors();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        const problem = err.data as ProblemDetails | null;
        if (err.status === 400 && problem?.errors) {
          const fields: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(problem.errors)) {
            if (key === '') {
              setFormError(msgs[0]);
            } else {
              fields[key] = msgs[0];
            }
          }
          setFieldErrors(fields);
        } else {
          setFormError(
            problem?.detail ?? problem?.title ?? 'Authentication failed. Please try again.'
          );
        }
      } else {
        setFormError('Unable to connect. Check your network and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 20 20" fill="none" width={18} height={18}>
              <path
                d="M10 2C7 2 5 5 5 8c0 2.5 1.5 4.5 4 5.5V11c0-2 1-3.5 3-4.5C11.5 4 10.5 2 10 2z"
                fill="white"
              />
              <path
                d="M12 6.5C11 8 10.5 9.5 10.5 11v3.8c2-.5 3.5-2.5 3.5-5 0-1.5-.7-2.5-2-3.3z"
                fill="rgba(255,255,255,0.55)"
              />
            </svg>
          </div>
          <span className={styles.logoName}>AgriCure</span>
        </div>

        <h1 className={styles.title}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className={styles.sub}>
          {mode === 'login'
            ? 'Sign in to the disease detection dashboard'
            : 'Start monitoring your crops with AI'}
        </p>

        {formError && <div className={styles.formError}>{formError}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={[styles.input, fieldErrors.email ? styles.inputError : ''].join(' ')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@farm.com"
              required
            />
            {fieldErrors.email && (
              <p className={styles.fieldErr}>{fieldErrors.email}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={[styles.input, fieldErrors.password ? styles.inputError : ''].join(' ')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              required
            />
            {fieldErrors.password ? (
              <p className={styles.fieldErr}>{fieldErrors.password}</p>
            ) : (
              mode === 'register' && (
                <p className={styles.hint}>
                  Min. 8 chars · uppercase · lowercase · digit
                </p>
              )
            )}
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading
              ? 'Please wait…'
              : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
          </button>
        </form>

        <p className={styles.toggle}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => {
              setMode((m) => (m === 'login' ? 'register' : 'login'));
              clearErrors();
            }}
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}