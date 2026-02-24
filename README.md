# Adda Housing - Society Management System

A comprehensive housing society management platform built with modern technologies for Android and Web platforms.

## 📱 Project Overview

Adda Housing is a full-stack solution for managing housing societies, featuring separate apps for residents, security guards, and administrators.

### Apps Included

1. **Resident App** (Flutter Android) - For society members
2. **Guard App** (Flutter Android) - For security personnel  
3. **Admin Panel** (React Web) - For society management
4. **Backend API** (Node.js) - REST API server

---

## 🛠 Tech Stack

### Frontend
- **Resident/Guard Apps**: Flutter 3.x
- **Admin Panel**: React 18 + Material UI
- **Charts**: Chart.js, Recharts

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Auth**: JWT
- **Real-time**: Socket.IO

### Third-Party Services
- **Storage**: AWS S3
- **Notifications**: Firebase Cloud Messaging
- **Payments**: Razorpay (India)
- **SMS**: Twilio

---

## 📋 Features

### Resident App
- User authentication (OTP + Password)
- Society/Flat profile
- Maintenance bill viewing & payment
- Complaint registration with image upload
- Notice board
- Visitor approval
- Amenity booking
- Society chat
- Push notifications

### Guard App
- Visitor entry registration
- Photo capture
- Flat/Resident lookup
- Visitor approval workflow
- Delivery/Package logging
- QR code visitor passes

### Admin Panel
- Society configuration
- Block & Flat management
- Member management
- Maintenance bill generation
- Expense tracking
- Complaint management
- Staff management
- Visitor logs
- Reports (PDF/Excel)
- Payment dashboard
- Analytics

---

## 📁 Project Structure

```
adda-housing/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/         # Database, Firebase, S3 configs
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Logger, helpers
│   │   └── app.js          # Entry point
│   └── package.json
│
├── resident_app/            # Flutter resident app
│   ├── lib/
│   │   ├── core/           # Config, services
│   │   ├── features/       # Feature modules
│   │   └── main.dart
│   └── pubspec.yaml
│
├── guard_app/               # Flutter guard app
│   ├── lib/
│   │   ├── core/
│   │   ├── features/
│   │   └── main.dart
│   └── pubspec.yaml
│
├── admin_panel/             # React admin panel
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
│
├── database/
│   └── schema.sql          # PostgreSQL schema
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Flutter 3.x
- AWS Account
- Firebase Project
- Razorpay Account

### Backend Setup

```
bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:sync

# Start server
npm run dev
```

### Admin Panel Setup

```
bash
cd admin_panel

# Install dependencies
npm install

# Start development
npm start
```

### Resident App Setup

```
bash
cd resident_app

# Install dependencies
flutter pub get

# Run on device/emulator
flutter run
```

### Guard App Setup

```
bash
cd guard_app

# Install dependencies
flutter pub get

# Run on device/emulator
flutter run
```

---

## 🔧 Environment Variables

### Backend (.env)

```
env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adda_housing
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-south-1
AWS_S3_BUCKET=adda-housing

# Firebase
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY=your_key
FIREBASE_CLIENT_EMAIL=your_email

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

## 📄 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login with credentials |
| POST | /auth/otp/send | Send OTP |
| POST | /auth/otp/verify | Verify OTP |
| POST | /auth/refresh | Refresh token |
| GET | /auth/me | Get current user |

### Main Endpoints

| Module | Endpoints |
|--------|-----------|
| Societies | CRUD operations |
| Blocks | CRUD operations |
| Flats | CRUD operations |
| Bills | Generate, view, pay |
| Payments | Process, history |
| Complaints | Create, manage |
| Notices | Post, view |
| Visitors | Track, approve |
| Staff | Manage employees |
| Amenities | Book, manage |

---

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with Joi
- Rate limiting
- CORS configuration
- Secure headers with Helmet

---

## 📊 Database Schema

Key tables:
- societies
- blocks
- flats
- users
- roles
- bills
- payments
- complaints
- notices
- visitors
- staff
- amenities
- amenity_bookings
- chat_messages

See `database/schema.sql` for complete schema.

---

## 🔔 Push Notifications

Notifications sent for:
- New maintenance bill
- Complaint status update
- Visitor arrival
- Notice published
- Payment confirmation
- Amenity booking confirmation

---

## 💳 Payment Integration

Razorpay integration for:
- One-time maintenance payments
- Multiple bill payments
- Payment gateway checkout
- Webhook handling

---

## 📦 Build & Deployment

### Production Build

**Backend:**
```
bash
cd backend
npm run build
pm2 start dist/app.js
```

**Admin Panel:**
```
bash
cd admin_panel
npm run build
# Deploy dist folder to hosting
```

**Flutter Apps:**
```bash
cd resident_app
flutter build apk --release

cd guard_app
flutter build apk --release
```

---

## 👨‍💻 Developer Notes

- All IDs use UUID format
- Timestamps are in UTC
- Pagination uses `page` and `limit` parameters
- API responses follow standard format
- Error responses include message and code

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

- Flutter team
- Node.js community
- Sequelize team
- Material Design
