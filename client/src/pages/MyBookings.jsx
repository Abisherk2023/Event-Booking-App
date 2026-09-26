import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p>{error}</p>;
  if (bookings.length === 0) return <p>You haven't booked any events yet.</p>;

  return (
    <div>
      <h2>My Bookings</h2>
      {bookings.map((booking) => (
        <div key={booking._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h3>{booking.event.title}</h3>
          <p>{booking.event.location} — {new Date(booking.event.date).toLocaleDateString()}</p>
          <p>Status: {booking.status}</p>
          <Link to={`/events/${booking.event._id}`}>View Event</Link>
        </div>
      ))}
    </div>
  );
}

export default MyBookings;