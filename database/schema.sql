-- schema.sql
-- Traveloop Database Schema

-- Table 1: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: trips
CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    estimated_budget NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: stops
CREATE TABLE stops (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_name VARCHAR(255) NOT NULL,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL
);

-- Table 4: activities
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL,
    activity_name VARCHAR(255) NOT NULL,
    cost NUMERIC(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL
);

-- Table 5: trip_activities
CREATE TABLE trip_activities (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE
);

-- ==========================================
-- DUMMY DATA INSERTION
-- ==========================================

-- Insert Users
INSERT INTO users (name, email, password) VALUES
('Alice Smith', 'alice@example.com', 'hashedpassword123'),
('Bob Johnson', 'bob@example.com', 'hashedpassword456');

-- Insert Trips
INSERT INTO trips (user_id, trip_name, start_date, end_date, description, estimated_budget) VALUES
(1, 'European Summer Backpacking', '2026-06-15', '2026-07-15', 'Backpacking across France, Italy, and Spain', 3500.00),
(2, 'Japan Tech Tour', '2026-09-10', '2026-09-24', 'Exploring Tokyo and Kyoto', 4200.00);

-- Insert Stops
INSERT INTO stops (trip_id, city_name, arrival_date, departure_date) VALUES
(1, 'Paris', '2026-06-15', '2026-06-20'),
(1, 'Rome', '2026-06-21', '2026-06-28'),
(2, 'Tokyo', '2026-09-10', '2026-09-17'),
(2, 'Kyoto', '2026-09-18', '2026-09-24');

-- Insert Activities
INSERT INTO activities (city_name, activity_name, cost, category) VALUES
('Paris', 'Eiffel Tower Tour', 30.00, 'Sightseeing'),
('Paris', 'Louvre Museum', 20.00, 'Museum'),
('Rome', 'Colosseum Underground Tour', 45.00, 'Historical'),
('Rome', 'Pasta Making Class', 60.00, 'Food'),
('Tokyo', 'Akihabara Guided Tour', 25.00, 'Tech/Culture'),
('Tokyo', 'Sushi Making Class', 80.00, 'Food'),
('Kyoto', 'Fushimi Inari Shrine Visit', 0.00, 'Cultural'),
('Kyoto', 'Traditional Tea Ceremony', 40.00, 'Cultural');

-- Insert Trip Activities
INSERT INTO trip_activities (trip_id, activity_id) VALUES
(1, 1), -- Alice's Trip: Eiffel Tower
(1, 2), -- Alice's Trip: Louvre
(1, 3), -- Alice's Trip: Colosseum
(2, 5), -- Bob's Trip: Akihabara
(2, 6); -- Bob's Trip: Sushi Class

-- ==========================================
-- EXAMPLE SELECT QUERIES
-- ==========================================

-- Select all trips for a user
-- SELECT * FROM trips WHERE user_id = 1;

-- Select all activities for a specific city
-- SELECT * FROM activities WHERE city_name = 'Paris';

-- Get all activities chosen for a specific trip
-- SELECT a.* FROM activities a 
-- JOIN trip_activities ta ON a.id = ta.activity_id 
-- WHERE ta.trip_id = 1;

-- ==========================================
-- EXAMPLE UPDATE / DELETE QUERIES
-- ==========================================

-- Update a trip's budget
-- UPDATE trips SET estimated_budget = 4000.00 WHERE id = 1;

-- Delete a stop from a trip
-- DELETE FROM stops WHERE id = 1;
