import React, { useEffect, useState } from 'react'
import './StyleEvent.css';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../Toast/ToastContext';

export default function App() {

  const navigate = useNavigate();
  const showToast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('/api/profile', {
          headers: { 'x-access-token': token },
        });
        const data = await res.json();
        if (!res.ok || !data.user?.isAdmin) {
          showToast('Only admins can create events', 'error');
          navigate('/events');
          return;
        }
        setCheckingAccess(false);
      } catch {
        showToast('Unable to verify access', 'error');
        navigate('/events');
      }
    }

    checkAdmin();
  }, [navigate, showToast]);

  async function registerEvent(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify({
          title,
          description,
          date,
          time,
          location
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Event added successfully', 'success');
        navigate('/events');
      } else {
        showToast(data.error || 'Failed to create event', 'error');
      }
    } catch {
      showToast('Server error. Try again later.', 'error');
    }

    setSubmitting(false);
  }

  if (checkingAccess) {
    return (
      <div className="containers">
        <p className="text-white text-lg mt-10">Checking access...</p>
      </div>
    );
  }

  return (
    <div className="containers">
      <div className="heading">Host an Event!</div>
      <div id="cards">
        <div id="cards__content">
          <form onSubmit={registerEvent}>
            <div className="ipDiv" id="nameIp">
              <label htmlFor="ename">Event Name</label><br />
              <input id="ename" type="text" name="ename" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="ipDiv">
              <label htmlFor="desc">Event Description</label><br />
              <textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} cols={5} name="desc" required />
            </div>
            <div className="ipDiv">
              <label htmlFor="locality">Locality</label><br />
              <input id="locality" value={location} onChange={(e) => setLocation(e.target.value)} type="text" name="locality" required />
            </div>
            <div className="ipDiv">
              <label htmlFor="date">Date</label><br />
              <input id="date" value={date} onChange={(e) => setDate(e.target.value)} type='date' name="date" required></input>
            </div>
            <div className="ipDiv">
              <label htmlFor="time">Time</label><br />
              <input id="time" value={time} onChange={(e) => setTime(e.target.value)} type="time" name="time" required />
            </div>
            <div className="submitBtn">
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
