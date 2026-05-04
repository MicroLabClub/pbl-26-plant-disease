import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/services/auth';
import type { ProblemDetails } from '@/types';
import styles from './Login.module.css';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function getPasswordChecks(v: string) {
  return {
    length:    v.length >= 8,
    uppercase: /[A-Z]/.test(v),
    lowercase: /[a-z]/.test(v),
    digit:     /[0-9]/.test(v),
  };
}

export function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  // Debounced values — validation shows 600ms after the user stops typing
  const debouncedEmail    = useDebounce(email, 600);
  const debouncedPassword = useDebounce(password, 600);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const emailOk  = isEmailValid(debouncedEmail);
  const pwChecks = getPasswordChecks(debouncedPassword);
  const pwAllOk  = Object.values(pwChecks).every(Boolean);

  const showEmailFeedback = debouncedEmail.length > 0;
  const showPwFeedback    = debouncedPassword.length > 0;

  function clearErrors() {
    setFieldErrors({});
    setFormError('');
  }

  function switchMode() {
    setMode(m => m === 'login' ? 'register' : 'login');
    setEmail('');
    setPassword('');
    clearErrors();
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
            if (key === '') setFormError(msgs[0]);
            else fields[key] = msgs[0];
          }
          setFieldErrors(fields);
        } else {
          setFormError(problem?.detail ?? problem?.title ?? t('login.authError'));
        }
      } else {
        setFormError(t('login.networkError'));
      }
    } finally {
      setLoading(false);
    }
  }

  function emailClass() {
    if (fieldErrors.email) return styles.inputError;
    if (showEmailFeedback) return emailOk ? styles.inputValid : styles.inputError;
    return '';
  }

  function passwordClass() {
    if (fieldErrors.password) return styles.inputError;
    if (showPwFeedback && mode === 'register') return pwAllOk ? styles.inputValid : styles.inputError;
    return '';
  }

  const pwReqs: { key: keyof typeof pwChecks; label: string }[] = [
    { key: 'length',    label: t('login.pwReq.length') },
    { key: 'uppercase', label: t('login.pwReq.uppercase') },
    { key: 'lowercase', label: t('login.pwReq.lowercase') },
    { key: 'digit',     label: t('login.pwReq.digit') },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <img src="/agricure.png" alt="AgriCure" className={styles.logoImg} />
          <span className={styles.logoName}>AgriCure</span>
        </div>

        <h1 className={styles.title}>
          {mode === 'login' ? t('login.welcome') : t('login.createAccount')}
        </h1>
        <p className={styles.sub}>
          {mode === 'login' ? t('login.signInSub') : t('login.registerSub')}
        </p>

        {formError && <div className={styles.formError}>{formError}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">{t('login.emailLabel')}</label>
            <div className={styles.inputWrap}>
              <input
                id="email"
                className={[styles.input, emailClass()].join(' ')}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@farm.com"
                required
              />
              {showEmailFeedback && (
                <span className={[styles.inputIcon, emailOk ? styles.iconOk : styles.iconErr].join(' ')}>
                  {emailOk ? '✓' : '✕'}
                </span>
              )}
            </div>
            {fieldErrors.email && <p className={styles.fieldErr}>{fieldErrors.email}</p>}
            {showEmailFeedback && !emailOk && !fieldErrors.email && (
              <p className={styles.fieldErr}>{t('login.emailError')}</p>
            )}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">{t('login.passwordLabel')}</label>
            <div className={styles.inputWrap}>
              <input
                id="password"
                className={[styles.input, passwordClass()].join(' ')}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                required
              />
              {mode === 'register' && showPwFeedback && (
                <span className={[styles.inputIcon, pwAllOk ? styles.iconOk : styles.iconErr].join(' ')}>
                  {pwAllOk ? '✓' : '✕'}
                </span>
              )}
            </div>
            {fieldErrors.password && <p className={styles.fieldErr}>{fieldErrors.password}</p>}
            {mode === 'register' && (
              <ul className={styles.reqList}>
                {pwReqs.map(r => {
                  const met = pwChecks[r.key];
                  return (
                    <li
                      key={r.key}
                      className={[
                        styles.reqItem,
                        showPwFeedback ? (met ? styles.reqOk : styles.reqFail) : '',
                      ].join(' ')}
                    >
                      {r.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? t('login.loading') : mode === 'login' ? t('login.signIn') : t('login.createAccount')}
          </button>
        </form>

        <p className={styles.toggle}>
          {mode === 'login' ? t('login.noAccount') : t('login.hasAccount')}{' '}
          <button type="button" className={styles.toggleBtn} onClick={switchMode}>
            {mode === 'login' ? t('login.register') : t('login.signIn')}
          </button>
        </p>
      </div>
    </div>
  );
}
