import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

// Controllers
import {
  register,
  login,
  googleLogin,
  getMe,
} from "./controllers/auth.controller";
import {
  bookSeats,
  getBookings,
  cancelBooking,
} from "./controllers/booking.controller";
import {
  createTheater,
  getTheaters,
  createMovie,
  createScreening,
  createSeats,
  getAllSeats,
  getMovies,
  getScreeningsByTheaterAndMovie,
} from "./controllers/theater.controller";

// Middleware
import { authMiddleware } from "./middleware/auth.middleware";
import { upload } from "./middleware/upload.middleware";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", credentials: true }, // allow frontend
});

// Attach io to app for controllers
app.set("io", io);

// ===== CORS =====
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// =======================
// AUTH ROUTES
// =======================
app.post("/register", register);
app.post("/login", login);
app.post("/auth/google", googleLogin);
app.get("/me", authMiddleware, getMe);

// =======================
// THEATER & MOVIE ROUTES
// =======================
app.post("/theaters", authMiddleware, createTheater);
app.get("/theaters", getTheaters);

app.post("/movies", authMiddleware, upload.single("poster"), createMovie);

app.post("/screenings", authMiddleware, createScreening);

app.post("/screenings/:id/seats", authMiddleware, createSeats);

app.get("/screenings/:id/seats", getAllSeats);

app.get("/movies", getMovies);

app.get("/theaters/:theaterId/screenings", getScreeningsByTheaterAndMovie);

// =======================
// BOOKING ROUTES
// =======================
app.post("/screenings/:id/book", authMiddleware, bookSeats);
app.get("/bookings", getBookings);
app.delete("/bookings/:id", authMiddleware, cancelBooking);

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
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
