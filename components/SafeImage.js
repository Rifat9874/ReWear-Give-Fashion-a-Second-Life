'use client';

import { useState } from 'react';
import { HangerIcon } from './Icons';

// A normal <img> that swaps itself for a tidy placeholder if the link is broken.
export default function SafeImage({ src, alt, className = '', label = '' }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt}>
        <HangerIcon size={40} />
        {label ? <span>{label}</span> : null}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
    />
  );
}
