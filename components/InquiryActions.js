'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/client-api';
import { useToast } from './ToastProvider';

// Buttons that change an inquiry's status. Who sees which button is decided here for
// convenience, but the SERVER enforces the real rules (see /api/inquiries/[id]).
export default function InquiryActions({ inquiry }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function setStatus(status) {
    setBusy(true);
    const result = await apiRequest(`/api/inquiries/${inquiry.id}`, { method: 'PATCH', body: { status } });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Inquiry ${status.toLowerCase()}.`);
    router.refresh();
  }

  if (inquiry.role === 'received') {
    if (inquiry.status === 'Pending') {
      return (
        <div className="row-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus('Accepted')} disabled={busy}>Accept</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus('Declined')} disabled={busy}>Decline</button>
        </div>
      );
    }
    if (inquiry.status === 'Accepted') {
      return (
        <div className="row-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus('Closed')} disabled={busy}>Mark as closed</button>
        </div>
      );
    }
    return null;
  }

  if (inquiry.status === 'Pending' || inquiry.status === 'Accepted') {
    return (
      <div className="row-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus('Closed')} disabled={busy}>
          {inquiry.status === 'Pending' ? 'Withdraw' : 'Close'}
        </button>
      </div>
    );
  }
  return null;
}
