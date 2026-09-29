import React, { useState, useEffect } from "react";
import "../../CSS/cards.css";

const Stats = () => {
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const [profileRes, leaderboardRes] = await Promise.all([
          fetch("/api/profile", { headers: { "x-access-token": token } }),
          fetch("/api/leaderboard"),
        ]);

        if (!profileRes.ok || !leaderboardRes.ok) {
          throw new Error("Failed to load stats");
        }

        const profileData = await profileRes.json();
        const leaderboardData = await leaderboardRes.json();

        const sorted = [...leaderboardData].sort((a, b) => b.points - a.points);
        const myIndex = sorted.findIndex((u) => u.username === profileData.user.username);

        setPoints(profileData.user.points || 0);
        setRank(myIndex !== -1 ? myIndex + 1 : null);
        setTotalUsers(sorted.length);
        setError(null);
      } catch (err) {
        setError("Unable to load stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="dash-card">
      <div className="dash-card-inner">
        <h3 className="text-white font-bold text-xl mb-1">Your Contributions</h3>
        <p className="text-zinc-400 text-sm mb-5 flex-1">
          Track your impact by actively collecting and disposing of waste.
        </p>

        {loading ? (
          <p className="text-zinc-500 text-sm">Loading...</p>
        ) : error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-bold text-white">{points}</p>
              <p className="text-xs text-zinc-400 mt-1">Total Points</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{rank ? `#${rank}` : "—"}</p>
              <p className="text-xs text-zinc-400 mt-1">Rank of {totalUsers}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
