import React, { useEffect, useState } from "react";
import "./Leaderboard";
import { useToast } from "../Toast/ToastContext";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export default function Table({ period = "all" }) {
  const [board, setBoard] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    async function leaderboardPoints() {
      setBoard(null);
      try {
        const response = await fetch(`/api/leaderboard?period=${period}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          const boardWithBadges = assignBadges(data);
          setBoard(boardWithBadges);
        } else {
          const data = await response.json();
          showToast(data.error || "Failed to load leaderboard", "error");
        }
      } catch {
        showToast("Failed to load leaderboard", "error");
      }
    }

    leaderboardPoints();
  }, [period, showToast]);

  useEffect(() => {
    async function currentUser() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("/api/profile", {
          headers: { "x-access-token": token },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUsername(data.user?.username);
        }
      } catch {
        // silently ignore — highlighting is a nice-to-have, not critical
      }
    }

    currentUser();
  }, []);

  const assignBadges = (data) => {
    const sortedData = [...data].sort((a, b) => b.points - a.points);
    return sortedData.map((user, index) => {
      let badges = [];
      if (index === 0) {
        badges.push("Top Performer");
      }
      if (user.points >= 1000) {
        badges.push("Eco Warrior");
      }
      if (user.points >= 500) {
        badges.push("Environment Champion");
      }
      return { ...user, badges };
    });
  };

  return (
    <div id="profile" className="flex justify-center items-center">
      {board ? (
        board.length === 0 ? (
          <p className="text-white text-lg mt-4">No contributions yet — be the first to scan!</p>
        ) : (
          <Items data={board} currentUsername={currentUsername} />
        )
      ) : (
        <p className="text-white text-lg mt-4">Loading...</p>
      )}
    </div>
  );
}

function Items({ data, currentUsername }) {
  return (
    <div className="w-full max-w-2xl overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5">
            <th className="py-3 px-4 font-semibold text-zinc-300 text-sm">#</th>
            <th className="py-3 px-4 font-semibold text-zinc-300 text-sm">Name</th>
            <th className="py-3 px-4 font-semibold text-zinc-300 text-sm">Location</th>
            <th className="py-3 px-4 font-semibold text-zinc-300 text-sm">Points</th>
            <th className="py-3 px-4 font-semibold text-zinc-300 text-sm">Badges</th>
          </tr>
        </thead>
        <tbody>
          {data.map((value, index) => {
            const isCurrentUser = currentUsername && value.username === currentUsername;
            return (
              <tr
                key={value.username || index}
                className={`border-t border-white/10 ${isCurrentUser ? "bg-purple-500/20" : "hover:bg-white/5"}`}
              >
                <td className="py-3 px-4 text-white font-mono">
                  {RANK_MEDALS[index] || `#${index + 1}`}
                </td>
                <td className="py-3 px-4 text-white">
                  {value.username}
                  {isCurrentUser && <span className="ml-2 text-xs text-purple-300">(you)</span>}
                </td>
                <td className="py-3 px-4 text-zinc-300">{value.location}</td>
                <td className="py-3 px-4 text-white font-semibold">{value.points}</td>
                <td className="py-3 px-4 text-zinc-400 text-sm">{value.badges.join(", ") || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
