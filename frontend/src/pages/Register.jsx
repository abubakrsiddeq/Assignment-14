import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ThemeToggle";

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      showToast("All fields are required", "error");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password);
      setSuccess("Account created! Redirecting to login...");
      showToast("Account created successfully", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-head-row">
          <div className="auth-brand">
            <div className="brand-icon">⬡</div>
            <h1 className="brand-name">Assignment 14</h1>
          </div>
          <ThemeToggle />
        </div>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Start managing your products today</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
      <div className="auth-visual">
        <div className="visual-content">
          <div className="visual-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className={`grid-card ${i % 3 === 1 ? "highlight" : ""}`}>
                <div className="card-dot" />
                <div className="card-line" />
                <div className="card-line short" />
              </div>
            ))}
          </div>
          <p className="visual-tagline">Organize · Track · Scale</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
