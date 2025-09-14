"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreeningsByTheaterAndMovie = exports.getMovies = exports.getAllSeats = exports.createSeats = exports.getAllScreenings = exports.createScreening = exports.deleteMovie = exports.updateMovie = exports.createMovie = exports.getTheaters = exports.deleteTheater = exports.updateTheater = exports.createTheater = void 0;
const prisma_1 = require("../prisma");
// ===== THEATER CONTROLLERS =====
// Create a new theater
const createTheater = async (req, res) => {
    const { name, location } = req.body;
    try {
        const theater = await prisma_1.prisma.theater.create({ data: { name, location } });
        res.json(theater);
    }
    catch (err) {
        res.status(400).json({ error: "Could not create theater" });
    }
};
exports.createTheater = createTheater;
// Update a theater
const updateTheater = async (req, res) => {
    const theaterId = Number(req.params.id);
    const { name, location } = req.body;
    try {
        const updatedTheater = await prisma_1.prisma.theater.update({
            where: { id: theaterId },
            data: { name, location },
        });
        res.json(updatedTheater);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "Could not update theater" });
    }
};
exports.updateTheater = updateTheater;
// Delete a theater
const deleteTheater = async (req, res) => {
    const theaterId = Number(req.params.id);
    try {
        await prisma_1.prisma.theater.delete({
            where: { id: theaterId },
        });
        res.json({ message: `Theater ${theaterId} deleted successfully` });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "Could not delete theater" });
    }
};
exports.deleteTheater = deleteTheater;
// List all theaters with their screenings and movies
const getTheaters = async (_req, res) => {
    const theaters = await prisma_1.prisma.theater.findMany({
        include: {
            screenings: {
                include: {
                    movie: true,
                    seats: true,
                },
            },
        },
    });
    res.json(theaters);
};
exports.getTheaters = getTheaters;
// Create a new movie
const createMovie = async (req, res) => {
    const { title, durationMin, rating, description, cast, director } = req.body;
    const genre = typeof req.body.genre === "string" && req.body.genre.trim() !== ""
        ? req.body.genre
        : "";
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : null;
    try {
        const movie = await prisma_1.prisma.movie.create({
            data: {
                title,
                durationMin: Number(durationMin),
                rating: rating ? Number(rating) : 0,
                description,
                cast,
                director,
                genre,
                posterUrl,
            },
        });
        res.json(movie);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "Could not create movie" });
    }
};
exports.createMovie = createMovie;
// Update an existing movie
const updateMovie = async (req, res) => {
    const movieId = Number(req.params.id);
    const { title, durationMin, rating, description, cast, director } = req.body;
    const genre = typeof req.body.genre === "string" && req.body.genre.trim() !== ""
        ? req.body.genre
        : "";
    const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    try {
        const updatedMovie = await prisma_1.prisma.movie.update({
            where: { id: movieId },
            data: {
                title,
                durationMin: durationMin ? Number(durationMin) : undefined,
                rating: rating ? Number(rating) : undefined,
                description,
                cast,
                director,
                genre,
                ...(posterUrl && { posterUrl }),
            },
        });
        res.json(updatedMovie);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "Could not update movie" });
    }
};
exports.updateMovie = updateMovie;
// Delete a movie
const deleteMovie = async (req, res) => {
    const movieId = Number(req.params.id);
    try {
        await prisma_1.prisma.movie.delete({
            where: { id: movieId },
        });
        res.json({ message: `Movie ${movieId} deleted successfully` });
    }
    catch (err) {
        console.error("Delete movie error:", err);
        res.status(400).json({ error: "Could not delete movie" });
    }
};
exports.deleteMovie = deleteMovie;
// Schedule a screening (movie + theater + time)
const createScreening = async (req, res) => {
    const { movieId, theaterId, startTime } = req.body;
    try {
        const screening = await prisma_1.prisma.screening.create({
            data: {
                movieId,
                theaterId,
                startTime: new Date(startTime),
            },
        });
        res.json(screening);
    }
    catch (err) {
        res.status(400).json({ error: "Could not create screening" });
    }
};
exports.createScreening = createScreening;
// theater.controller.ts
const getAllScreenings = async (req, res) => {
    try {
        const screenings = await prisma_1.prisma.screening.findMany({
            include: {
                movie: true,
                theater: true,
            },
        });
        res.json(screenings);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Could not fetch screenings" });
    }
};
exports.getAllScreenings = getAllScreenings;
const createSeats = async (req, res) => {
    const screeningId = Number(req.params.id); // get ID from URL
    const { seatNumbers } = req.body; // seatNumbers = ["A1", "A2", "B1", ...]
    if (!screeningId || !seatNumbers?.length) {
        return res
            .status(400)
            .json({ error: "screeningId and seatNumbers are required" });
    }
    try {
        const seatsData = seatNumbers.map((num) => ({
            screeningId,
            seatNumber: num,
        }));
        await prisma_1.prisma.seat.createMany({ data: seatsData });
        res.json({
            message: `${seatNumbers.length} seats created for screening ${screeningId}`,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Could not create seats" });
    }
};
exports.createSeats = createSeats;
// Get all seats for a screening (include booked seats)
const getAllSeats = async (req, res) => {
    const screeningId = Number(req.params.id);
    try {
        const seats = await prisma_1.prisma.seat.findMany({
            where: { screeningId },
            select: {
                id: true,
                seatNumber: true,
                isBooked: true, // return booking status
            },
        });
        res.json(seats);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "Could not fetch seats" });
    }
};
exports.getAllSeats = getAllSeats;
// Get all movies
const getMovies = async (_req, res) => {
    try {
        const movies = await prisma_1.prisma.movie.findMany({
            include: {
                screenings: true, // optional if you want to show screening times
            },
        });
        res.json(movies);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Could not fetch movies" });
    }
};
exports.getMovies = getMovies;
const getScreeningsByTheaterAndMovie = async (req, res) => {
    const theaterId = Number(req.params.theaterId);
    const movieId = Number(req.query.movieId);
    const screenings = await prisma_1.prisma.screening.findMany({
        where: { theaterId, movieId },
    });
    res.json(screenings);
};
exports.getScreeningsByTheaterAndMovie = getScreeningsByTheaterAndMovie;
