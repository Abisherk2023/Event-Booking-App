import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

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

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <p className="page-container">Loading your bookings...</p>;
  if (error) return <p className="page-container error-text">{error}</p>;
  if (bookings.length === 0) return <p className="page-container">You haven't booked any events yet.</p>;

  return (
    <div className="page-container">
      <h2>My Bookings</h2>
      {bookings.map((booking) => (
        <div key={booking._id} className="event-card">
          <h3>{booking.event.title}</h3>
          <p>{booking.event.location} — {new Date(booking.event.date).toLocaleDateString()}</p>
          <p>
            <span className={`status-badge ${booking.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled'}`}>
              {booking.status}
            </span>
          </p>
          <Link to={`/events/${booking.event._id}`}>View Event</Link>
          {booking.status === 'confirmed' && (
            <button
              className="btn-secondary"
              onClick={() => handleCancel(booking._id)}
              disabled={cancellingId === booking._id}
              style={{ marginLeft: '10px' }}
            >
              {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default MyBookings;