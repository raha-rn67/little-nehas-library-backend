require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db"); // Import MongoDB connection
const cors = require("cors");
const session = require("express-session");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Setup (Allow GitHub Pages)
app.use(
  cors({
    origin: 'https://raha-rn67.github.io',
    credentials: true, // Allow cookies/session sharing
  })
);
app.use(express.json());

// ✅ Session Middleware (Fix for GitHub Pages)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Ensure HTTPS is used
      httpOnly: true,
      sameSite: "None", // Required for cross-origin authentication
    },
  })
);

// ✅ Authentication Routes
app.get("/api/check-auth", (req, res) => {
  res.json({ isAuthenticated: req.session.isAuthenticated || false });
});

app.post("/api/verify-password", (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.DB_PASSWORD;

  if (password === correctPassword) {
    req.session.isAuthenticated = true;
    res.json({ success: true, message: "Authentication successful" });
  } else {
    res.status(401).json({ success: false, message: "Incorrect password" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Could not log out" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// ✅ Middleware to Protect Routes
const requireAuth = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// ✅ Book Routes (Protected)
app.use("/api/books", requireAuth, bookRoutes);

app.get("/", (req, res) => {
  res.send("Library API is running...");
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
