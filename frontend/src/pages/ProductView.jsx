import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProductById } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../components/ThemeToggle";

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setImageFailed(false);
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        if (err.message.includes("expired") || err.message.includes("invalid") || err.message.includes("No token")) {
          logout();
          showToast("Session expired. Please login again", "info");
          navigate("/login");
          return;
        }
        setError(err.message);
        showToast(err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, logout, navigate]);

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <Link to="/products" className="brand-link">
            <span className="brand-icon">⬡</span>
            <span className="brand-name">ProductVault</span>
          </Link>
        </div>
        <div className="dash-nav">
          <ThemeToggle />
          <Link to="/products" className="btn-back">Back to Products</Link>
        </div>
      </header>

      <main className="dash-main form-main">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading product details...</p>
          </div>
        ) : error ? (
          <div className="form-card">
            <div className="alert alert-error">{error}</div>
            <div className="form-actions">
              <Link to="/products" className="btn-secondary">Go Back</Link>
            </div>
          </div>
        ) : (
          <article className="detail-card">
            <div className="detail-image-wrap">
              {product?.imageUrl && !imageFailed ? (
                <img
                  src={product.imageUrl}
                  alt={product?.name}
                  className="detail-image"
                  loading="lazy"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="detail-image-fallback" aria-hidden="true">PV</div>
              )}
            </div>

            <div className="detail-top">
              <div>
                <p className="detail-overline">Product Details</p>
                <h1 className="detail-title">{product?.name}</h1>
              </div>
              <span className={`stock-badge ${product?.stock === 0 ? "out" : product?.stock < 5 ? "low" : "in"}`}>
                {product?.stock === 0 ? "Out of stock" : `${product?.stock ?? 0} in stock`}
              </span>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <p className="detail-label">Category</p>
                <p className="detail-value">{product?.category || "General"}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Price</p>
                <p className="detail-price">${Number(product?.price || 0).toFixed(2)}</p>
              </div>
              <div className="detail-item detail-item-wide">
                <p className="detail-label">Description</p>
                <p className="detail-value detail-description">
                  {product?.description || "No description provided for this product."}
                </p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Created</p>
                <p className="detail-value">{formatDate(product?.createdAt)}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Last Updated</p>
                <p className="detail-value">{formatDate(product?.updatedAt)}</p>
              </div>
            </div>

            <div className="form-actions">
              <Link to="/products" className="btn-secondary">Back</Link>
              <button className="btn-primary" onClick={() => navigate(`/edit-product/${id}`)}>
                Edit Product
              </button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default ProductView;
