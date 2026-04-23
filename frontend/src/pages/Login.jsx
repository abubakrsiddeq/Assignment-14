import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ThemeToggle";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/products";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email and password are required");
      showToast("Email and password are required", "error");
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(form.email, form.password);
      login(data.token, data.user);
      showToast(`Welcome back, ${data.user?.name || "User"}!`, "success");
      navigate(from, { replace: true });
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
            <h1 className="brand-name">ProductVault</h1>
          </div>
          <ThemeToggle />
        </div>
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="alert alert-error">{error}</div>}
        {location.state?.from && (
          <div className="alert alert-info">Please login to access that page</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
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

export default Login;
