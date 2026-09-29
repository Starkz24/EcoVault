import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { useNavigate, Link } from "react-router-dom";
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

const Login = ({ setToken, setShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(true);
      navigate("/dashboard");
    }
  }, []);

  async function loginUser(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        setToken(true);
        navigate("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("Server error. Try again later.");
    }

    setSubmitting(false);
  }

  return (
    <div className="auth-card-border w-11/12 md:w-[26rem] mx-auto">
      <div className="auth-card-inner">
        <h2 className="text-white text-2xl font-bold mb-1 text-center">
          Welcome back
        </h2>
        <p className="text-zinc-400 text-sm text-center mb-7">
          Log in to keep tracking your impact
        </p>

        <form onSubmit={loginUser}>

          <div className="mb-4">
            <TextField
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              type="email"
              required
              label="Email"
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
              type={showPassword ? "text" : "password"}
              value={password}
              required
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              label="Password"
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

          {error && (
            <div className="text-red-400 text-sm text-center mb-4 mt-2">
              {error}
            </div>
          )}

          <div className="mt-6">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disableElevation
              disabled={submitting}
              className="auth-submit-btn"
            >
              {submitting ? "Logging in..." : "Log In"}
            </Button>
          </div>

          <div className="flex justify-center gap-1 mt-6 text-sm">
            <span className="text-zinc-400">Not a member?</span>
            <span
              onClick={() => setShowRegister(true)}
              className="text-purple-300 font-semibold cursor-pointer hover:text-purple-200"
            >
              Register
            </span>
          </div>

          <div className="flex justify-center mt-3 text-xs">
            <Link to="/admin/login" className="text-zinc-500 hover:text-zinc-300">
              Admin login
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;
