import React from "react";
import Event from "./Event"
import "../../CSS/cards.css";

const EventsTab = () => {
  return (
    <div className="dash-card">
      <div className="dash-card-inner max-h-[28rem] overflow-y-auto">
        <h2 className="mb-4 font-sans text-2xl font-bold tracking-tight text-white">
          Upcoming Events
        </h2>
        <Event />
      </div>
    </div>
  );
};

export default EventsTab;
