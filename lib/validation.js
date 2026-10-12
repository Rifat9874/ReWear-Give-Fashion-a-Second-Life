// Pure validation helpers (no imports from Next.js or Mongoose).
// The SAME functions run in the browser (for instant feedback) and on the server
// (the real protection). Each validator returns { values, errors }:
//   values - cleaned data built ONLY from whitelisted fields (prevents mass assignment)
//   errors - { fieldName: 'message' }; empty object means the input is valid

import {
  CATEGORIES,
  CONDITIONS,
  INQUIRY_STATUSES,
  ITEM_STATUSES,
  LIMITS,
  PAGE_SIZE,
  REPORT_REASONS,
  SIZES,
  SORT_OPTIONS,
} from './constants.js';
import { isInternalImageUrl } from './image-utils.js';

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidObjectId(value) {
  return typeof value === 'string' && OBJECT_ID_PATTERN.test(value);
}

// Trim text, remove control characters, and optionally keep line breaks.
export function cleanText(value, { multiline = false } = {}) {
  if (typeof value !== 'string') return '';
  let text = value.replace(/\r\n/g, '\n');
  text = multiline
    ? text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    : text.replace(/[\u0000-\u001F\u007F]/g, ' ');
  return text.trim();
}

export function normalizeEmail(value) {
  return cleanText(value).toLowerCase();
}

export function isValidEmail(value) {
  return value.length <= LIMITS.email.max && EMAIL_PATTERN.test(value);
}

// Returns an error message, or null when the URL is acceptable.
export function validateImageUrl(raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return 'Image link cannot be empty.';
  if (isInternalImageUrl(value)) return null; // a photo uploaded to ReWear itself
  if (value.length > LIMITS.imageUrl.max) return `Image link must be ${LIMITS.imageUrl.max} characters or fewer.`;

  let url;
  try {
    url = new URL(value);
  } catch {
    return 'Enter a full link that starts with https://';
  }
  if (url.protocol !== 'https:') return 'Image links must start with https://';
  if (url.username || url.password) return 'Image links cannot contain a username or password.';

  const host = url.hostname.toLowerCase();
  const looksLocal =
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    !host.includes('.') ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host);
  if (looksLocal) return 'Use a public image link, not a local or private address.';
  return null;
}

function checkLength(errors, field, label, value, { min = 0, max }) {
  if (min && value.length < min) {
    errors[field] = value.length === 0 ? `${label} is required.` : `${label} must be at least ${min} characters.`;
  } else if (value.length > max) {
    errors[field] = `${label} must be ${max} characters or fewer.`;
  }
}

function passwordProblem(password) {
  if (password.length < LIMITS.password.min) return `Password must be at least ${LIMITS.password.min} characters.`;
  if (new TextEncoder().encode(password).length > LIMITS.password.max) {
    return `Password must be ${LIMITS.password.max} bytes or fewer.`;
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return 'Password must include at least one letter and one number.';
  return null;
}

export function validateRegister(input = {}) {
  const errors = {};
  const rawRole = typeof input.role === 'string' ? input.role.trim().toLowerCase() : 'member';
  const role = ['buyer', 'seller', 'member'].includes(rawRole) ? rawRole : 'member';
  const values = {
    name: cleanText(input.name),
    email: normalizeEmail(input.email),
    password: typeof input.password === 'string' ? input.password : '',
    role,
    location: cleanText(input.location),
  };
  const confirmPassword = typeof input.confirmPassword === 'string' ? input.confirmPassword : '';

  checkLength(errors, 'name', 'Full name', values.name, LIMITS.name);
  if (!values.email) errors.email = 'Email is required.';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';

  if (typeof input.role === 'string' && !['buyer', 'seller', 'member'].includes(input.role.trim().toLowerCase())) {
    errors.role = 'Choose a valid account type.';
  }

  if (!values.password) errors.password = 'Password is required.';
  else {
    const problem = passwordProblem(values.password);
    if (problem) errors.password = problem;
  }
  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
  else if (values.password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

  if (values.location.length > LIMITS.location.max) errors.location = `Location must be ${LIMITS.location.max} characters or fewer.`;
  return { values, errors };
}

export function validateLogin(input = {}) {
  const errors = {};
  const values = {
    email: normalizeEmail(input.email),
    password: typeof input.password === 'string' ? input.password : '',
  };
  if (!values.email) errors.email = 'Email is required.';
  else if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Password is required.';
  return { values, errors };
}

export function validateProfile(input = {}) {
  const errors = {};
  const values = {
    name: cleanText(input.name),
    location: cleanText(input.location),
    bio: cleanText(input.bio, { multiline: true }),
    profileImage: typeof input.profileImage === 'string' ? input.profileImage.trim() : '',
  };
  checkLength(errors, 'name', 'Full name', values.name, LIMITS.name);
  if (values.location.length > LIMITS.location.max) errors.location = `Location must be ${LIMITS.location.max} characters or fewer.`;
  if (values.bio.length > LIMITS.bio.max) errors.bio = `Bio must be ${LIMITS.bio.max} characters or fewer.`;
  if (values.profileImage) {
    const problem = validateImageUrl(values.profileImage);
    if (problem) errors.profileImage = problem;
  }
  return { values, errors };
}

export function validatePasswordChange(input = {}) {
  const errors = {};
  const current = typeof input.currentPassword === 'string' ? input.currentPassword : '';
  const next = typeof input.newPassword === 'string' ? input.newPassword : '';
  const confirm = typeof input.confirmPassword === 'string' ? input.confirmPassword : '';
  if (!current) errors.currentPassword = 'Enter your current password.';
  const problem = next ? passwordProblem(next) : 'Enter a new password.';
  if (problem) errors.newPassword = problem;
  else if (next === current) errors.newPassword = 'Choose a password different from the current one.';
  if (!confirm) errors.confirmPassword = 'Please confirm your new password.';
  else if (next !== confirm) errors.confirmPassword = 'Passwords do not match.';
  return { values: { currentPassword: current, newPassword: next }, errors };
}

export function validateItem(input = {}) {
  const errors = {};
  const values = {
    title: cleanText(input.title),
    description: cleanText(input.description, { multiline: true }),
    category: cleanText(input.category),
    size: cleanText(input.size),
    condition: cleanText(input.condition),
    brand: cleanText(input.brand),
    color: cleanText(input.color),
    measurements: cleanText(input.measurements),
    location: cleanText(input.location),
    price: null,
    images: [],
  };

  checkLength(errors, 'title', 'Title', values.title, LIMITS.title);
  checkLength(errors, 'description', 'Description', values.description, LIMITS.description);
  checkLength(errors, 'location', 'Location', values.location, { min: 2, max: LIMITS.location.max });
  checkLength(errors, 'brand', 'Brand', values.brand, LIMITS.brand);
  checkLength(errors, 'color', 'Color', values.color, LIMITS.color);
  checkLength(errors, 'measurements', 'Measurements', values.measurements, LIMITS.measurements);

  if (!CATEGORIES.includes(values.category)) errors.category = 'Choose a category.';
  if (!SIZES.includes(values.size)) errors.size = 'Choose a size.';
  if (!CONDITIONS.includes(values.condition)) errors.condition = 'Choose a condition.';

  const rawPrice = typeof input.price === 'string' ? input.price.trim() : input.price;
  if (rawPrice === '' || rawPrice === null || rawPrice === undefined) {
    errors.price = 'Price is required.';
  } else {
    const price = Number(rawPrice);
    if (!Number.isFinite(price) || !Number.isInteger(price)) errors.price = 'Enter the price as a whole number of taka.';
    else if (price < LIMITS.price.min || price > LIMITS.price.max) {
      errors.price = `Price must be between ৳${LIMITS.price.min} and ৳${LIMITS.price.max.toLocaleString('en-US')}.`;
    } else values.price = price;
  }

  const rawImages = Array.isArray(input.images) ? input.images : [];
  const images = rawImages.map((url) => (typeof url === 'string' ? url.trim() : '')).filter(Boolean);
  if (images.length === 0) errors.images = 'Add at least one photo.';
  else if (images.length > LIMITS.maxImages) errors.images = `You can add up to ${LIMITS.maxImages} images.`;
  else {
    const problems = [];
    images.forEach((url, index) => {
      const problem = validateImageUrl(url);
      if (problem) problems.push(`Image ${index + 1}: ${problem}`);
    });
    if (problems.length) errors.images = problems[0];
    else values.images = [...new Set(images)];
  }
  return { values, errors };
}

export function validateStatus(input = {}, allowed = ITEM_STATUSES) {
  const status = cleanText(input.status);
  if (!allowed.includes(status)) return { values: {}, errors: { status: `Status must be one of: ${allowed.join(', ')}.` } };
  return { values: { status }, errors: {} };
}

export function validateInquiry(input = {}) {
  const errors = {};
  const values = { itemId: typeof input.itemId === 'string' ? input.itemId : '', message: cleanText(input.message, { multiline: true }) };
  if (!isValidObjectId(values.itemId)) errors.itemId = 'This listing could not be found.';
  checkLength(errors, 'message', 'Message', values.message, LIMITS.message);
  return { values, errors };
}

export function validateInquiryStatus(input = {}) {
  return validateStatus(input, INQUIRY_STATUSES.filter((status) => status !== 'Pending'));
}

export function validateReport(input = {}) {
  const errors = {};
  const values = {
    itemId: typeof input.itemId === 'string' ? input.itemId : '',
    reason: cleanText(input.reason),
    details: cleanText(input.details, { multiline: true }),
  };
  if (!isValidObjectId(values.itemId)) errors.itemId = 'This listing could not be found.';
  if (!REPORT_REASONS.includes(values.reason)) errors.reason = 'Choose a reason for your report.';
  if (values.details.length > LIMITS.reportDetails.max) errors.details = `Details must be ${LIMITS.reportDetails.max} characters or fewer.`;
  return { values, errors };
}

function readParam(source, key) {
  if (!source) return '';
  const value = typeof source.get === 'function' ? source.get(key) : Array.isArray(source[key]) ? source[key][0] : source[key];
  return typeof value === 'string' ? value : '';
}

function toWholeNumber(text) {
  if (!/^\d{1,9}$/.test(text.trim())) return null;
  return Number(text);
}

// Turns raw URL search params into safe, typed filters. Bad values are ignored
// instead of causing errors, so a hand-edited URL never breaks the page.
export function parseBrowseQuery(source) {
  const q = cleanText(readParam(source, 'q')).slice(0, LIMITS.search.max);
  const category = readParam(source, 'category');
  const size = readParam(source, 'size');
  const condition = readParam(source, 'condition');
  const sort = readParam(source, 'sort');
  let minPrice = toWholeNumber(readParam(source, 'minPrice'));
  let maxPrice = toWholeNumber(readParam(source, 'maxPrice'));
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
  const page = Math.min(Math.max(parseInt(readParam(source, 'page'), 10) || 1, 1), 10000);

  return {
    q,
    category: CATEGORIES.includes(category) ? category : '',
    size: SIZES.includes(size) ? size : '',
    condition: CONDITIONS.includes(condition) ? condition : '',
    location: cleanText(readParam(source, 'location')).slice(0, LIMITS.location.max),
    minPrice,
    maxPrice,
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : 'newest',
    page,
    limit: PAGE_SIZE,
  };
}
