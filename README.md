# MERN E-Commerce App

A production-oriented full-stack MERN e-commerce application with secure authentication, Razorpay payment integration, and role-based access control.

---

## 🚀 Features
- JWT Authentication (HttpOnly cookies)
- Role-Based Access Control (Admin/User)
- Razorpay Payment Integration
- Order Management System
- Cloudinary Image Uploads

---

## 🛠 Tech Stack
- Frontend: React.js, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB
- APIs: Razorpay, Cloudinary

---

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/JayantBansal900/ecommerce-mern.git
cd ecommerce-mern
```

### 2. Install dependencies

#### Terminal 1 (Backend)
```bash
cd server
npm install
```

#### Terminal 2 (Frontend)
```bash
cd client
npm install
```

### 3. Run the project

#### Terminal 1 (Backend)
```bash
cd server
npm run dev
```

#### Terminal 2 (Frontend)
```bash
cd client
npm start
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `server` folder and add:

```
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---


---
