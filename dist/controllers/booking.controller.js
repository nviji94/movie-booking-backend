"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.getBookings = exports.bookSeats = void 0;
const prisma_1 = require("../prisma");
// Book multiple seats in a screening
const bookSeats = async (req, res) => {
    // Inside bookSeats
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    const screeningId = Number(req.params.id);
    const { seatIds } = req.body;
    if (!seatIds || seatIds.length === 0) {
        return res.status(400).json({ error: "No seats selected" });
    }
    try {
        const bookedSeats = [];
        for (const seatId of seatIds) {
            const seat = await prisma_1.prisma.seat.findUnique({ where: { id: seatId } });
            if (!seat || seat.screeningId !== screeningId) {
                return res.status(400).json({ error: `Invalid seat ${seatId}` });
            }
            if (seat.isBooked) {
                return res
                    .status(400)
                    .json({ error: `Seat ${seat.seatNumber} already booked` });
            }
            // Mark seat as booked
            await prisma_1.prisma.seat.update({
                where: { id: seatId },
                data: { isBooked: true },
            });
            // Create booking
            await prisma_1.prisma.booking.create({
                data: { userId: req.user.userId, screeningId, seatId },
            });
            bookedSeats.push(seatId);
        }
        // Emit real-time update
        req.app
            .get("io")
            .emit("seatsBooked", { screeningId, seatIds: bookedSeats });
        res.json({ message: "Seats booked successfully", seats: bookedSeats });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to book seats" });
    }
};
exports.bookSeats = bookSeats;
// Get bookings for the logged-in user
const getBookings = async (req, res) => {
    try {
        console.log("fetching bookings for user " + req.user?.userId);
        const userId = req.user?.userId; // make sure user ID is attached to request by auth middleware
        const bookings = await prisma_1.prisma.booking.findMany({
            where: { userId }, // filter by logged-in user
            include: {
                user: true,
                screening: { include: { movie: true, theater: true } },
                seat: true,
            },
        });
        res.json(bookings);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get bookings" });
    }
};
exports.getBookings = getBookings;
// ❌ Cancel booking (one or more seats in a screening)
const cancelBooking = async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized" });
    const screeningId = Number(req.params.id);
    const { seatIds } = req.body;
    if (!seatIds || seatIds.length === 0) {
        return res
            .status(400)
            .json({ error: "No seats specified for cancellation" });
    }
    try {
        // Ensure these bookings belong to the logged-in user
        const bookings = await prisma_1.prisma.booking.findMany({
            where: {
                screeningId,
                seatId: { in: seatIds },
                userId: req.user.userId,
            },
        });
        if (bookings.length === 0) {
            return res.status(404).json({ error: "No matching bookings found" });
        }
        // Delete bookings + free seats
        const bookingIds = bookings.map((b) => b.id);
        await prisma_1.prisma.booking.deleteMany({
            where: { id: { in: bookingIds } },
        });
        await prisma_1.prisma.seat.updateMany({
            where: { id: { in: seatIds } },
            data: { isBooked: false },
        });
        // Emit socket event for FE seat update
        req.app.get("io").emit("seatsCancelled", { screeningId, seatIds });
        res.json({ message: "Booking(s) cancelled successfully", seatIds });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to cancel booking" });
    }
};
exports.cancelBooking = cancelBooking;
