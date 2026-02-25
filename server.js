// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

// Load environment variables early
dotenv.config();

// Initialize Express application
const app = express();

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Middleware
app.use(cors());
app.use(express.json());

// Connexion BDD
connectDB();

// Routes
app.use("/api/users", require("./routes/userRoutes"));

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
