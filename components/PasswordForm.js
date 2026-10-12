'use client';

import { useState } from 'react';
import { apiRequest } from '@/lib/client-api';
import { validatePasswordChange } from '@/lib/validation';
import { useToast } from './ToastProvider';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function PasswordForm() {
  const toast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const setField = (name) => (event) => setValues((current) => ({ ...current, [name]: event.target.value }));
  const fieldError = (name) => (errors[name] ? <p className="help help-error">{errors[name]}</p> : null);

  async function submit(event) {
    event.preventDefault();
    const check = validatePasswordChange(values);
    setErrors(check.errors);
    if (Object.keys(check.errors).length) return;
    setBusy(true);
    const result = await apiRequest('/api/auth/password', { method: 'POST', body: values });
    setBusy(false);
    if (!result.ok) {
      setErrors(result.fields || {});
      toast.error(result.error);
      return;
    }
    setValues(EMPTY);
    toast.success('Your password was changed.');
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="pw-current">Current password</label>
        <input id="pw-current" type="password" autoComplete="current-password" value={values.currentPassword} onChange={setField('currentPassword')} aria-invalid={Boolean(errors.currentPassword)} />
        {fieldError('currentPassword')}
      </div>
      <div className="field">
        <label htmlFor="pw-new">New password</label>
        <input id="pw-new" type="password" autoComplete="new-password" value={values.newPassword} onChange={setField('newPassword')} aria-invalid={Boolean(errors.newPassword)} />
        <p className="help">At least 8 characters, with a letter and a number.</p>
        {fieldError('newPassword')}
      </div>
      <div className="field">
        <label htmlFor="pw-confirm">Confirm new password</label>
        <input id="pw-confirm" type="password" autoComplete="new-password" value={values.confirmPassword} onChange={setField('confirmPassword')} aria-invalid={Boolean(errors.confirmPassword)} />
        {fieldError('confirmPassword')}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
      </div>
    </form>
  );
}
