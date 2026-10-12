'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIMITS } from '@/lib/constants';
import { apiRequest, uploadImage } from '@/lib/client-api';
import { prepareImage } from '@/lib/client-image';
import { validateProfile } from '@/lib/validation';
import Avatar from './Avatar';
import { useToast } from './ToastProvider';

export default function ProfileForm({ user }) {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState({ name: user.name, location: user.location, bio: user.bio, profileImage: user.profileImage });
  const [errors, setErrors] = useState({});
  const [photoBusy, setPhotoBusy] = useState(false);
  const [busy, setBusy] = useState(false);

  const setField = (name) => (event) => setValues((current) => ({ ...current, [name]: event.target.value }));
  const fieldError = (name) => (errors[name] ? <p id={`profile-error-${name}`} className="help help-error">{errors[name]}</p> : null);

  async function choosePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoBusy(true);
    setErrors((current) => ({ ...current, profileImage: undefined }));
    try {
      const ready = await prepareImage(file, 600);
      const result = await uploadImage(ready);
      if (!result.ok) throw new Error(result.error);
      setValues((current) => ({ ...current, profileImage: result.data.url }));
    } catch (error) {
      setErrors((current) => ({ ...current, profileImage: error.message }));
    }
    setPhotoBusy(false);
  }

  async function submit(event) {
    event.preventDefault();
    const check = validateProfile(values);
    setErrors(check.errors);
    if (Object.keys(check.errors).length) return;
    setBusy(true);
    const result = await apiRequest('/api/auth/me', { method: 'PATCH', body: check.values });
    setBusy(false);
    if (!result.ok) {
      setErrors(result.fields || {});
      toast.error(result.error);
      return;
    }
    toast.success('Your profile was updated.');
    router.refresh();
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="profile-photo-row">
        <Avatar user={{ name: values.name || user.name, profileImage: values.profileImage }} large />
        <div className="profile-photo-actions">
          <label className="btn btn-secondary btn-sm" htmlFor="profile-photo">{photoBusy ? 'Uploading…' : values.profileImage ? 'Change photo' : 'Upload photo'}</label>
          <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp,image/*" className="sr-only" onChange={choosePhoto} disabled={photoBusy} />
          {values.profileImage ? <button type="button" className="btn-link" onClick={() => setValues((current) => ({ ...current, profileImage: '' }))}>Remove photo</button> : null}
          {fieldError('profileImage')}
        </div>
      </div>

      <div className="field">
        <label htmlFor="profile-name">Full name</label>
        <input id="profile-name" value={values.name} onChange={setField('name')} maxLength={LIMITS.name.max} aria-invalid={Boolean(errors.name)} />
        {fieldError('name')}
      </div>
      <div className="field">
        <label htmlFor="profile-email">Email</label>
        <input id="profile-email" value={user.email} disabled readOnly />
        <p className="help">Your email is your login and cannot be changed here.</p>
      </div>
      <div className="field">
        <label htmlFor="profile-location">Location <span className="optional">(optional)</span></label>
        <input id="profile-location" value={values.location} onChange={setField('location')} maxLength={LIMITS.location.max} placeholder="e.g. Dhanmondi, Dhaka" />
        {fieldError('location')}
      </div>
      <div className="field">
        <label htmlFor="profile-bio">About you <span className="optional">(optional, shown on your public profile)</span></label>
        <textarea id="profile-bio" rows={3} value={values.bio} onChange={setField('bio')} maxLength={LIMITS.bio.max} />
        <p className="help">{values.bio.length}/{LIMITS.bio.max} characters</p>
        {fieldError('bio')}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy || photoBusy}>{busy ? 'Saving…' : 'Save profile'}</button>
      </div>
    </form>
  );
}
