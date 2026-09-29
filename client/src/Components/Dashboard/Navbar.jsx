import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../Logo";

const BASE_NAV_LINKS = [
  { to: "/dashboard", label: "Home" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/donate", label: "Donate" },
  { to: "/about", label: "About Us" },
  { to: "/profile", label: "Profile" },
];

const Navbar = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("token");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    async function checkAdmin() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/profile", {
          headers: { "x-access-token": token },
        });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(!!data.user?.isAdmin);
        }
      } catch {
        // non-critical — nav just won't show the admin-only link
      }
    }

    checkAdmin();
  }, [isLoggedIn]);

  const eventsLink = isAdmin
    ? { to: "/event", label: "Create Event" }
    : { to: "/events", label: "Events" };

  const navLinks = [
    BASE_NAV_LINKS[0],
    BASE_NAV_LINKS[1],
    eventsLink,
    ...BASE_NAV_LINKS.slice(2),
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 text-white font-bold text-lg tracking-wide">
          <Logo size={28} />
          Eco<span className="text-purple-400">Vault</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.to ? "text-purple-300" : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-zinc-400 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        ) : (
          <Link to="/" className="text-sm font-medium text-purple-300 hover:text-purple-200">
            Login
          </Link>
        )}
      </div>

      <div className="md:hidden flex overflow-x-auto gap-4 px-4 pb-3 -mt-1">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`text-xs font-medium whitespace-nowrap transition-colors ${
              location.pathname === link.to ? "text-purple-300" : "text-zinc-400"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
