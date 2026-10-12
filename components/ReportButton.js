'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIMITS, REPORT_REASONS } from '@/lib/constants';
import { apiRequest } from '@/lib/client-api';
import { validateReport } from '@/lib/validation';
import { useToast } from './ToastProvider';

export default function ReportButton({ itemId, isLoggedIn }) {
  const router = useRouter();
  const toast = useToast();
  const dialogRef = useRef(null);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  function openDialog() {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    dialogRef.current?.showModal();
  }

  async function submit(event) {
    event.preventDefault();
    const { values, errors: found } = validateReport({ itemId, reason, details });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    const result = await apiRequest('/api/reports', { method: 'POST', body: values });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      if (result.status === 409) dialogRef.current?.close();
      return;
    }
    toast.success('Thanks. Your report was sent to our moderators.');
    setReason('');
    setDetails('');
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" className="btn-link" onClick={openDialog}>Report this listing</button>
      <dialog ref={dialogRef} className="dialog" aria-labelledby="report-title">
        <form onSubmit={submit} noValidate>
          <h2 id="report-title">Report this listing</h2>
          <p>Tell us what looks wrong. A moderator will review it.</p>
          <div className="field">
            <label htmlFor="report-reason">Reason</label>
            <select id="report-reason" value={reason} onChange={(event) => setReason(event.target.value)} aria-invalid={Boolean(errors.reason)}>
              <option value="">Choose a reason</option>
              {REPORT_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {errors.reason ? <p className="help help-error">{errors.reason}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="report-details">More details (optional)</label>
            <textarea id="report-details" rows={3} value={details} onChange={(event) => setDetails(event.target.value)} maxLength={LIMITS.reportDetails.max} />
            {errors.details ? <p className="help help-error">{errors.details}</p> : null}
          </div>
          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={() => dialogRef.current?.close()} disabled={busy}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send report'}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
