import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MERN Auth API is running",
  });
});

export default app;
