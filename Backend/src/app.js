import express from "express";
import { createServer } from "node:http";
import cors from "cors";
import mongoose from "mongoose";
import ConnectToSocket from "./controllers/socketmanager.js";
import userRoutes from "./routes/usersroutes.js"; 

const app = express();
const server = createServer(app);

// Attach socket.io
ConnectToSocket(server);

// App configuration
app.set("port", process.env.PORT || 8000);

// Middlewares
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.get("/home", (req, res) => {
  res.status(200).json({ hello: "World" });
});

// ✅ USER ROUTES
app.use("/api/users", userRoutes);

// Start server after DB connection
const start = async () => {
  try {
    const connectionDB = await mongoose.connect(
      "mongodb+srv://ayushmansahoo648_db_user:rTsGZJcRUbyaAgiN@vedioconferencing.zdswurk.mongodb.net/?appName=vedioconferencing"
    );

    console.log(
      `✅ MongoDB Connected DB Host: ${connectionDB.connection.host}`
    );

    server.listen(app.get("port"), () => {
      console.log(`🚀 Server running on port ${app.get("port")}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

start();