import { useState } from "react";
import "../../App.css";
import Scanner from "./ScannerBtn";
import Stats from "./Stats";
import EventsTab from "./EventsTab";

function Display() {
  const [scanCount, setScanCount] = useState(0);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <Scanner onScanComplete={() => setScanCount((c) => c + 1)} />
      </div>
      <div className="lg:col-span-1">
        <Stats key={scanCount} />
      </div>
      <div className="lg:col-span-3">
        <EventsTab />
      </div>
    </div>
  );
}

export default Display;
