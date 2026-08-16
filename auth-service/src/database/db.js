import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/auth-service?retryWrites=false";
const NODE_ENV = process.env.NODE_ENV || "development";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`Connected to database in ${NODE_ENV} mode`);
    return true;
  } catch (error) {
    console.error("Error connecting to database", error.message);
    return false;
  }
};

export default connectToDatabase;
