// Shared constants. This file has no imports, so it is safe to use on both the
// server and in the browser, and easy to unit test.

export const CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Dresses',
  'Jackets',
  'Sneakers',
  'Bags',
  'Traditional Wear',
];

export const CONDITIONS = ['Like New', 'Excellent', 'Good', 'Fair'];
export const ITEM_STATUSES = ['Available', 'Reserved', 'Sold'];
export const INQUIRY_STATUSES = ['Pending', 'Accepted', 'Declined', 'Closed'];
export const REPORT_STATUSES = ['Open', 'Dismissed', 'Actioned'];

export const REPORT_REASONS = [
  'Misleading or inaccurate listing',
  'Suspicious or possible scam',
  'Inappropriate content',
  'Counterfeit or fake brand',
  'Prohibited item',
  'Other',
];

export const SIZE_GROUPS = [
  { label: 'Clothing', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'] },
  { label: 'Waist (jeans)', sizes: ['W28', 'W30', 'W32', 'W34', 'W36', 'W38'] },
  {
    label: 'Shoes (EU)',
    sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
  },
];
export const SIZES = SIZE_GROUPS.flatMap((group) => group.sizes);

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

export const LIMITS = {
  name: { min: 2, max: 60 },
  email: { max: 254 },
  password: { min: 8, max: 72 }, // bcrypt only uses the first 72 bytes
  location: { max: 80 },
  bio: { max: 300 },
  title: { min: 3, max: 100 },
  description: { min: 10, max: 2000 },
  brand: { max: 50 },
  color: { max: 30 },
  measurements: { max: 200 },
  price: { min: 1, max: 1000000 },
  maxImages: 5,
  imageUrl: { max: 500 },
  message: { min: 5, max: 1000 },
  reportDetails: { max: 500 },
  search: { max: 100 },
};

export const PAGE_SIZE = 12;

// Suggestions only (shown in a datalist). Sellers can still type any location.
export const LOCATION_SUGGESTIONS = [
  'Dhaka',
  'Dhanmondi, Dhaka',
  'Gulshan, Dhaka',
  'Uttara, Dhaka',
  'Mirpur, Dhaka',
  'Chattogram',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Cumilla',
  'Gazipur',
  'Narayanganj',
  "Cox's Bazar",
];
