import React, { useState } from "react";
import './index.css';
import Display from './Components/Dashboard/Display';
import Profile from './Components/Dashboard/Profile';
import AdminDashboard from './Components/Dashboard/AdminDashboard';
import Mainpage from './Components/Mainlanding/Mainpage';
import AboutUs from './Components/Mainlanding/AboutUs';
import AdminLogin from './Components/Mainlanding/AdminLogin';
import AdminSignup from './Components/Mainlanding/AdminSignup';
import Layout from './Components/Dashboard/Layout';
import { Route, Routes, Navigate } from "react-router-dom";
import Events from './Components/events/Events';
import OngoingEvents from './Components/events/OngoingEvents';
import Leaderboard from "./Components/LeaderBoard/Leaderboard";
import Donation from "./Components/Dono Page/Donation";

const App = () => {
  const [token, setToken] = useState(() =>
    localStorage.getItem("token") ? true : false
  );

  return (
    <Routes>
      <Route path="/" element={<Mainpage setToken={setToken} />} />
      <Route path="/admin/login" element={<AdminLogin setToken={setToken} />} />
      <Route path="/admin/signup" element={<AdminSignup />} />

      <Route path="/dashboard" element={token ? <Layout><Display /></Layout> : <Navigate to="/" />} />
      <Route path="/event" element={token ? <Layout><Events /></Layout> : <Navigate to="/" />} />
      <Route path="/events" element={token ? <Layout><OngoingEvents /></Layout> : <Navigate to="/" />} />
      <Route path="/leaderboard" element={token ? <Layout><Leaderboard /></Layout> : <Navigate to="/" />} />
      <Route path="/donate" element={token ? <Layout><Donation /></Layout> : <Navigate to="/" />} />
      <Route path="/profile" element={token ? <Layout><Profile /></Layout> : <Navigate to="/" />} />
      <Route path="/admin" element={token ? <Layout><AdminDashboard /></Layout> : <Navigate to="/" />} />
      <Route path="/about" element={<Layout><AboutUs /></Layout>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
