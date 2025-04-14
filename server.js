require("dotenv").config();
const express = require("express");
const app = express();
// const session = require("express-session");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Appointment = require("./models/appointment");
app.use(cookieParser());
// const {jwtAuthMiddleware, generateToken} = require("./jwt")
// const {jwtAuthMiddleware, generateToken} = require("./jwt");


// Initialize app
connectDB(); // Connect to MongoDB

// Middleware
app.use(express.json());  // Body parser
app.use(express.urlencoded({ extended: true }));
app.use(cors());          // Enable CORS
// app.use(
//     session({
//         secret: "your_secret_key",
//         resave: false,
//         saveUninitialized: true,
//     })
// );
app.use(express.static(path.join(__dirname, "public"))); // Serve static files




// Routes
app.use("/api/appointments", require("./routes/appointmentRoutes"));
// router.post('/api/appointments', jwtAuthMiddleware, createAppointment);
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// const clientRoutes = require("./routes/clientRoutes");
// const { jwtAuthMiddleware } = require("./jwt");
// app.use("/api/client", clientRoutes);




// Root route (Redirect to login)

app.get("/admin-login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin-login.html"));
});

ADMIN_USERNAME = "admin";

ADMIN_PASSWORD = "admin";

// 🔹 Admin Login API - Generates JWT Token
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Generate JWT Token
        const token = jwt.sign({ username, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Send token as HTTP-only cookie (More Secure)
        res.cookie("auth_token", token, {
            httpOnly: true, // Prevents client-side access
            secure: true, // Set `true` in production (requires HTTPS)
            sameSite: "Strict",
        });

        return res.json({ success: true, message: "Login successful!" });
    } else {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// 🔹 Middleware to Verify JWT Token
const authenticateAdmin = (req, res, next) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(403).json({ success: false, message: "Unauthorized! No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied! Not an admin." });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

// 🔹 Protected Route - Admin Dashboard
app.get("/admin-dashboard", authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin-dashboard.html"));
});

// 🔹 Admin Logout - Clears Token Cookie
app.post("/api/logout", (req, res) => {
    res.clearCookie("auth_token"); // Clear JWT token from cookies
    res.json({ success: true, message: "Logged out successfully!" });
});
// Catch-all route for other HTML pages
app.get("/:page", (req, res) => {
    const page = req.params.page;
    const allowedPages = [
        "about", "portfolio", "services",
        "contact", "book-appointment", "elements"
    ];

    if (allowedPages.includes(page)) {
        return res.sendFile(path.join(__dirname, "public", `${page}.html`));
    } else {
        res.status(404).send("Page Not Found");
    }
});
function getTodayRange() {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    return { start, end };
  }
  
  // Fetch today's, previous and upcoming appointments
  function getTodayRange() {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));
    return { start, end };
}

app.get("/api/admin/appointments", authenticateAdmin, async (req, res) => {
    try {
        const { start, end } = getTodayRange();

        // Fetch categorized appointments
        const todayAppointments = await Appointment.find({
            date: { $gte: start, $lte: end }
        });

        const previousAppointments = await Appointment.find({
            date: { $lt: start }
        });

        const upcomingAppointments = await Appointment.find({
            date: { $gt: end }
        });

        res.json({
            success: true,
            data: {
                today: todayAppointments,
                previous: previousAppointments,
                upcoming: upcomingAppointments
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
