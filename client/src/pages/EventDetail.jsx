import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setMessage('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBooking(true);
    setMessage('');

    try {
      await api.post('/bookings', { eventId: id });
      setMessage('Booking confirmed!');
      fetchEvent(); // refresh seat count
    } catch (err) {
      setMessage(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!event) return <p>Event not found</p>;

  const seatsLeft = event.capacity - event.seatsBooked;

  return (
    <div>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>{event.location} — {new Date(event.date).toLocaleDateString()}</p>
      <p>{seatsLeft > 0 ? `${seatsLeft} seats left` : 'Fully booked'}</p>

      <button onClick={handleBook} disabled={booking || seatsLeft <= 0}>
        {seatsLeft <= 0 ? 'Fully Booked' : booking ? 'Booking...' : 'Book Now'}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default EventDetail;