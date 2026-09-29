import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import "../../CSS/auth.css";

const fieldSx = {
  width: "100%",
  input: { color: "white" },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#c084fc" },
  "& .MuiOutlinedInput-root fieldset": { borderColor: "rgba(255,255,255,0.15)" },
  "& .MuiOutlinedInput-root:hover fieldset": { borderColor: "#af40ff" },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#c084fc" },
};

const AdminLogin = ({ setToken }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loginAdmin(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        setError("Invalid email or password");
        setSubmitting(false);
        return;
      }

      const profileRes = await fetch('/api/profile', {
        headers: { 'x-access-token': data.token },
      });
      const profileData = await profileRes.json();

      if (!profileRes.ok || !profileData.user?.isAdmin) {
        setError("This account doesn't have admin access");
        setSubmitting(false);
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(true);
      navigate("/admin");
    } catch {
      setError("Server error. Try again later.");
    }

    setSubmitting(false);
  }

  return (
    <div className="auth-shell flex items-center justify-center min-h-screen py-16">
      <div className="auth-orb auth-orb--one"></div>
      <div className="auth-orb auth-orb--two"></div>

      <div className="auth-card-border w-11/12 md:w-[26rem] mx-auto relative z-10">
        <div className="auth-card-inner">
          <h2 className="text-white text-2xl font-bold mb-1 text-center">
            Admin Login
          </h2>
          <p className="text-zinc-400 text-sm text-center mb-7">
            Restricted access for EcoVault administrators
          </p>

          <form onSubmit={loginAdmin}>
            <div className="mb-4">
              <TextField
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                type="email"
                required
                label="Email"
                sx={fieldSx}
              />
            </div>

            <div className="mb-2">
              <TextField
                type="password"
                value={password}
                required
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                label="Password"
                sx={fieldSx}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center mb-4 mt-2">
                {error}
              </div>
            )}

            <div className="mt-6">
              <Button type="submit" variant="contained" fullWidth disableElevation disabled={submitting} className="auth-submit-btn">
                {submitting ? "Logging in..." : "Log In"}
              </Button>
            </div>

            <div className="flex justify-center gap-1 mt-6 text-sm">
              <span className="text-zinc-400">Need an admin account?</span>
              <Link to="/admin/signup" className="text-purple-300 font-semibold hover:text-purple-200">
                Sign up
              </Link>
            </div>

            <div className="flex justify-center mt-3 text-sm">
              <Link to="/" className="text-zinc-500 hover:text-zinc-300">
                ← Back to regular login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
