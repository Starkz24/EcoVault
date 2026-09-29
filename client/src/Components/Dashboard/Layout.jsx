import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div>{children}</div>
    </div>
  );
};

export default Layout;
