import { Request, Response } from "express";
import { prisma } from "../prisma";
import { getBaseUrl } from "../utils/getBaseUrl";

// ===== THEATER CONTROLLERS =====

// Create a new theater
export const createTheater = async (req: Request, res: Response) => {
  const { name, location } = req.body;
  try {
    const theater = await prisma.theater.create({ data: { name, location } });
    res.json(theater);
  } catch (err) {
    res.status(400).json({ error: "Could not create theater" });
  }
};

// Update a theater
export const updateTheater = async (req: Request, res: Response) => {
  const theaterId = Number(req.params.id);
  const { name, location } = req.body;

  try {
    const updatedTheater = await prisma.theater.update({
      where: { id: theaterId },
      data: { name, location },
    });
    res.json(updatedTheater);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Could not update theater" });
  }
};

// Delete a theater
export const deleteTheater = async (req: Request, res: Response) => {
  const theaterId = Number(req.params.id);

  try {
    await prisma.theater.delete({
      where: { id: theaterId },
    });
    res.json({ message: `Theater ${theaterId} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Could not delete theater" });
  }
};

// List all theaters with their screenings and movies
export const getTheaters = async (_req: Request, res: Response) => {
  const theaters = await prisma.theater.findMany({
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

// Create a new movie
export const createMovie = async (req: Request, res: Response) => {
  const { title, durationMin, rating, description, cast, director } = req.body;
  const genre =
    typeof req.body.genre === "string" && req.body.genre.trim() !== ""
      ? req.body.genre
      : "";
  const posterUrl = req.file
    ? `${getBaseUrl()}/uploads/${req.file.filename}`
    : null;

  try {
    const movie = await prisma.movie.create({
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
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Could not create movie" });
  }
};

// Update an existing movie
export const updateMovie = async (req: Request, res: Response) => {
  const movieId = Number(req.params.id);
  const { title, durationMin, rating, description, cast, director } = req.body;
  const genre =
    typeof req.body.genre === "string" && req.body.genre.trim() !== ""
      ? req.body.genre
      : "";
  const posterUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const updatedMovie = await prisma.movie.update({
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
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Could not update movie" });
  }
};

// Delete a movie
export const deleteMovie = async (req: Request, res: Response) => {
  const movieId = Number(req.params.id);

  try {
    await prisma.movie.delete({
      where: { id: movieId },
    });
    res.json({ message: `Movie ${movieId} deleted successfully` });
  } catch (err) {
    console.error("Delete movie error:", err);
    res.status(400).json({ error: "Could not delete movie" });
  }
};

// Schedule a screening (movie + theater + time)
export const createScreening = async (req: Request, res: Response) => {
  const { movieId, theaterId, startTime } = req.body;
  try {
    const screening = await prisma.screening.create({
      data: {
        movieId,
        theaterId,
        startTime: new Date(startTime),
      },
    });
    res.json(screening);
  } catch (err) {
    res.status(400).json({ error: "Could not create screening" });
  }
};

// theater.controller.ts
export const getAllScreenings = async (req: Request, res: Response) => {
  try {
    const screenings = await prisma.screening.findMany({
      include: {
        movie: true,
        theater: true,
      },
    });
    res.json(screenings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch screenings" });
  }
};

export const createSeats = async (req: Request, res: Response) => {
  const screeningId = Number(req.params.id); // get ID from URL
  const { seatNumbers } = req.body; // seatNumbers = ["A1", "A2", "B1", ...]

  if (!screeningId || !seatNumbers?.length) {
    return res
      .status(400)
      .json({ error: "screeningId and seatNumbers are required" });
  }

  try {
    const seatsData = seatNumbers.map((num: string) => ({
      screeningId,
      seatNumber: num,
    }));

    await prisma.seat.createMany({ data: seatsData });

    res.json({
      message: `${seatNumbers.length} seats created for screening ${screeningId}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create seats" });
  }
};
// Get all seats for a screening (include booked seats)
export const getAllSeats = async (req: Request, res: Response) => {
  const screeningId = Number(req.params.id);
  try {
    const seats = await prisma.seat.findMany({
      where: { screeningId },
      select: {
        id: true,
        seatNumber: true,
        isBooked: true, // return booking status
      },
    });
    res.json(seats);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Could not fetch seats" });
  }
};

// Get all movies
export const getMovies = async (_req: Request, res: Response) => {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        screenings: true, // optional if you want to show screening times
      },
    });
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch movies" });
  }
};

export const getScreeningsByTheaterAndMovie = async (
  req: Request,
  res: Response
) => {
  const theaterId = Number(req.params.theaterId);
  const movieId = Number(req.query.movieId);

  const screenings = await prisma.screening.findMany({
    where: { theaterId, movieId },
  });

  res.json(screenings);
};
