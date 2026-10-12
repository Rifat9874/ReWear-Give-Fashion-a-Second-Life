'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CONDITIONS, LOCATION_SUGGESTIONS, SIZE_GROUPS, SORT_OPTIONS } from '@/lib/constants';
import { buildQueryString } from '@/lib/utilities';

// The filter panel. It only builds a URL; the SERVER does the actual searching.
export default function BrowseFilters({ query, hasFilters }) {
  const router = useRouter();
  const formRef = useRef(null);
  const [open, setOpen] = useState(false);

  function submit(event) {
    event?.preventDefault();
    const data = new FormData(formRef.current);
    const params = {};
    ['q', 'category', 'size', 'condition', 'location', 'minPrice', 'maxPrice', 'sort'].forEach((key) => {
      const value = String(data.get(key) || '').trim();
      if (value && !(key === 'sort' && value === 'newest')) params[key] = value;
    });
    router.push(`/browse${buildQueryString(params)}`); // page resets to 1 on every new filter
    setOpen(false);
  }

  const autoSubmit = () => formRef.current?.requestSubmit();

  return (
    <aside className="filters-wrap" aria-label="Search and filters">
      <button type="button" className="btn btn-secondary filters-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="filters-form">
        {open ? 'Hide filters' : 'Search & filters'}
      </button>

      <form id="filters-form" ref={formRef} onSubmit={submit} className={`filters ${open ? 'is-open' : ''}`}>
        <div className="field">
          <label htmlFor="f-q">Search</label>
          <input id="f-q" name="q" type="search" defaultValue={query.q} placeholder="Title, brand or description" maxLength={100} />
        </div>

        <div className="field">
          <label htmlFor="f-category">Category</label>
          <select id="f-category" name="category" defaultValue={query.category} onChange={autoSubmit}>
            <option value="">All categories</option>
            {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-size">Size</label>
          <select id="f-size" name="size" defaultValue={query.size} onChange={autoSubmit}>
            <option value="">Any size</option>
            {SIZE_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.sizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="f-condition">Condition</label>
          <select id="f-condition" name="condition" defaultValue={query.condition} onChange={autoSubmit}>
            <option value="">Any condition</option>
            {CONDITIONS.map((condition) => <option key={condition} value={condition}>{condition}</option>)}
          </select>
        </div>

        <fieldset className="field field-pair">
          <legend>Price (৳)</legend>
          <label className="sr-only" htmlFor="f-min">Minimum price</label>
          <input id="f-min" name="minPrice" type="number" inputMode="numeric" min="0" step="1" defaultValue={query.minPrice ?? ''} placeholder="Min" />
          <span aria-hidden="true">to</span>
          <label className="sr-only" htmlFor="f-max">Maximum price</label>
          <input id="f-max" name="maxPrice" type="number" inputMode="numeric" min="0" step="1" defaultValue={query.maxPrice ?? ''} placeholder="Max" />
        </fieldset>

        <div className="field">
          <label htmlFor="f-location">Location</label>
          <input id="f-location" name="location" list="location-options" defaultValue={query.location} placeholder="e.g. Dhaka" maxLength={80} />
          <datalist id="location-options">
            {LOCATION_SUGGESTIONS.map((place) => <option key={place} value={place} />)}
          </datalist>
        </div>

        <div className="field">
          <label htmlFor="f-sort">Sort by</label>
          <select id="f-sort" name="sort" defaultValue={query.sort} onChange={autoSubmit}>
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="filter-actions">
          <button type="submit" className="btn btn-primary">Apply filters</button>
          {hasFilters ? <Link href="/browse" className="btn btn-secondary" onClick={() => setOpen(false)}>Clear all filters</Link> : null}
        </div>
      </form>
    </aside>
  );
}
