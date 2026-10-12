'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LIMITS } from '@/lib/constants';
import { apiRequest } from '@/lib/client-api';
import { validateInquiry } from '@/lib/validation';
import { useToast } from './ToastProvider';

// mode: 'guest' | 'owner' | 'unavailable' | 'ok'
export default function ContactSeller({ itemId, itemTitle, mode, nextPath }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(`Hi! Is the ${itemTitle} still available?`);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (mode === 'owner') {
    return <p className="notice notice-info">This is your listing, so you cannot send yourself an inquiry. Manage it from your dashboard.</p>;
  }
  if (mode === 'unavailable') {
    return <p className="notice notice-info">This item is not available for new inquiries right now.</p>;
  }
  if (mode === 'guest') {
    return (
      <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="btn btn-primary btn-block">
        Log in to contact seller
      </Link>
    );
  }
  if (sent) {
    return (
      <div className="notice notice-success" role="status">
        <strong>Message sent.</strong>
        <p>
          The seller will see it in their dashboard. You can follow the reply in <Link href="/dashboard">your dashboard</Link>.
        </p>
      </div>
    );
  }

  async function submit(event) {
    event.preventDefault();
    const { values, errors } = validateInquiry({ itemId, message });
    if (errors.message) return setError(errors.message);
    setBusy(true);
    setError('');
    const result = await apiRequest('/api/inquiries', { method: 'POST', body: values });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }
    setSent(true);
    toast.success('Your message was sent to the seller.');
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-primary btn-block" onClick={() => setOpen(true)}>
        Contact seller
      </button>
    );
  }

  return (
    <form className="inquiry-form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="inquiry-message">Message to the seller</label>
        <textarea id="inquiry-message" rows={4} value={message} onChange={(event) => setMessage(event.target.value)} maxLength={LIMITS.message.max} aria-invalid={Boolean(error)} aria-describedby="inquiry-help" />
        <p id="inquiry-help" className={`help ${error ? 'help-error' : ''}`}>
          {error || `${message.length}/${LIMITS.message.max} characters. Your email is only shared if the seller accepts.`}
        </p>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
