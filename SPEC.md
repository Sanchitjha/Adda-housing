# Adda Housing - Society Management System

## Project Overview
- **Project Name**: Adda Housing
- **Type**: Full-stack Mobile + Web Application
- **Core Functionality**: Comprehensive housing society management platform enabling residents, admins, and security guards to manage society operations, payments, complaints, visitors, and amenities.
- **Target Users**: Society Residents, Society Administrators (Chairman/Secretary/Accountant), Gate Guards

---

## Tech Stack

### Frontend
- **Resident App**: Flutter (Android-first)
- **Guard App**: Flutter (Android-first)
- **Admin Panel**: React + Material UI + Recharts

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Auth**: JWT (JSON Web Tokens)
- **Storage**: AWS S3
- **Push Notifications**: Firebase Cloud Messaging
- **Payments**: Razorpay (India)

---

## Architecture

### Database Schema (PostgreSQL)

```
Societies
├── Blocks
│   └── Flats
│       └── Users (Residents)
├── Bills
├── Payments
├── Complaints
├── Notices
├── Visitors
├── Staff
└── AmenityBookings
```

### API Structure
- RESTful APIs
- JWT-protected routes
- Role-based access control (RBAC)

---

## App Modules

### 1. Resident App Features
- [ ] Login/Signup (Mobile OTP + Password)
- [ ] Society selection on first launch
- [ ] Flat/Owner profile management
- [ ] Maintenance bill view & payment
- [ ] Online payment via Razorpay
- [ ] Payment history tracking
- [ ] Complaint system with image upload
- [ ] Notice board
- [ ] Visitor approval workflow
- [ ] Amenity booking system
- [ ] Society chat (basic group chat)
- [ ] Push notifications (Firebase)

### 2. Admin Panel (Web)
- [ ] Society creation & management
- [ ] Block/Flat management (CRUD)
- [ ] Member management
- [ ] Maintenance bill generator
- [ ] Expense tracking
- [ ] Complaint management
- [ ] Staff management
- [ ] Visitor logs & reports
- [ ] Reports export (PDF + Excel)
- [ ] Payment dashboard
- [ ] Role system (Chairman/Secretary/Accountant)
- [ ] Analytics dashboard

### 3. Guard App
- [ ] Visitor entry form
- [ ] Photo capture
- [ ] Flat selection
- [ ] Resident approval request
- [ ] Delivery/Package logs
- [ ] QR code visitor pass generation

---

## UI/UX Design Guidelines

### Color Palette
- **Primary**: #2563EB (Blue 600)
- **Secondary**: #0F172A (Slate 900)
- **Accent**: #10B981 (Emerald 500)
- **Background**: #F8FAFC (Slate 50)
- **Surface**: #FFFFFF
- **Error**: #EF4444 (Red 500)
- **Warning**: #F59E0B (Amber 500)
- **Success**: #22C55E (Green 500)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, 24-32px
- **Body**: Regular, 14-16px
- **Captions**: Regular, 12px

### Layout
- Bottom navigation for mobile apps
- Sidebar navigation for admin panel
- Card-based UI components
- Pull-to-refresh lists

---

## Backend API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/otp/send
- POST /api/auth/otp/verify
- POST /api/auth/refresh

### Societies
- GET /api/societies
- POST /api/societies
- GET /api/societies/:id
- PUT /api/societies/:id

### Blocks & Flats
- GET /api/societies/:id/blocks
- POST /api/blocks
- PUT /api/blocks/:id
- DELETE /api/blocks/:id
- GET /api/flats
- POST /api/flats
- PUT /api/flats/:id

### Users
- GET /api/users
- GET /api/users/:id
- PUT /api/users/:id
- GET /api/flats/:flatId/users

### Bills
- GET /api/bills
- POST /api/bills
- GET /api/bills/:id
- PUT /api/bills/:id

### Payments
- GET /api/payments
- POST /api/payments
- GET /api/payments/razorpay/order
- POST /api/payments/razorpay/webhook

### Complaints
- GET /api/complaints
- POST /api/complaints
- PUT /api/complaints/:id
- PUT /api/complaints/:id/status

### Notices
- GET /api/notices
- POST /api/notices
- PUT /api/notices/:id
- DELETE /api/notices/:id

### Visitors
- GET /api/visitors
- POST /api/visitors
- PUT /api/visitors/:id
- GET /api/visitors/approve/:id

### Amenities
- GET /api/amenities
- POST /api/amenities
- GET /api/amenities/bookings
- POST /api/amenities/bookings

### Staff
- GET /api/staff
- POST /api/staff
- PUT /api/staff/:id
- DELETE /api/staff/:id

### Chat
- GET /api/chat/messages
- POST /api/chat/messages

---

## Security

- JWT tokens with 24h expiry
- Refresh tokens with 7 days expiry
- Password hashing with bcrypt
- Role-based middleware
- Input validation with Joi
- Rate limiting
- CORS configuration

---

## File Structure

```
adda-housing/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── package.json
│   └── .env.example
├── resident_app/
│   ├── lib/
│   ├── android/
│   └── pubspec.yaml
├── guard_app/
│   ├── lib/
│   ├── android/
│   └── pubspec.yaml
├── admin_panel/
│   ├── src/
│   ├── public/
│   └── package.json
├── database/
│   └── schema.sql
└── README.md
