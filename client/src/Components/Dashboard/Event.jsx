import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast/ToastContext';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    async function fetchEventDetails() {
      try {
        const res = await fetch('/api/eventscreated', {
          method: 'GET',
        });
        const data = await res.json();
        if (res.ok) {
          setEvents(data.data);
        } else {
          showToast(data.error || 'Failed to load events', 'error');
        }
      } catch {
        showToast('Failed to load events', 'error');
      } finally {
        setIsDataFetched(true);
      }
    }

    fetchEventDetails();
  }, [showToast]);

  if (!isDataFetched) {
    return (
      <p className="text-xl font-mono font-bold text-white">
        loading...
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-lg font-semibold text-white">No upcoming events yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to host one!</p>
      </div>
    );
  }

  return <Event events={events} />;
};

const Event = ({ events }) => {
  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <div
          key={event._id || event.id}
          className="rounded-lg bg-white/5 border border-white/10 p-4"
        >
          <h5 className="text-lg font-bold tracking-tight text-white mb-1">
            {event.title}
          </h5>
          <p className="text-sm text-gray-400 mb-3">
            {event.description}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
            <span>📍 {event.location}</span>
            <span>📆 {event.date}</span>
            <span>🕒 {event.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventList;
