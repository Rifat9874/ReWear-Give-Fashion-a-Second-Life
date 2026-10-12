'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CONDITIONS, LIMITS, LOCATION_SUGGESTIONS, SIZE_GROUPS } from '@/lib/constants';
import { apiRequest, uploadImage } from '@/lib/client-api';
import { prepareImage } from '@/lib/client-image';
import { isInternalImageUrl } from '@/lib/image-utils';
import { validateImageUrl, validateItem } from '@/lib/validation';
import SafeImage from './SafeImage';
import { useToast } from './ToastProvider';

const EMPTY = {
  title: '', category: '', description: '', price: '', size: '', brand: '', color: '',
  condition: '', location: '', measurements: '',
};

// Used for both "create listing" (/sell) and "edit listing" (/items/[id]/edit).
export default function ItemForm({ item = null, defaultLocation = '' }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(item);

  const [values, setValues] = useState(() =>
    item
      ? { ...EMPTY, ...item, price: String(item.price) }
      : { ...EMPTY, location: defaultLocation }
  );
  const [images, setImages] = useState(item?.images || []);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [linkValue, setLinkValue] = useState('');
  const [linkError, setLinkError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const setField = (name) => (event) => setValues((current) => ({ ...current, [name]: event.target.value }));
  const fieldProps = (name) => ({
    id: `field-${name}`,
    value: values[name],
    onChange: setField(name),
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `error-${name}` : undefined,
  });
  const fieldError = (name) => (errors[name] ? <p id={`error-${name}`} className="help help-error">{errors[name]}</p> : null);

  async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setUploadError('');
    const room = LIMITS.maxImages - images.length;
    if (room <= 0) return setUploadError(`You can add up to ${LIMITS.maxImages} photos.`);
    const chosen = files.slice(0, room);
    if (files.length > room) setUploadError(`Only the first ${room} photo${room === 1 ? ' was' : 's were'} added (maximum ${LIMITS.maxImages}).`);

    setUploading((count) => count + chosen.length);
    for (const file of chosen) {
      try {
        const ready = await prepareImage(file); // shrink in the browser first
        const result = await uploadImage(ready);
        if (!result.ok) throw new Error(result.error);
        setImages((current) => (current.length < LIMITS.maxImages ? [...current, result.data.url] : current));
        setErrors((current) => ({ ...current, images: undefined }));
      } catch (error) {
        setUploadError(error.message);
      } finally {
        setUploading((count) => count - 1);
      }
    }
  }

  function removeImage(index) {
    const url = images[index];
    setImages((current) => current.filter((_, i) => i !== index));
    // Free the database space right away (the server refuses if a live listing still uses it).
    if (isInternalImageUrl(url)) apiRequest(`/api/images/${url.split('/').pop()}`, { method: 'DELETE' });
  }

  function makeCover(index) {
    setImages((current) => [current[index], ...current.filter((_, i) => i !== index)]);
  }

  function addLink() {
    const url = linkValue.trim();
    const problem = validateImageUrl(url);
    if (problem) return setLinkError(problem);
    if (images.includes(url)) return setLinkError('That photo is already added.');
    if (images.length >= LIMITS.maxImages) return setLinkError(`You can add up to ${LIMITS.maxImages} photos.`);
    setImages((current) => [...current, url]);
    setLinkValue('');
    setLinkError('');
    setErrors((current) => ({ ...current, images: undefined }));
  }

  async function submit(event) {
    event.preventDefault();
    if (uploading > 0) {
      toast.error('Please wait until your photos finish uploading.');
      return;
    }
    const { values: clean, errors: found } = validateItem({ ...values, images });
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields.');
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setBusy(true);
    const result = await apiRequest(isEdit ? `/api/items/${item.id}` : '/api/items', {
      method: isEdit ? 'PATCH' : 'POST',
      body: clean,
    });
    setBusy(false);

    if (!result.ok) {
      setErrors(result.fields || {});
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? 'Listing updated.' : 'Your listing is live.');
    router.push(`/items/${result.data.item.id}`);
    router.refresh();
  }

  return (
    <form className="form form-wide" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="field-title">Title</label>
        <input {...fieldProps('title')} maxLength={LIMITS.title.max} placeholder="e.g. Levi's 511 slim jeans" />
        {fieldError('title')}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="field-category">Category</label>
          <select {...fieldProps('category')}>
            <option value="">Choose a category</option>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          {fieldError('category')}
        </div>
        <div className="field">
          <label htmlFor="field-price">Price (৳ BDT)</label>
          <input {...fieldProps('price')} type="number" inputMode="numeric" min="1" step="1" placeholder="e.g. 1200" />
          {fieldError('price')}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="field-size">Size</label>
          <select {...fieldProps('size')}>
            <option value="">Choose a size</option>
            {SIZE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.sizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </optgroup>
            ))}
          </select>
          {fieldError('size')}
        </div>
        <div className="field">
          <label htmlFor="field-condition">Condition</label>
          <select {...fieldProps('condition')}>
            <option value="">Choose a condition</option>
            {CONDITIONS.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
          </select>
          {fieldError('condition')}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="field-brand">Brand <span className="optional">(optional)</span></label>
          <input {...fieldProps('brand')} maxLength={LIMITS.brand.max} />
          {fieldError('brand')}
        </div>
        <div className="field">
          <label htmlFor="field-color">Color <span className="optional">(optional)</span></label>
          <input {...fieldProps('color')} maxLength={LIMITS.color.max} />
          {fieldError('color')}
        </div>
      </div>

      <div className="field">
        <label htmlFor="field-description">Description</label>
        <textarea {...fieldProps('description')} rows={5} maxLength={LIMITS.description.max} placeholder="Describe the fit, fabric, any flaws and why you are selling it." />
        <p className="help">{values.description.length}/{LIMITS.description.max} characters</p>
        {fieldError('description')}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="field-location">Location</label>
          <input {...fieldProps('location')} list="sell-locations" maxLength={LIMITS.location.max} placeholder="e.g. Dhanmondi, Dhaka" />
          <datalist id="sell-locations">
            {LOCATION_SUGGESTIONS.map((place) => <option key={place} value={place} />)}
          </datalist>
          <p className="help">Use a general area, not your home address.</p>
          {fieldError('location')}
        </div>
        <div className="field">
          <label htmlFor="field-measurements">Measurements <span className="optional">(optional)</span></label>
          <input {...fieldProps('measurements')} maxLength={LIMITS.measurements.max} placeholder="e.g. Chest 38 in, length 27 in" />
          {fieldError('measurements')}
        </div>
      </div>

      <fieldset className="field image-fieldset">
        <legend>Photos</legend>
        <p className="help">
          Upload up to {LIMITS.maxImages} photos from your phone or computer. The first photo is the cover. Clear, well-lit photos of the
          front, the back and any flaws help your item sell.
        </p>

        {images.length > 0 ? (
          <ul className="photo-grid">
            {images.map((url, index) => (
              <li key={url} className="photo-tile">
                <SafeImage src={url} alt={`Photo ${index + 1}`} label="Preview failed" />
                {index === 0 ? <span className="photo-cover">Cover</span> : null}
                <div className="photo-actions">
                  {index > 0 ? <button type="button" onClick={() => makeCover(index)}>Make cover</button> : null}
                  <button type="button" onClick={() => removeImage(index)} aria-label={`Remove photo ${index + 1}`}>Remove</button>
                </div>
              </li>
            ))}
            {Array.from({ length: uploading }, (_, i) => (
              <li key={`loading-${i}`} className="photo-tile photo-loading" aria-label="Uploading photo"><span>Uploading…</span></li>
            ))}
          </ul>
        ) : null}

        {images.length + uploading < LIMITS.maxImages ? (
          <label
            htmlFor="photo-input"
            className={`dropzone ${dragging ? 'is-dragging' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
          >
            <strong>{images.length === 0 ? 'Add photos' : 'Add more photos'}</strong>
            <span>Tap to choose, or drag and drop. JPG, PNG or WebP.</span>
          </label>
        ) : null}
        <input
          id="photo-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          multiple
          className="sr-only"
          onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }}
        />

        {uploadError ? <p className="help help-error" role="alert">{uploadError}</p> : null}
        {errors.images ? <p className="help help-error" id="error-images">{errors.images}</p> : null}

        <details className="help-details">
          <summary>Or use a photo link instead</summary>
          <div className="link-add">
            <label className="sr-only" htmlFor="photo-link">Photo link</label>
            <input id="photo-link" type="url" inputMode="url" value={linkValue} placeholder="https://example.com/photo.jpg" maxLength={LIMITS.imageUrl.max} onChange={(event) => { setLinkValue(event.target.value); setLinkError(''); }} />
            <button type="button" className="btn btn-secondary btn-sm" onClick={addLink}>Add link</button>
          </div>
          {linkError ? <p className="help help-error">{linkError}</p> : null}
        </details>
      </fieldset>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy || uploading > 0}>
          {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Publish listing'}
        </button>
        <button type="button" className="btn btn-secondary btn-lg" onClick={() => router.back()} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
