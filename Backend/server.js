import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";  // Ensure app.js exports the express instance
import express from "express";
import eventRoutes from "./routes/eventRoute.js";
import userRoute from "./routes/user.routes.js";
// Load environment variables
dotenv.config({ path: "./.env" });  // Use .env for environment variables

// Connect to MongoDB
connectDB()
  .then(() => {
    // Middleware to parse JSON
    app.use(express.json());

    // Routes
    app.use('/api', eventRoutes);
    app.use('/api/user', userRoute);

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on PORT : ${PORT}`);
    });

    // Handle server errors
    app.on("error", (err) => {
      console.log(`Got an error while connecting to server: ${err}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed: ", err);
  });
