import React, { useEffect, useState } from "react";
import "../../CSS/cards.css";
import { useNavigate } from "react-router-dom";
import { useToast } from "../Toast/ToastContext";

const ECO_TIERS = [
  { min: 1000, label: "Platinum Eco Warrior", color: "#B9F2FF" },
  { min: 500, label: "Gold Environment Champion", color: "#FFD700" },
  { min: 150, label: "Silver Contributor", color: "#C0C0C0" },
  { min: 0, label: "Bronze Beginner", color: "#CD7F32" },
];

const getEcoTier = (points) => ECO_TIERS.find((tier) => points >= tier.min) || ECO_TIERS[ECO_TIERS.length - 1];

const ITEM_ICONS = {
  Cardboard: "📦",
  Glass: "🍾",
  Metal: "🔩",
  Paper: "📄",
  Plastic: "🧴",
  Trash: "🗑️",
};

const LOADING_MESSAGE = 'Loading...';
const UNAUTHORIZED_MESSAGE = 'Unauthorized access';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    async function fetchUserDetails() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("/api/profile", {
          method: 'GET',
          headers: {
            "x-access-token": token,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          const data = await response.json();
          showToast(data.error || UNAUTHORIZED_MESSAGE, 'error');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        showToast('Failed to fetch user details', 'error');
      }
    }

    async function fetchHistory() {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("/api/scan-history", {
          headers: { "x-access-token": token },
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching scan history:', error);
      } finally {
        setHistoryLoading(false);
      }
    }

    fetchUserDetails();
    fetchHistory();
  }, [navigate, showToast]);

  if (!user) {
    return <div className="text-2xl font-mono font-bold p-4 text-white">{LOADING_MESSAGE}</div>;
  }

  const tier = getEcoTier(user.points || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
      <div className="dash-card">
        <div className="dash-card-inner">
          <h1 className="font-sans font-bold text-3xl sm:text-4xl tracking-tight text-white">
            {user.name}
          </h1>
          <p className="text-zinc-400 mt-1 mb-3">@{user.username} · {user.locality}</p>
          <span
            className="inline-block w-fit px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${tier.color}22`, color: tier.color, border: `1px solid ${tier.color}` }}
          >
            {tier.label} · {user.points || 0} pts
          </span>
        </div>
      </div>

      <div className="dash-card mt-4">
        <div className="dash-card-inner">
          <h2 className="text-white font-bold text-xl mb-1">Scan History</h2>
          <p className="text-zinc-400 text-sm mb-5">Your last {history.length || 10} scanned items.</p>

          {historyLoading ? (
            <p className="text-zinc-500 text-sm">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-zinc-500 text-sm">No scans yet — go scan an item to earn points!</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((entry) => (
                <div
                  key={entry._id}
                  className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{ITEM_ICONS[entry.itemName] || "♻️"}</span>
                    <span className="text-white text-sm font-medium">{entry.itemName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-purple-300 text-sm font-semibold">{entry.points} pts</span>
                    <span className="text-zinc-500 text-xs">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
