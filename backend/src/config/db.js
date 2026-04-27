const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/assignment14";

  try {
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    if (!process.env.MONGO_URI) {
      console.error("No MONGO_URI value set. Add backend/.env with a valid MongoDB URI or run a local MongoDB instance at mongodb://127.0.0.1:27017/assignment14.");
    } else {
      console.error("Please verify your Atlas cluster settings and IP whitelist for this machine.");
    }
    throw error;
  }
};

module.exports = connectDB;
