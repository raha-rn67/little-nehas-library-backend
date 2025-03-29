require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || '1f3d5a7b9c2e4f6h8j0k2m4n6p8r0s2t4u6v8w0x2y4z',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));

// Route to check authentication status
app.get("/api/check-auth", (req, res) => {
  res.json({ 
    isAuthenticated: req.session.isAuthenticated || false 
  });
});

// Route for password verification
app.post("/api/verify-password", (req, res) => {
  const { password } = req.body;
  const correctPassword = process.env.DB_PASSWORD;

  if (password === correctPassword) {
    // Set session as authenticated
    req.session.isAuthenticated = true;
    res.json({ success: true, message: "Authentication successful" });
  } else {
    res.status(401).json({ success: false, message: "Incorrect password" });
  }
});

// Logout route
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Could not log out" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Middleware to protect routes
const requireAuth = (req, res, next) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// Directly import book routes and apply auth middleware
const bookRoutes = require("./routes/bookRoutes");
app.use("/api/books", requireAuth, bookRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Library API is running...");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});