import "reflect-metadata";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import { fileRouter } from "@/modules/files";
import { userRouter } from "@/modules/users";
import { errorHandler } from "@/utils/errorHandler";
import { authRouter } from "@/modules/auth";

// Express configuration
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const corsOptions = {
  credentials: true,
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Database connection
async function connectDB() {
  const dialect = "mongodb+srv";
  const username = process.env.DB_USERNAME;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST;
  const collection = process.env.DB_COLLECTION;
  const cluster = process.env.DB_CLUSTER;

  const uri = `${dialect}://${username}:${password}@${host}/${collection}?retryWrites=true&w=majority&appName=${cluster}`;
  
  await mongoose.connect(uri);
  console.log("[database]: Connected");
}

mongoose.connection.on("error", (e) => {
  console.error("[database]: Connection error:", e);
});

// Routes
app.get("/", (req, res) => {
  res.status(200).send("Connected");
});

app.use("/api/auth", authRouter);
app.use("/api/files", fileRouter);
app.use("/api/users", userRouter);

// Error handler must come last
app.use(errorHandler);

export { app, connectDB };
