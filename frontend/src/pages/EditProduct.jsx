import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { fetchProductById, updateProduct } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = ["Electronics", "Clothing", "Food & Drink", "Books", "Home & Garden", "Sports", "Toys", "Health", "Other"];

const isValidImageUrl = (value) => {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const pathname = url.pathname.toLowerCase();
    if (!pathname || pathname.endsWith("/")) return true;
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(pathname);
  } catch {
    return false;
  }
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "", price: "", category: "", stock: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const product = await fetchProductById(id);
        setForm({
          name: product.name,
          description: product.description || "",
          imageUrl: product.imageUrl || "",
          price: product.price,
          category: product.category || "",
          stock: product.stock ?? 0,
        });
      } catch (err) {
        if (err.message.includes("expired") || err.message.includes("invalid")) {
          logout();
          navigate("/login");
        } else {
          setError(err.message);
        }
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      setError("Name and price are required");
      return;
    }
    if (isNaN(form.price) || Number(form.price) < 0) {
      setError("Price must be a valid positive number");
      return;
    }
    if (!isValidImageUrl(form.imageUrl)) {
      setError("Please enter a valid image URL (http/https)");
      return;
    }
    setLoading(true);
    try {
      await updateProduct(id, {
        name: form.name,
        description: form.description,
        imageUrl: form.imageUrl,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock) || 0,
      });
      navigate("/products");
    } catch (err) {
      if (err.message.includes("expired") || err.message.includes("invalid")) {
        logout();
        navigate("/login");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <Link to="/products" className="brand-link">
            <span className="brand-icon">⬡</span>
            <span className="brand-name">ProductVault</span>
          </Link>
        </div>
        <Link to="/products" className="btn-back">← Back to Products</Link>
      </header>

      <main className="dash-main form-main">
        <div className="form-card">
          <h2 className="form-title">Edit Product</h2>
          <p className="form-subtitle">Update details and image URL to keep your catalog visually rich</p>

          {error && <div className="alert alert-error">{error}</div>}

          {fetching ? (
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Loading product...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="field">
                  <label htmlFor="name">Product Name <span className="required">*</span></label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="field">
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="field">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="price">Price ($) <span className="required">*</span></label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="field">
                  <label htmlFor="stock">Stock Quantity</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-actions">
                <Link to="/products" className="btn-secondary">Cancel</Link>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <span className="spinner" /> : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditProduct;
