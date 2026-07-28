import app from "./app.js";
import dotenv from "dotenv";
import connectToDatabase from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Auth Service running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Auth Service", error);
    process.exit(1);
  }
};

startServer();
