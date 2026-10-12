'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LIMITS } from '@/lib/constants';
import { apiRequest } from '@/lib/client-api';
import { safeRedirectPath } from '@/lib/utilities';
import { validateLogin, validateRegister } from '@/lib/validation';
import { useToast } from './ToastProvider';

// One form component for both /login and /register (mode = "login" | "register").
export default function AuthForm({ mode, next, initialValues = {}, focusSubmit = false }) {
  const router = useRouter();
  const toast = useToast();
  const isRegister = mode === 'register';
  const [values, setValues] = useState({ name: '', email: initialValues.email || '', password: initialValues.password || '', confirmPassword: '', role: initialValues.role || 'member', location: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const setField = (name) => (event) => setValues((current) => ({ ...current, [name]: event.target.value }));
  const props = (name) => ({
    id: `auth-${name}`,
    value: values[name],
    onChange: setField(name),
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `auth-error-${name}` : undefined,
  });
  const fieldError = (name) => (errors[name] ? <p id={`auth-error-${name}`} className="help help-error">{errors[name]}</p> : null);

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    const check = isRegister ? validateRegister(values) : validateLogin(values);
    setErrors(check.errors);
    if (Object.keys(check.errors).length) {
      document.getElementById(`auth-${Object.keys(check.errors)[0]}`)?.focus();
      return;
    }

    setBusy(true);
    const body = isRegister ? values : { email: values.email, password: values.password };
    const result = await apiRequest(isRegister ? '/api/auth/register' : '/api/auth/login', { method: 'POST', body });
    setBusy(false);

    if (!result.ok) {
      setErrors(result.fields || {});
      setFormError(result.error);
      return;
    }
    toast.success(isRegister ? `Welcome to ReWear, ${result.data.user.name.split(' ')[0]}!` : 'Welcome back!');
    router.push(safeRedirectPath(next, isRegister ? '/browse' : '/dashboard'));
    router.refresh(); // re-render the header with the logged-in state
  }

  const other = next ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <form className="form auth-card" onSubmit={submit} noValidate>
      {formError ? <p className="notice notice-error" role="alert">{formError}</p> : null}

      {isRegister ? (
        <>
          <div className="field">
            <label htmlFor="auth-name">Full name</label>
            <input {...props('name')} autoComplete="name" maxLength={LIMITS.name.max} />
            {fieldError('name')}
          </div>

          <div className="field">
            <label>Join as</label>
            <div className="role-options" role="radiogroup" aria-label="Select an account type">
              {['buyer', 'seller', 'member'].map((option) => (
                <label key={option} className={`role-option ${values.role === option ? 'is-selected' : ''}`}>
                  <input type="radio" name="role" value={option} checked={values.role === option} onChange={setField('role')} />
                  <span>{option === 'seller' ? 'Seller' : option === 'member' ? 'Member' : 'Buyer'}</span>
                </label>
              ))}
            </div>
            {fieldError('role')}
          </div>
        </>
      ) : null}

      <div className="field">
        <label htmlFor="auth-email">Email</label>
        <input {...props('email')} type="email" autoComplete="email" maxLength={LIMITS.email.max} />
        {fieldError('email')}
      </div>

      <div className="field">
        <label htmlFor="auth-password">Password</label>
        <input {...props('password')} type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} />
        {isRegister ? <p className="help">At least {LIMITS.password.min} characters, with a letter and a number.</p> : null}
        {fieldError('password')}
      </div>

      {isRegister ? (
        <>
          <div className="field">
            <label htmlFor="auth-confirmPassword">Confirm password</label>
            <input {...props('confirmPassword')} type="password" autoComplete="new-password" />
            {fieldError('confirmPassword')}
          </div>
          <div className="field">
            <label htmlFor="auth-location">Location <span className="optional">(optional)</span></label>
            <input {...props('location')} autoComplete="address-level2" maxLength={LIMITS.location.max} placeholder="e.g. Dhaka" />
            {fieldError('location')}
          </div>
        </>
      ) : null}

      <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy} autoFocus={focusSubmit}>
        {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
      </button>

      <p className="auth-switch">
        {isRegister ? (
          <>Already have an account? <Link href={`/login${other}`}>Log in</Link></>
        ) : (
          <>New to ReWear? <Link href={`/register${other}`}>Create an account</Link></>
        )}
      </p>
    </form>
  );
}
