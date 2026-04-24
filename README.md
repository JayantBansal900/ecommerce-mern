# MERN E-Commerce App

## 🚀 Features
- JWT Authentication (HttpOnly cookies)
- Role-based access (Admin/User)
- Razorpay Payment Integration
- Order Management System
- Cloudinary Image Uploads

## 🛠 Tech Stack
- Frontend: React.js, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB
- APIs: Razorpay, Cloudinary

## ⚙️ Setup Instructions

### 1. Clone repo
git clone https://github.com/JayantBansal900/ecommerce-mern.git

### 2. Install dependencies
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm start

### 3. Run project
cd server && npm run dev
cd client && npm start

## 🔐 Environment Variables
Create `.env` in server:
- JWT_SECRET
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- CLOUDINARY configs
