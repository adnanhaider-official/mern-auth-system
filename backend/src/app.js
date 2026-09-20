import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// JSON request body ko read karne ke liye
app.use(express.json());

// Form data ko read karne ke liye
app.use(express.urlencoded({ extended: true }));

// React frontend ke liye CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Cookies read karne ke liye
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);

// Global error handler
app.use(errorHandler);

export default app;
