'use client';

import { useState } from 'react';
import SafeImage from './SafeImage';

export default function ImageGallery({ images, title, category }) {
  const [active, setActive] = useState(0);
  const current = images[active] || images[0];

  return (
    <div className="gallery">
      <div className="gallery-main">
        <SafeImage src={current} alt={`${title} - photo ${active + 1} of ${images.length}`} className="gallery-img" label={category} />
      </div>
      {images.length > 1 ? (
        <ul className="gallery-thumbs" aria-label="More photos">
          {images.map((src, index) => (
            <li key={src}>
              <button type="button" className={index === active ? 'is-current' : ''} onClick={() => setActive(index)} aria-label={`Show photo ${index + 1}`} aria-current={index === active}>
                <SafeImage src={src} alt="" className="thumb-img" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
