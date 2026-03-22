# StayByte - Premium Vacation Rental Platform

StayByte is a modern, high-performance vacation rental platform inspired by Airbnb. It allows users to browse unique listings, book stays with real-time payment processing, and manage their own property listings.

## 🚀 Features

- **Dynamic Property Browsing**: Explore a wide range of properties categorized by type (Villas, Cabins, Farmhouses, etc.).
- **Real-time Payments**: Integrated with **Cashfree Payment Gateway** for secure and seamless bookings.
- **User Authentication**: Secure signup and login using JWT and HttpOnly cookies.
- **Host Dashboard**: Users can list their own properties, upload images via Cloudinary, and manage their listings.
- **Booking Management**: Track your upcoming stays and past bookings.(coming soon...)
- **Rating System**: Interactive property rating system for guest feedback.

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: Modern frontend library for a fast and reactive UI.
- **React Router Dom**: Client-side routing for seamless navigation.
- **Axios**: Promised-based HTTP client for API requests.
- **Cashfree Web SDK**: Dynamic payment modal integration.
- **React Toastify**: Elegant notification system.

### Backend
- **Node.js & Express**: Scalable and robust backend server.
- **MongoDB & Mongoose**: Flexible NoSQL database with schema modeling.
- **Cashfree Node SDK**: Server-side payment order creation and verification.
- **Cloudinary & Multer**: Cloud-based image storage and management.
- **JWT & Cookie-Parser**: Secure session management.

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd StayByte
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add the following:
```env
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

# Cashfree Credentials
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=SANDBOX

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Run the frontend:
```bash
npm run dev
```

## 📜 Deployment

Ensure your production environment variables are updated, specifically `CASHFREE_ENV=PRODUCTION` and `FRONTEND_URL` to your production domain.

---
