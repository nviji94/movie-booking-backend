"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Controllers
const auth_controller_1 = require("./controllers/auth.controller");
const booking_controller_1 = require("./controllers/booking.controller");
const theater_controller_1 = require("./controllers/theater.controller");
// Middleware
const auth_middleware_1 = require("./middleware/auth.middleware");
const upload_middleware_1 = require("./middleware/upload.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "http://localhost:3000", credentials: true }, // allow frontend
});
// Attach io to app for controllers
app.set("io", io);
// ===== CORS =====
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static("uploads"));
// =======================
// AUTH ROUTES
// =======================
app.post("/register", auth_controller_1.register);
app.post("/login", auth_controller_1.login);
app.post("/auth/google", auth_controller_1.googleLogin);
app.get("/me", auth_middleware_1.authMiddleware, auth_controller_1.getMe);
// =======================
// THEATER & MOVIE ROUTES
// =======================
app.post("/theaters", auth_middleware_1.authMiddleware, theater_controller_1.createTheater);
app.get("/theaters", theater_controller_1.getTheaters);
app.post("/movies", auth_middleware_1.authMiddleware, upload_middleware_1.upload.single("poster"), theater_controller_1.createMovie);
app.post("/screenings", auth_middleware_1.authMiddleware, theater_controller_1.createScreening);
app.post("/screenings/:id/seats", auth_middleware_1.authMiddleware, theater_controller_1.createSeats);
app.get("/screenings/:id/seats", theater_controller_1.getAllSeats);
app.get("/movies", theater_controller_1.getMovies);
app.get("/theaters/:theaterId/screenings", theater_controller_1.getScreeningsByTheaterAndMovie);
// =======================
// BOOKING ROUTES
// =======================
app.post("/screenings/:id/book", auth_middleware_1.authMiddleware, booking_controller_1.bookSeats);
app.get("/bookings", booking_controller_1.getBookings);
app.delete("/bookings/:id", auth_middleware_1.authMiddleware, booking_controller_1.cancelBooking);
// =======================
// SOCKET.IO
// =======================
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});
// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
