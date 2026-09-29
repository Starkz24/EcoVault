import React from "react";

const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="ecovault-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#af40ff" />
        <stop offset="50%" stopColor="#5b42f3" />
        <stop offset="100%" stopColor="#00ddeb" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="10" fill="url(#ecovault-grad)" />
    <g transform="translate(20,20) rotate(45)">
      <path d="M 0,-11 Q 8,0 0,11 Q -8,0 0,-11 Z" fill="white" />
      <line x1="0" y1="-8" x2="0" y2="8" stroke="#7c4fe0" strokeWidth="1.4" />
    </g>
  </svg>
);

export default Logo;
