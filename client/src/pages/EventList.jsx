import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return <p className="page-container">Loading events...</p>;
  if (error) return <p className="page-container error-text">{error}</p>;

  return (
    <div className="page-container">
      <h2>Upcoming Events</h2>
      {events.map((event) => {
        const seatsLeft = event.capacity - event.seatsBooked;
        return (
          <div key={event._id} className="event-card">
            <h3>{event.title}</h3>
            <p>{event.location} — {new Date(event.date).toLocaleDateString()}</p>
            <p className={seatsLeft > 0 ? 'seats-left' : 'seats-full'}>
              {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Fully booked'}
            </p>
            <Link to={`/events/${event._id}`}>View Details</Link>
          </div>
        );
      })}
    </div>
  );
}

export default EventList;