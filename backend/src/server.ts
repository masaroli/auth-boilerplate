import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import config from "./config";
import authRoutes from "./routes/authRoutes";
import "./types/express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes";

// Initialize Express app with explicit Application type
const app: Application = express();
const PORT = config.PORT;

const connectDB = async () => {
  try {
    if (!config.MONGO_URI) {
      throw new Error(
        "MongoDB URI is not defined in config.ts. Please check your .env file and config/index.ts validation."
      );
    }
    await mongoose.connect(config.MONGO_URI);
    console.log("MongoDB connected successfully!");
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// --- Middleware ---
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

// --- API Routes ---
app.use("/api", authRoutes);
app.use("/api", userRoutes);

// --- Server Start ---
const startApp = async () => {
  // 1. Connect to MongoDB first
  await connectDB();

  // 2. Then, start the Express server
  app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
    console.log(`Access auth routes under /api `);
  });
};

startApp();
