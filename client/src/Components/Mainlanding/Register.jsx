import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
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

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AtIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-5.5 8.28" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

const Signup = ({ setShowRegister }) => {
  const showToast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [locality, setLocality] = useState('');
  const [username, setUsername] = useState('');
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

  async function registerUser(e) {
    e.preventDefault();
    setErrorMsg("");

    if (loadingLocation) {
      showToast("Fetching location... please wait", "info");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, username, locality }),
      });

      const data = await res.json();

      if (data.status === "ok") {
        showToast("Registration successful! Please log in.", "success");
        setShowRegister(false);
      } else {
        setErrorMsg(data.error || "Registration failed. Try again.");
      }
    } catch {
      setErrorMsg("Server error. Try again later.");
    }

    setSubmitting(false);
  }

  return (
    <div className="auth-card-border w-11/12 md:w-[26rem] mx-auto">
      <div className="auth-card-inner">
        <h2 className="text-white text-2xl font-bold mb-1 text-center">
          Create your account
        </h2>
        <p className="text-zinc-400 text-sm text-center mb-7">
          Join EcoVault and start making an impact
        </p>

        {errorMsg && (
          <p className="text-red-400 text-sm text-center mb-4">{errorMsg}</p>
        )}

        <form onSubmit={registerUser}>

          <div className="mb-4">
            <TextField
              required
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="auth-icon"><UserIcon /></span>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="mb-4">
            <TextField
              disabled
              label={loadingLocation ? "Fetching location..." : "Locality"}
              value={locality}
              className="auth-input"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="auth-icon"><PinIcon /></span>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="mb-4">
            <TextField
              required
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="auth-icon"><AtIcon /></span>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="mb-4">
            <TextField
              required
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="auth-icon"><MailIcon /></span>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="mb-2">
            <TextField
              required
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              sx={fieldSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="auth-icon"><LockIcon /></span>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      sx={{ color: "rgba(255,255,255,0.5)" }}
                      aria-label="toggle password visibility"
                    >
                      <EyeIcon open={showPassword} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disableElevation
              disabled={submitting}
              className="auth-submit-btn"
            >
              {submitting ? "Creating account..." : "Sign Up"}
            </Button>
          </div>

          <div className="flex justify-center gap-1 mt-6 text-sm">
            <span className="text-zinc-400">Already a member?</span>
            <span
              onClick={() => setShowRegister(false)}
              className="text-purple-300 font-semibold cursor-pointer hover:text-purple-200"
            >
              Login
            </span>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Signup;
