import express from "express";
import authRouter from "./routes/auth.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", authRouter);

app.use(errorMiddleware);

export default app;
