// filepath: backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async (dbName) => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbPath = `${mongoURI}/${dbName}`;
    
    const conn = await mongoose.connect(dbPath);
    console.log(`Connected to database: ${dbName}`);
    return conn;
  } catch (error) {
    console.error(`Database connection error for ${dbName}:`, error.message);
    throw error;
  }
};

module.exports = connectDB;