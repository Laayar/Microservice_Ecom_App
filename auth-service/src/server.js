import app from "./app.js";
import dotenv from "dotenv";
import connectToDatabase from "./database/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the server</h1>");
});

// Health check endpoint — used by Docker, Jenkins, and cloud platforms
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "auth-service" });
});
const startServer = async () => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.warn(
      "Database connection failed at startup; continuing without database",
    );
  }

  app.listen(PORT, () => {
    console.log(`Auth Service running on http://localhost:${PORT}`);
  });
};

startServer();
