import React, { useState } from "react";
import Table from "./table";
import "./styles.css";

const PERIODS = [
  { value: "all", label: "All-Time" },
  { value: "month", label: "Monthly" },
  { value: "today", label: "Today" },
];

export default function Leaderboard() {
  const [period, setPeriod] = useState("all");

  return (
    <div className="leaderBoard_container">
      <div className="board">
        <h1 className="leaderboard">Leaderboard</h1>

        <div className="duration">
          <div className="radio-inputs">
            {PERIODS.map((p) => (
              <label className="radio" key={p.value}>
                <input
                  type="radio"
                  name="radio"
                  checked={period === p.value}
                  onChange={() => setPeriod(p.value)}
                />
                <span className="name">{p.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Table period={period} />
      </div>
    </div>
  );
}
