import React from "react";
import Event from "../Dashboard/Event";
import "../../CSS/cards.css";

const OngoingEvents = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-12 pb-16">
      <h1 className="text-3xl font-bold text-white mb-1">Ongoing Events</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Browse community cleanup drives and eco-events happening near you.
      </p>

      <div className="dash-card">
        <div className="dash-card-inner">
          <Event />
        </div>
      </div>
    </div>
  );
};

export default OngoingEvents;
