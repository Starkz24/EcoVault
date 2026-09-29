import React from "react";
import Logo from "../Logo";
import "../../CSS/cards.css";

const FEATURES = [
  {
    title: "Scan & Sort",
    description: "Upload a photo of your waste and our model identifies what category it belongs to.",
    icon: "♻️",
  },
  {
    title: "Earn Points & Eco-Tiers",
    description: "Every scan earns you points, leveling you up from Bronze to Silver, Gold, and Platinum.",
    icon: "🏅",
  },
  {
    title: "Track Your History",
    description: "Your last 10 scans are logged on your profile, so you can see exactly what you've contributed.",
    icon: "📜",
  },
  {
    title: "Compete & Climb",
    description: "See how you stack up on the leaderboard — filter by Today, Monthly, or All-Time.",
    icon: "🏆",
  },
  {
    title: "Participate in Events",
    description: "Browse local cleanup drives and eco-events happening near you, and show up to make a difference.",
    icon: "📅",
  },
  {
    title: "Donate",
    description: "Support tree plantation and local dustbin installation directly through the app.",
    icon: "🌱",
  },
];

const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex justify-center mb-6">
        <Logo size={48} />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
        About EcoVault
      </h1>
      <p className="text-zinc-400 text-center max-w-2xl mx-auto mb-14 leading-relaxed">
        EcoVault is an app that turns everyday waste disposal into meaningful,
        trackable action. Sustainability requires a collective effort — by
        embracing sustainable practices in our daily lives, we can create a
        world where everyone can coexist harmoniously with the environment.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="dash-card">
            <div className="dash-card-inner">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 text-center">
        <p className="text-zinc-500 text-sm">
          Join us in making a lasting impact on our planet, one scan at a time.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
