# ♻️ ReWear
## Give Fashion a Second Life

![ReWear Banner](https://via.placeholder.com/1200x400)

ReWear is a modern second-hand fashion marketplace that promotes sustainable fashion by connecting people who want to sell, buy, and reuse quality clothing.

The platform provides a simple and trustworthy environment where users can discover pre-loved fashion items, list unused clothes, communicate with sellers, manage favorites, and build a circular fashion ecosystem.

Built with modern full-stack technologies, ReWear demonstrates practical skills in authentication, database management, API development, responsive UI design, and production deployment.

---

# 🌱 Project Vision

The fashion industry generates massive textile waste every year. Many wearable clothes remain unused while others search for affordable fashion alternatives.

ReWear solves this problem by creating a digital marketplace where:

- 👕 Users can sell unused clothing
- 🛍 Buyers can discover affordable fashion
- ♻️ Clothing gets reused instead of wasted
- 🌍 Sustainable consumption becomes easier

---

# ✨ Key Features

## 🔐 Authentication System

- Secure user registration and login
- Session-based authentication
- Demo account support
- Role-based user experience

Supported account types:

- Buyer
- Seller
- Admin


---

## 👤 User Features

### Buyers can:

- Browse fashion listings
- Search products
- Filter clothing categories
- Save favorite items
- Contact sellers
- View purchase history


### Sellers can:

- Create clothing listings
- Upload product images
- Manage their items
- Edit listing information
- Track inquiries


---

## 🛒 Marketplace Features

- Clothing category browsing

Categories include:

- T-Shirts
- Shirts
- Jeans
- Dresses
- Jackets
- Sneakers
- Bags
- Traditional Wear


Additional features:

- Product details page
- Seller profiles
- Favorites system
- Inquiry management
- Item status tracking


---

## 🛡 Admin Features

Admin dashboard includes:

- User management
- Report management
- Marketplace monitoring
- Content moderation


---

# 🏗 System Architecture

```
ReWear

Frontend
│
├── Next.js App Router
├── React Components
├── Responsive UI
│
Backend
│
├── Next.js API Routes
├── Authentication APIs
├── Business Logic
│
Database
│
└── MongoDB Atlas
```

---

# 🧰 Technology Stack

## Frontend

| Technology | Purpose |
|-|-|
| Next.js 16 | Full-stack React Framework |
| React | UI Development |
| JavaScript | Application Logic |
| CSS | Responsive Styling |


## Backend

| Technology | Purpose |
|-|-|
| Next.js API Routes | Backend APIs |
| Node.js | Server Runtime |
| MongoDB | Database |
| Mongoose | Database Modeling |


## Deployment

| Service | Purpose |
|-|-|
| Vercel | Application Hosting |
| MongoDB Atlas | Cloud Database |
| GitHub | Version Control |

---

# 📊 Database Design

Main Collections:

## Users

Stores:

- Name
- Email
- Password
- Role
- Profile Information


## Items

Stores:

- Product information
- Category
- Price
- Images
- Seller details


## Favorites

Stores user saved products.


## Inquiries

Stores buyer-seller communication.


## Reports

Stores marketplace reports.


---

# 🔑 Demo Accounts

For testing the application:

### Admin Account

```
Email:
admin@rewear.demo

Password:
Demo@12345
```


### Buyer Account

```
Email:
buyer@rewear.demo

Password:
Demo@12345
```


---

# 🚀 Local Installation

## 1. Clone Repository

```bash
git clone https://github.com/Rifat9874/ReWear-Give-Fashion-a-Second-Life.git
```

## 2. Install Dependencies

```bash
npm install
```


## 3. Setup Environment Variables

Create:

```
.env.local
```


Add:

```env
MONGODB_URI=your_mongodb_connection_string
SEED_PASSWORD=Demo@12345
DEMO_LOGIN=true
```


## 4. Run Development Server

```bash
npm run dev
```


Application runs on:

```
http://localhost:3000
```

---

# 📸 Screenshots

(Add your screenshots here)

Recommended screenshots:

- Homepage
- Browse Products
- Login Page
- Register Page
- Dashboard
- Admin Panel


---

# 🔮 Future Improvements

Possible future upgrades:

- Online payment integration
- AI-based clothing recommendation
- Image-based product search
- Real-time messaging
- Delivery tracking
- Product rating system


---

# 🎯 Learning Outcomes

Through this project, I practiced:

- Full-stack application development
- Database architecture
- Authentication systems
- REST API development
- Cloud deployment
- Real-world marketplace workflows


---

# 👨‍💻 Developer

**Rifat Chowdhury Sabuj**

Computer Science & Engineering Student

GitHub:
https://github.com/Rifat9874


---

# 📄 License

This project is created for educational and portfolio purposes.
