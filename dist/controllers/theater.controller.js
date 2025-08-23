"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreeningsByTheaterAndMovie = exports.getMovies = exports.getAllSeats = exports.createSeats = exports.createScreening = exports.createMovie = exports.getTheaters = exports.createTheater = void 0;
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
const createMovie = async (req, res) => {
    console.log('request is' + req);
    const { title, durationMin, rating, description, cast, director } = req.body;
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
