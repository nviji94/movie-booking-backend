// prisma/seed.ts
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Create 3 Theaters
  await prisma.theater.createMany({
    data: [
      { name: "Cineplex Downtown", location: "123 Main St" },
      { name: "Grand Cinema", location: "456 Elm St" },
      { name: "Movie Palace", location: "789 Oak Ave" },
    ],
  });
  console.log("Theaters created");

  // 2. Create Movies
  await prisma.movie.createMany({
    data: [
      {
        title: "The Great Adventure",
        durationMin: 120,
        rating: 8,
        genre: "ACTION",
        description: "Epic action movie",
        director: "John Smith",
        cast: "Actor A, Actor B",
        posterUrl: "/uploads/The Great Adventure.jpg",
      },
      {
        title: "Romantic Escape",
        durationMin: 95,
        rating: 7,
        genre: "ROMANCE",
        description: "Heartwarming romance",
        director: "Jane Doe",
        cast: "Actor C, Actor D",
        posterUrl: "/uploads/Romantic Escapes.jpg",
      },
      {
        title: "Mystery Mansion",
        durationMin: 110,
        rating: 9,
        genre: "MYSTERY",
        description: "Thrilling mystery movie",
        director: "Alice Johnson",
        cast: "Actor E, Actor F",
        posterUrl: "/uploads/Mystery Mansion.jpg",
      },
      {
        title: "Laugh Out Loud",
        durationMin: 100,
        rating: 8,
        genre: "COMEDY",
        description: "Hilarious comedy full of laughs",
        director: "Bob Brown",
        cast: "Actor G, Actor H",
        posterUrl: "/uploads/Laugh Out Loud.jpg",
      },
      {
        title: "Family Ties",
        durationMin: 105,
        rating: 7,
        genre: "DRAMA",
        description: "Touching story about family and love",
        director: "Carol White",
        cast: "Actor I, Actor J",
        posterUrl: "/uploads/Family Ties.jpg",
      },
      {
        title: "Fast & Furious Fun",
        durationMin: 115,
        rating: 8,
        genre: "ACTION",
        description: "High-octane thrills with speed and stunts",
        director: "David Black",
        cast: "Actor K, Actor L",
        posterUrl: "/uploads/Fast & Furious Fun.jpg",
      },
    ],
  });
  console.log("Movies created");

  // 3. Fetch movies and theaters for references
  const theaters = await prisma.theater.findMany();
  const movies = await prisma.movie.findMany();

  // 4. Create Screenings and Seats
  for (const theater of theaters) {
    for (const movie of movies) {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + Math.floor(Math.random() * 5)); // Random start time

      const screening = await prisma.screening.create({
        data: {
          movieId: movie.id,
          theaterId: theater.id,
          startTime,
        },
      });

      // 5. Create Seats for each screening
      const seatsData: Prisma.SeatCreateManyInput[] = [];
      const rows = ["A", "B", "C", "D", "E"];
      const seatsPerRow = 10;

      for (const row of rows) {
        for (let num = 1; num <= seatsPerRow; num++) {
          seatsData.push({
            screeningId: screening.id,
            seatNumber: `${row}${num}`,
          });
        }
      }

      await prisma.seat.createMany({ data: seatsData });
      console.log(
        `Created screening for movie "${movie.title}" at theater "${theater.name}" with ${seatsData.length} seats`
      );
    }
  }

  console.log("Seeding completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
