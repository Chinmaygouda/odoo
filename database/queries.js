// queries.js
// Backend-ready PostgreSQL queries for Traveloop MVP using pg package
const pool = require('./db');

/**
 * 1. USER MANAGEMENT (Signup & Login)
 */

const createUser = async (name, email, password) => {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email;
  `;
  // In a real app, 'password' should be hashed (e.g., using bcrypt)
  const { rows } = await pool.query(query, [name, email, password]);
  return rows[0];
};

const getUserByEmail = async (email) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1;
  `;
  const { rows } = await pool.query(query, [email]);
  return rows[0]; // Returns undefined if user is not found
};

/**
 * 2. TRIP MANAGEMENT
 */

const createTrip = async (userId, tripName, startDate, endDate, description, estimatedBudget) => {
  const query = `
    INSERT INTO trips (user_id, trip_name, start_date, end_date, description, estimated_budget)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [userId, tripName, startDate, endDate, description, estimatedBudget];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const getUserTrips = async (userId) => {
  const query = `
    SELECT * FROM trips
    WHERE user_id = $1
    ORDER BY start_date ASC;
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
};

/**
 * 3. ACTIVITIES
 */

const getActivitiesByCity = async (cityName) => {
  const query = `
    SELECT * FROM activities
    WHERE city_name ILIKE $1;
  `;
  // ILIKE is used for case-insensitive matching in Postgres
  const { rows } = await pool.query(query, [`%${cityName}%`]);
  return rows;
};

const addActivityToTrip = async (tripId, activityId) => {
  const query = `
    INSERT INTO trip_activities (trip_id, activity_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [tripId, activityId]);
  return rows[0];
};

/**
 * 4. BUDGET CALCULATIONS
 */

const getTripBudgetCalculation = async (tripId) => {
  const query = `
    SELECT 
      t.id as trip_id,
      t.trip_name,
      t.estimated_budget,
      COALESCE(SUM(a.cost), 0) AS total_activities_cost,
      (t.estimated_budget - COALESCE(SUM(a.cost), 0)) AS remaining_budget
    FROM trips t
    LEFT JOIN trip_activities ta ON t.id = ta.trip_id
    LEFT JOIN activities a ON ta.activity_id = a.id
    WHERE t.id = $1
    GROUP BY t.id, t.trip_name, t.estimated_budget;
  `;
  const { rows } = await pool.query(query, [tripId]);
  return rows[0];
};

/**
 * 5. GENERIC UPDATE AND DELETE QUERIES
 */

const updateTripDetails = async (tripId, tripName, estimatedBudget) => {
  const query = `
    UPDATE trips
    SET trip_name = COALESCE($1, trip_name),
        estimated_budget = COALESCE($2, estimated_budget)
    WHERE id = $3
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [tripName, estimatedBudget, tripId]);
  return rows[0];
};

const deleteTrip = async (tripId) => {
  const query = `
    DELETE FROM trips
    WHERE id = $1
    RETURNING id;
  `;
  // ON DELETE CASCADE will automatically remove stops and trip_activities associated with this trip
  const { rows } = await pool.query(query, [tripId]);
  return rows[0];
};

module.exports = {
  createUser,
  getUserByEmail,
  createTrip,
  getUserTrips,
  getActivitiesByCity,
  addActivityToTrip,
  getTripBudgetCalculation,
  updateTripDetails,
  deleteTrip
};
