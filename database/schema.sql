-- Adda Housing Database Schema
-- PostgreSQL Database for Housing Society Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SOCIETIES TABLE
-- =============================================
CREATE TABLE societies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    registration_number VARCHAR(50) UNIQUE,
    logo VARCHAR(500),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(15) NOT NULL,
    total_blocks INTEGER DEFAULT 0,
    total_flats INTEGER DEFAULT 0,
    maintenance_per_sqft DECIMAL(10, 2) DEFAULT 0,
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    razorpay_key_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_societies_name ON societies(name);
CREATE INDEX idx_societies_city ON societies(city);
CREATE INDEX idx_societies_is_active ON societies(is_active);

-- =============================================
-- BLOCKS TABLE
-- =============================================
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL,
    total_floors INTEGER DEFAULT 0,
    flats_per_floor INTEGER DEFAULT 4,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(society_id, code)
);

CREATE INDEX idx_blocks_society_id ON blocks(society_id);
CREATE INDEX idx_blocks_name ON blocks(name);
CREATE INDEX idx_blocks_is_active ON blocks(is_active);

-- =============================================
-- FLATS TABLE
-- =============================================
CREATE TABLE flats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    flat_number VARCHAR(20) NOT NULL,
    floor INTEGER NOT NULL,
    type VARCHAR(20) DEFAULT '2BHK',
    square_feet INTEGER,
    owner_name VARCHAR(100),
    owner_phone VARCHAR(15),
    owner_email VARCHAR(100),
    tenant_name VARCHAR(100),
    tenant_phone VARCHAR(15),
    maintenance_amount DECIMAL(10, 2) DEFAULT 0,
    is_occupied BOOLEAN DEFAULT FALSE,
    is_owner_occupied BOOLEAN DEFAULT TRUE,
    parking_slot VARCHAR(20),
    vehicle_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(society_id, block_id, flat_number)
);

CREATE INDEX idx_flats_society_id ON flats(society_id);
CREATE INDEX idx_flats_block_id ON flats(block_id);
CREATE INDEX idx_flats_flat_number ON flats(flat_number);
CREATE INDEX idx_flats_is_active ON flats(is_active);

-- =============================================
-- ROLES TABLE
-- =============================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('SUPER_ADMIN', 'Super Administrator', '{"all": true}'),
('CHAIRMAN', 'Society Chairman', '{"manage": true, "approve": true, "reports": true}'),
('SECRETARY', 'Society Secretary', '{"manage": true, "approve": true}'),
('ACCOUNTANT', 'Society Accountant', '{"bills": true, "payments": true, "reports": true}'),
('MEMBER', 'Society Member', '{"view": true}'),
('GUARD', 'Security Guard', '{"visitors": true}');

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID REFERENCES societies(id) ON DELETE SET NULL,
    flat_id UUID REFERENCES flats(id) ON DELETE SET NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(15) NOT NULL,
    password VARCHAR(255),
    user_type VARCHAR(20) DEFAULT 'RESIDENT',
    profile_image VARCHAR(500),
    date_of_birth DATE,
    gender VARCHAR(10),
    aadhaar_number VARCHAR(12),
    blood_group VARCHAR(5),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    fcm_token TEXT,
    device_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    otp VARCHAR(6),
    otp_expires_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_society_id ON users(society_id);
CREATE INDEX idx_users_flat_id ON users(flat_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =============================================
-- BILLS TABLE
-- =============================================
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    bill_month VARCHAR(20) NOT NULL,
    bill_year INTEGER NOT NULL,
    maintenance_amount DECIMAL(10, 2) NOT NULL,
    parking_charge DECIMAL(10, 2) DEFAULT 0,
    water_charge DECIMAL(10, 2) DEFAULT 0,
    other_charges DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    late_charge DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING',
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bills_society_id ON bills(society_id);
CREATE INDEX idx_bills_flat_id ON bills(flat_id);
CREATE INDEX idx_bills_bill_month ON bills(bill_month, bill_year);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_due_date ON bills(due_date);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_society_id ON payments(society_id);
CREATE INDEX idx_payments_bill_id ON payments(bill_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_flat_id ON payments(flat_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- =============================================
-- COMPLAINTS TABLE
-- =============================================
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'OPEN',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    assigned_to UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complaints_society_id ON complaints(society_id);
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_flat_id ON complaints(flat_id);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_status ON complaints(status);

-- =============================================
-- NOTICES TABLE
-- =============================================
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    notice_type VARCHAR(50) DEFAULT 'GENERAL',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    valid_from DATE NOT NULL,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notices_society_id ON notices(society_id);
CREATE INDEX idx_notices_created_by ON notices(created_by);
CREATE INDEX idx_notices_notice_type ON notices(notice_type);
CREATE INDEX idx_notices_is_active ON notices(is_active);

-- =============================================
-- VISITORS TABLE
-- =============================================
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    visitor_name VARCHAR(100) NOT NULL,
    visitor_phone VARCHAR(15),
    visitor_photo VARCHAR(500),
    purpose VARCHAR(50) NOT NULL,
    flat_number VARCHAR(20),
    in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    out_time TIMESTAMP,
    qr_code VARCHAR(100),
    approval_status VARCHAR(20) DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    vehicle_number VARCHAR(20),
    is_delivery BOOLEAN DEFAULT FALSE,
    delivery_item TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visitors_society_id ON visitors(society_id);
CREATE INDEX idx_visitors_flat_id ON visitors(flat_id);
CREATE INDEX idx_visitors_in_time ON visitors(in_time);
CREATE INDEX idx_visitors_approval_status ON visitors(approval_status);

-- =============================================
-- STAFF TABLE
-- =============================================
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    designation VARCHAR(100),
    aadhaar_number VARCHAR(12),
    address TEXT,
    salary DECIMAL(10, 2),
    shift VARCHAR(20),
    joining_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_society_id ON staff(society_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- =============================================
-- AMENITIES TABLE
-- =============================================
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    capacity INTEGER DEFAULT 0,
    timing_open TIME,
    timing_close TIME,
    charge_per_hour DECIMAL(10, 2) DEFAULT 0,
    charge_per_booking DECIMAL(10, 2) DEFAULT 0,
    advance_booking_hours INTEGER DEFAULT 24,
    cancellation_hours INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(society_id, name)
);

CREATE INDEX idx_amenities_society_id ON amenities(society_id);
CREATE INDEX idx_amenities_is_active ON amenities(is_active);

-- =============================================
-- AMENITY BOOKINGS TABLE
-- =============================================
CREATE TABLE amenity_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flat_id UUID NOT NULL REFERENCES flats(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_hours DECIMAL(5, 2),
    amount DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'CONFIRMED',
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_amenity_bookings_society_id ON amenity_bookings(society_id);
CREATE INDEX idx_amenity_bookings_amenity_id ON amenity_bookings(amenity_id);
CREATE INDEX idx_amenity_bookings_user_id ON amenity_bookings(user_id);
CREATE INDEX idx_amenity_bookings_booking_date ON amenity_bookings(booking_date);
CREATE INDEX idx_amenity_bookings_status ON amenity_bookings(status);

-- =============================================
-- EXPENSES TABLE
-- =============================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    vendor_name VARCHAR(100),
    invoice_number VARCHAR(50),
    receipt_url VARCHAR(500),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_society_id ON expenses(society_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT',
    is_system_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_society_id ON chat_messages(society_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- =============================================
-- NOTIFICATION TABLE
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    type VARCHAR(50),
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- =============================================
-- AUDIT LOG TABLE
-- =============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
