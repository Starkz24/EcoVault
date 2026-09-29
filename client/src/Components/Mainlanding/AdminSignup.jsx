import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useToast } from "../Toast/ToastContext";
import "../../CSS/auth.css";

const fieldSx = {
  width: "100%",
  input: { color: "white" },
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor: "rgba(255,255,255,0.7)",
    color: "rgba(255,255,255,0.7)",
  },
  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#c084fc" },
  "& .MuiOutlinedInput-root fieldset": { borderColor: "rgba(255,255,255,0.15)" },
  "& .MuiOutlinedInput-root:hover fieldset": { borderColor: "#af40ff" },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#c084fc" },
};

const AdminSignup = () => {
  const navigate = useNavigate();
  const showToast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [locality, setLocality] = useState('');
  const [username, setUsername] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const getLocation = async () => {
      if (!navigator.geolocation) return;

      try {
        const position = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject)
        );

        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&apiKey=${process.env.REACT_APP_GEOAPIFY_API_KEY}`
        );

        const data = await res.json();
        setLocality(data.features?.[0]?.properties?.city || "Unknown");
      } catch {
        setLocality("Unknown");
      }

      setLoadingLocation(false);
    };

    getLocation();
  }, []);

  async function registerAdmin(e) {
    e.preventDefault();
    setErrorMsg("");

    if (loadingLocation) {
      showToast("Fetching location... please wait", "info");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, username, locality, adminSecret }),
      });

      const data = await res.json();

      if (data.status === "ok") {
        showToast("Admin account created! Please log in.", "success");
        navigate("/admin/login");
      } else {
        setErrorMsg(data.error || "Admin registration failed.");
      }
    } catch {
      setErrorMsg("Server error. Try again later.");
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
            Create Admin Account
          </h2>
          <p className="text-zinc-400 text-sm text-center mb-7">
            Requires a valid admin signup code
          </p>

          {errorMsg && (
            <p className="text-red-400 text-sm text-center mb-4">{errorMsg}</p>
          )}

          <form onSubmit={registerAdmin}>
            <div className="mb-4">
              <TextField required label="Full Name" value={name} onChange={(e) => setName(e.target.value)} sx={fieldSx} />
            </div>
            <div className="mb-4">
              <TextField disabled label={loadingLocation ? "Fetching location..." : "Locality"} value={locality} sx={fieldSx} />
            </div>
            <div className="mb-4">
              <TextField required label="Username" value={username} onChange={(e) => setUsername(e.target.value)} sx={fieldSx} />
            </div>
            <div className="mb-4">
              <TextField required label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} sx={fieldSx} />
            </div>
            <div className="mb-4">
              <TextField required label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={fieldSx} />
            </div>
            <div className="mb-2">
              <TextField
                required
                label="Admin Signup Code"
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                sx={fieldSx}
              />
            </div>

            <div className="mt-6">
              <Button type="submit" variant="contained" fullWidth disableElevation disabled={submitting} className="auth-submit-btn">
                {submitting ? "Creating account..." : "Create Admin Account"}
              </Button>
            </div>

            <div className="flex justify-center gap-1 mt-6 text-sm">
              <span className="text-zinc-400">Already an admin?</span>
              <Link to="/admin/login" className="text-purple-300 font-semibold hover:text-purple-200">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
