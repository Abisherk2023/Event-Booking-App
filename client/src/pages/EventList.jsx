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

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Upcoming Events</h2>
      {events.map((event) => {
        const seatsLeft = event.capacity - event.seatsBooked;
        return (
          <div key={event._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{event.title}</h3>
            <p>{event.location} — {new Date(event.date).toLocaleDateString()}</p>
            <p>{seatsLeft > 0 ? `${seatsLeft} seats left` : 'Fully booked'}</p>
            <Link to={`/events/${event._id}`}>View Details</Link>
          </div>
        );
      })}
    </div>
  );
}

export default EventList;