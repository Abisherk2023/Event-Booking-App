const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const protect = require('../middleware/authMiddleware');

// POST /api/bookings - book a seat (protected route)
router.post('/', protect, async (req, res) => {
  try {
    const { eventId } = req.body;

       const event = await Event.findOne({ _id: eventId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Prevent the same user from booking the same event twice
    const existingBooking = await Booking.findOne({
      user: req.userId,
      event: eventId,
      status: 'confirmed'
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this event' });
    }

    // Atomic update: only increments seatsBooked if there's still room

    // Atomic update: only increments seatsBooked if there's still room
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: { $lt: ['$seatsBooked', '$capacity'] }
      },
      { $inc: { seatsBooked: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({ message: 'Event is fully booked' });
    }

    const booking = new Booking({ user: req.userId, event: eventId });
    await booking.save();

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/my - get logged-in user's bookings (protected route)
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).populate('event');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/cancel - cancel a booking (protected route)
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Make sure the logged-in user owns this booking
    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Free up the seat on the event
    await Event.findByIdAndUpdate(booking.event, { $inc: { seatsBooked: -1 } });

    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;