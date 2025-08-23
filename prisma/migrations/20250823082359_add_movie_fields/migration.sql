-- AlterTable
ALTER TABLE "public"."Movie" ADD COLUMN     "cast" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "director" TEXT,
ADD COLUMN     "posterUrl" TEXT,
ADD COLUMN     "rating" INTEGER DEFAULT 0;
