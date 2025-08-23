/*
  Warnings:

  - You are about to drop the column `movie` on the `Booking` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[seatId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `screeningId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "movie",
ADD COLUMN     "screeningId" INTEGER NOT NULL,
ADD COLUMN     "seatId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Theater" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Theater_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Movie" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Screening" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "theaterId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Screening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Seat" (
    "id" SERIAL NOT NULL,
    "screeningId" INTEGER NOT NULL,
    "seatNumber" TEXT NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_seatId_key" ON "public"."Booking"("seatId");

-- AddForeignKey
ALTER TABLE "public"."Screening" ADD CONSTRAINT "Screening_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Screening" ADD CONSTRAINT "Screening_theaterId_fkey" FOREIGN KEY ("theaterId") REFERENCES "public"."Theater"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Seat" ADD CONSTRAINT "Seat_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "public"."Screening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_screeningId_fkey" FOREIGN KEY ("screeningId") REFERENCES "public"."Screening"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "public"."Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
