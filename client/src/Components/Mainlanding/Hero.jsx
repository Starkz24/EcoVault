import React from 'react';
import "../../CSS/TitleDesign.css";
import Logo from "../Logo";

const Hero = () => {
  return (
    <div className="text-center md:text-left">
      <div className="mb-8 flex items-center justify-center md:justify-start gap-3">
        <Logo size={36} />
        <button data-text="EcoVault" className="button">
          <span className="actual-text">&nbsp;EcoVault&nbsp;</span>
          <span className="hover-text" aria-hidden="true">
            &nbsp;EcoVault&nbsp;
          </span>
        </button>
      </div>

      <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-mono font-semibold pb-5">
        Pioneering <br /> Sustainability.
      </h1>

      <h3 className="max-w-md mx-auto md:mx-0 text-sm text-zinc-400 leading-7">
        Track your environmental impact, scan and sort waste for rewards, and
        compete on a gamified leaderboard — join a community turning everyday
        action into a cleaner planet.
      </h3>
    </div>
  );
}

export default Hero;
