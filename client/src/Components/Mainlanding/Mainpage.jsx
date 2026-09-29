import React, { useState } from "react";
import Register from "./Register";
import Login from "./Login";
import Hero from "./Hero";
import Footer from "../Dashboard/Footer";
import "../../CSS/auth.css";

const Mainpage = ({ setToken }) => {

  const [showRegister, setShowRegister] = useState(false);

  return (
    <div>
      <div className="auth-shell flex flex-col justify-center py-16">
        <div className="auth-orb auth-orb--one"></div>
        <div className="auth-orb auth-orb--two"></div>

        <div className="md:flex md:justify-between md:items-center relative z-10 max-w-6xl mx-auto px-6 gap-12">

          <div className="md:flex-1">
            <Hero />
          </div>

          <div className="mt-10 md:mt-0 md:flex-shrink-0">
            {!showRegister ? (
              <Login setToken={setToken} setShowRegister={setShowRegister} />
            ) : (
              <Register setShowRegister={setShowRegister} />
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Mainpage;
