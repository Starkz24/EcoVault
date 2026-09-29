import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../Toast/ToastContext";
import "../../CSS/cards.css";

const authHeaders = () => ({
  "x-access-token": localStorage.getItem("token"),
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const showToast = useToast();

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes] = await Promise.all([
        fetch("/api/admin/users", { headers: authHeaders() }),
        fetch("/api/eventscreated"),
      ]);

      const usersData = await usersRes.json();
      const eventsData = await eventsRes.json();

      if (usersRes.ok) setUsers(usersData.data || []);
      if (eventsRes.ok) setEvents(eventsData.data || []);
    } catch {
      showToast("Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/profile", { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok || !data.user?.isAdmin) {
          showToast("Admin access required", "error");
          navigate("/dashboard");
          return;
        }
        setCurrentEmail(data.user.email);
        setCheckingAccess(false);
        loadData();
      } catch {
        showToast("Unable to verify access", "error");
        navigate("/dashboard");
      }
    }

    checkAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleAdmin = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-admin`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isAdmin: data.data.isAdmin } : u))
        );
        showToast("User role updated", "success");
      } else {
        showToast(data.error || "Failed to update role", "error");
      }
    } catch {
      showToast("Failed to update role", "error");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
        showToast("Event deleted", "success");
      } else {
        showToast(data.error || "Failed to delete event", "error");
      }
    } catch {
      showToast("Failed to delete event", "error");
    }
  };

  if (checkingAccess) {
    return <p className="text-white text-center mt-10">Checking access...</p>;
  }

  const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <Link
          to="/event"
          className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 hover:opacity-90 transition-opacity"
        >
          + Create Event
        </Link>
      </div>

      {loading ? (
        <p className="text-zinc-400">Loading admin data...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="dash-card">
              <div className="dash-card-inner">
                <p className="text-3xl font-bold text-white">{users.length}</p>
                <p className="text-xs text-zinc-400 mt-1">Total Users</p>
              </div>
            </div>
            <div className="dash-card">
              <div className="dash-card-inner">
                <p className="text-3xl font-bold text-white">{totalPoints}</p>
                <p className="text-xs text-zinc-400 mt-1">Total Points Earned</p>
              </div>
            </div>
            <div className="dash-card">
              <div className="dash-card-inner">
                <p className="text-3xl font-bold text-white">{events.length}</p>
                <p className="text-xs text-zinc-400 mt-1">Total Events</p>
              </div>
            </div>
          </div>

          <div className="dash-card mb-8">
            <div className="dash-card-inner">
              <h2 className="text-white font-bold text-xl mb-4">Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="py-2 pr-4 text-zinc-400 text-sm font-semibold">Name</th>
                      <th className="py-2 pr-4 text-zinc-400 text-sm font-semibold">Username</th>
                      <th className="py-2 pr-4 text-zinc-400 text-sm font-semibold">Email</th>
                      <th className="py-2 pr-4 text-zinc-400 text-sm font-semibold">Locality</th>
                      <th className="py-2 pr-4 text-zinc-400 text-sm font-semibold">Points</th>
                      <th className="py-2 pr-4 text-zinc-400 text-sm font-semibold">Role</th>
                      <th className="py-2 pr-4 text-zinc-400 text-sm font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="border-b border-white/5">
                        <td className="py-2 pr-4 text-white text-sm">{u.name}</td>
                        <td className="py-2 pr-4 text-zinc-300 text-sm">@{u.username}</td>
                        <td className="py-2 pr-4 text-zinc-300 text-sm">{u.email}</td>
                        <td className="py-2 pr-4 text-zinc-300 text-sm">{u.locality}</td>
                        <td className="py-2 pr-4 text-white text-sm font-semibold">{u.points || 0}</td>
                        <td className="py-2 pr-4 text-sm">
                          {u.isAdmin ? (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-400/30">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-zinc-400 border border-white/10">
                              User
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-4 text-sm">
                          {u.email === currentEmail ? (
                            <span className="text-xs text-zinc-500 italic">You</span>
                          ) : (
                            <button
                              onClick={() => handleToggleAdmin(u._id)}
                              className="text-xs font-medium text-purple-300 hover:text-purple-200 underline"
                            >
                              {u.isAdmin ? "Remove Admin" : "Make Admin"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-inner">
              <h2 className="text-white font-bold text-xl mb-4">Events</h2>
              {events.length === 0 ? (
                <p className="text-zinc-400 text-sm">No events created yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {events.map((ev) => (
                    <div
                      key={ev._id}
                      className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-4"
                    >
                      <div>
                        <p className="text-white font-semibold">{ev.title}</p>
                        <p className="text-zinc-400 text-xs mt-1">
                          📍 {ev.location} · 📆 {ev.date} · 🕒 {ev.time}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="text-xs font-medium text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
