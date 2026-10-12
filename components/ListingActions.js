'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ITEM_STATUSES } from '@/lib/constants';
import { apiRequest } from '@/lib/client-api';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from './ToastProvider';

// Edit / change status / delete buttons for ONE of the user's own listings.
export default function ListingActions({ item }) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function changeStatus(event) {
    const status = event.target.value;
    setBusy(true);
    const result = await apiRequest(`/api/items/${item.id}/status`, { method: 'PATCH', body: { status } });
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error);
      event.target.value = item.status;
      return;
    }
    toast.success(`Marked as ${status.toLowerCase()}.`);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    const result = await apiRequest(`/api/items/${item.id}`, { method: 'DELETE' });
    setBusy(false);
    setConfirming(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success('Listing deleted.');
    router.refresh();
  }

  return (
    <div className="row-actions">
      <label className="sr-only" htmlFor={`status-${item.id}`}>Status of {item.title}</label>
      <select id={`status-${item.id}`} defaultValue={item.status} onChange={changeStatus} disabled={busy} className="select-sm">
        {ITEM_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
      <Link href={`/items/${item.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
      <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setConfirming(true)} disabled={busy}>Delete</button>
      <ConfirmDialog
        open={confirming}
        title="Delete this listing?"
        message={`“${item.title}” will be removed permanently, along with any saved favorites. This cannot be undone.`}
        confirmLabel="Delete listing"
        danger
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
