// Sample data for local demos. All accounts use the @rewear.demo domain so they
// are easy to recognise and remove (npm run seed:remove).

const img = (photoId) => `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=75`;

export const DEMO_DOMAIN = '@rewear.demo';

export const DEMO_USERS = [
  { key: 'admin', name: 'ReWear Admin', email: `admin${DEMO_DOMAIN}`, location: 'Dhaka' },
  { key: 'ayesha', name: 'Ayesha Rahman', email: `ayesha${DEMO_DOMAIN}`, location: 'Dhanmondi, Dhaka' },
  { key: 'rafi', name: 'Rafi Chowdhury', email: `rafi${DEMO_DOMAIN}`, location: 'Chattogram' },
  { key: 'nusrat', name: 'Nusrat Jahan', email: `nusrat${DEMO_DOMAIN}`, location: 'Sylhet' },
  { key: 'tanvir', name: 'Tanvir Hossain', email: `tanvir${DEMO_DOMAIN}`, location: 'Uttara, Dhaka' },
  { key: 'buyer', name: 'Demo Buyer', email: `buyer${DEMO_DOMAIN}`, location: 'Dhaka' },
];

export const DEMO_ITEMS = [
  // T-Shirts
  { seller: 'ayesha', title: 'Cotton crew-neck t-shirt', category: 'T-Shirts', size: 'M', condition: 'Like New', price: 350, brand: 'Uniqlo', color: '', location: 'Dhanmondi, Dhaka', daysAgo: 1,
    description: 'Soft 100% cotton tee, worn only a handful of times. No stains, no fading, collar still holds its shape. Washed and hung up, ready to go.', measurements: 'Chest 38 in, length 26 in',
    images: [img('photo-1619161519929-befcb28d6384')] },
  { seller: 'tanvir', title: 'Printed graphic t-shirt', category: 'T-Shirts', size: 'L', condition: 'Good', price: 280, brand: 'H&M', color: 'Black', location: 'Uttara, Dhaka', daysAgo: 6,
    description: 'Oversized fit with a small front print. Slight fading from washing but no holes. Great for casual wear.', measurements: '',
    images: [img('photo-1470309864661-68328b2cd0a5')] },
  { seller: 'rafi', title: 'Striped polo t-shirt', category: 'T-Shirts', size: 'XL', condition: 'Excellent', price: 450, brand: 'Polo Ralph Lauren', color: 'Navy and white', location: 'GEC Circle, Chattogram', daysAgo: 11,
    description: 'Classic striped polo in a breathable cotton pique. Bought abroad, worn twice. Selling because it is a size too big.', measurements: 'Chest 44 in',
    images: [img('photo-1543436115-0d6fbe97ece0')] },

  // Shirts
  { seller: 'ayesha', title: 'Formal slim-fit shirt', category: 'Shirts', size: 'M', condition: 'Excellent', price: 650, brand: 'Arong', color: 'Light blue', location: 'Dhanmondi, Dhaka', daysAgo: 2,
    description: 'Slim-fit formal shirt, ironed and ready to wear. Perfect for interviews and office days. Collar and cuffs are still crisp.', measurements: 'Chest 40 in, sleeve 25 in',
    images: [img('photo-1709916314093-5bbc88f6ee8c')] },
  { seller: 'nusrat', title: 'Casual checked shirt', category: 'Shirts', size: 'L', condition: 'Good', price: 520, brand: "Levi's", color: 'Check', location: 'Sylhet', daysAgo: 8,
    description: 'Soft brushed cotton shirt. Pocket on the chest, buttons all intact. Light pilling under the arms from regular wear.', measurements: '',
    images: [img('photo-1675537057604-cafeef78a3d6')] },
  { seller: 'tanvir', title: 'Linen summer shirt', category: 'Shirts', size: 'S', condition: 'Like New', price: 800, brand: 'Zara', color: '', location: 'Uttara, Dhaka', daysAgo: 14,
    description: 'Lightweight linen, ideal for hot weather. Worn once to a wedding. Washed and pressed.', measurements: 'Chest 36 in, length 28 in',
    images: [img('photo-1675537057530-312348c6caa2')] },

  // Jeans
  { seller: 'rafi', title: 'Slim-fit denim jeans', category: 'Jeans', size: 'W32', condition: 'Excellent', price: 1200, brand: "Levi's", color: 'Blue', location: 'GEC Circle, Chattogram', daysAgo: 3,
    description: 'Slim fit with a little stretch. No rips or stains, hems are original. Natural fading on the thighs from regular wear. Very comfortable.', measurements: 'Waist 32 in, inseam 30 in',
    images: [img('photo-1578939662863-5cd416d45a69')] },
  { seller: 'ayesha', title: 'High-waist mom jeans', category: 'Jeans', size: 'W28', condition: 'Good', price: 900, brand: 'Mango', color: 'Light blue', location: 'Dhanmondi, Dhaka', daysAgo: 5,
    description: 'Relaxed high-waist fit with tapered legs. Worn often but still in good shape. Small mark at the left knee that is barely visible.', measurements: 'Waist 28 in, rise 12 in',
    images: [img('photo-1604176354204-9268737828e4')] },

  // Dresses
  { seller: 'nusrat', title: 'Red party dress', category: 'Dresses', size: 'S', condition: 'Excellent', price: 2200, brand: 'Forever 21', color: 'Red', location: 'Sylhet', daysAgo: 9,
    description: 'Knee-length dress with a fitted bodice and zip at the back. Worn at one event. Dry cleaned afterwards.', measurements: 'Bust 34 in, waist 27 in',
    images: [img('photo-1582116850476-002a84f235d3')] },
  { seller: 'ayesha', title: 'Casual summer dress', category: 'Dresses', size: 'M', condition: 'Like New', price: 1500, brand: 'Zara', color: '', location: 'Dhanmondi, Dhaka', daysAgo: 1,
    description: 'Flowy dress with a tie waist and a lined skirt. Worn only a couple of times. Comes from a smoke-free home.', measurements: 'Bust 36 in, length 44 in',
    images: [img('photo-1624192647570-1131acc12ccf')] },

  // Jackets
  { seller: 'rafi', title: 'Faux-leather biker jacket', category: 'Jackets', size: 'L', condition: 'Excellent', price: 3200, brand: 'Bershka', color: 'Black', location: 'GEC Circle, Chattogram', daysAgo: 4,
    description: 'Zip-front biker jacket with quilted shoulders. Faux leather is intact with no peeling. Warm lining.', measurements: 'Chest 42 in, length 24 in',
    images: [img('photo-1709916306473-429270ca4448')] },
  { seller: 'tanvir', title: 'Utility jacket with hood', category: 'Jackets', size: 'M', condition: 'Good', price: 1800, brand: 'Uniqlo', color: '', location: 'Uttara, Dhaka', daysAgo: 7,
    description: 'Light water-resistant jacket with four pockets and a hood. Good for the rainy season.', measurements: '',
    images: [img('photo-1709916306474-4de3cd49cf01')] },
  { seller: 'ayesha', title: 'Tailored wool blazer', category: 'Jackets', size: 'M', condition: 'Excellent', price: 2600, brand: 'Marks & Spencer', color: 'Grey', location: 'Dhanmondi, Dhaka', daysAgo: 25, status: 'Sold',
    description: 'Single-breasted blazer, fully lined. Sold to a friend of a friend; kept here to show how a sold listing looks.', measurements: 'Chest 38 in',
    images: [img('photo-1520006403909-838d6b92c22e')] },

  // Sneakers
  { seller: 'rafi', title: 'White leather sneakers', category: 'Sneakers', size: 'EU 43', condition: 'Excellent', price: 3000, brand: 'Adidas', color: 'White', location: 'GEC Circle, Chattogram', daysAgo: 10,
    description: 'Clean white sneakers with only light creasing. Original insoles. Box not included.', measurements: 'Insole 28 cm',
    images: [img('photo-1549298916-b41d501d3772')] },
  { seller: 'nusrat', title: 'Canvas high-top sneakers', category: 'Sneakers', size: 'EU 38', condition: 'Fair', price: 900, brand: 'Converse', color: 'Black', location: 'Sylhet', daysAgo: 18,
    description: 'Well-loved canvas high-tops with scuffed toes. Laces were replaced recently. Still very comfortable.', measurements: 'Insole 24 cm',
    images: [img('photo-1491553895911-0055eca6402d')] },

  // Bags
  { seller: 'ayesha', title: 'Vintage hard-shell suitcase set', category: 'Bags', size: 'Free Size', condition: 'Good', price: 2800, brand: '', color: 'Assorted', location: 'Dhanmondi, Dhaka', daysAgo: 2,
    description: 'Retro hard-shell cases that stack neatly. Some scuffs and light rust on the latches, which gives them character. Locks and zips work.', measurements: 'Largest 60 x 40 x 22 cm',
    images: [img('photo-1479888230021-c24f136d849f')] },
  { seller: 'tanvir', title: 'Laptop backpack', category: 'Bags', size: 'Free Size', condition: 'Good', price: 1200, brand: 'Wildcraft', color: 'Navy', location: 'Uttara, Dhaka', daysAgo: 13,
    description: 'Padded laptop compartment, three zip pockets and a water bottle sleeve. Used through one university year.', measurements: '45 x 30 x 15 cm',
    images: [img('photo-1553062407-98eeb64c6a62')] },

  // Traditional Wear
  { seller: 'ayesha', title: 'Printed cotton saree', category: 'Traditional Wear', size: 'Free Size', condition: 'Good', price: 3500, brand: '', color: 'Floral print', location: 'Dhanmondi, Dhaka', daysAgo: 17,
    description: 'Soft cotton saree with a bold floral print, worn at two family events. Fall and pico already done. Blouse piece included, unstitched.', measurements: '5.5 m saree, 0.8 m blouse piece',
    images: [img('photo-1617331721458-bd3bd3f9c7f8')] },
  { seller: 'rafi', title: 'Embroidered panjabi', category: 'Traditional Wear', size: 'L', condition: 'Like New', price: 1800, brand: 'Yellow', color: 'Cream', location: 'GEC Circle, Chattogram', daysAgo: 6,
    description: 'Cotton-silk panjabi with subtle thread work at the collar. Worn for one Eid. Dry cleaned.', measurements: 'Chest 42 in, length 40 in',
    images: [img('photo-1484502249930-e1da807099a5')] },
  { seller: 'tanvir', title: 'Everyday cotton kurta', category: 'Traditional Wear', size: 'M', condition: 'Fair', price: 700, brand: 'Ecstasy', color: 'Navy', location: 'Uttara, Dhaka', daysAgo: 22, status: 'Reserved',
    description: 'Everyday cotton kurta with a few washes of fading. Reserved for a buyer until the weekend.', measurements: '',
    images: [img('photo-1453486030486-0a5ffcd82cd9')] },
];
