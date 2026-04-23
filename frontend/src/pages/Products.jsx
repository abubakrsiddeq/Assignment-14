import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { fetchProducts, deleteProduct } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ActivityLogPanel from "../components/ActivityLogPanel";
import ThemeToggle from "../components/ThemeToggle";

const Products = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";
  const rawSortField = searchParams.get("sort") || "createdAt";
  const initialSortField = ["createdAt", "price", "stock"].includes(rawSortField) ? rawSortField : "createdAt";
  const rawDirection = searchParams.get("dir") || "desc";
  const initialSortDirection = ["asc", "desc"].includes(rawDirection) ? rawDirection : "desc";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [brokenImages, setBrokenImages] = useState({});
  const [showActivityLog, setShowActivityLog] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowActivityLog(false);
      }
    };

    if (showActivityLog) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [showActivityLog]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      if (err.message.includes("expired") || err.message.includes("invalid") || err.message.includes("No token")) {
        logout();
        showToast("Session expired. Please login again", "info");
        navigate("/login");
      } else {
        setError(err.message);
        showToast(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast("Product deleted", "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    showToast("Signed out successfully", "info");
    navigate("/login");
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const categories = [
    "All",
    ...new Set(
      products
        .map((p) => (p.category || "General").trim())
        .filter(Boolean)
    ),
  ];

  useEffect(() => {
    if (!categories.includes(categoryFilter)) {
      setCategoryFilter("All");
    }
  }, [categories, categoryFilter]);

  useEffect(() => {
    const next = new URLSearchParams();

    if (search.trim()) next.set("q", search.trim());
    if (categoryFilter !== "All") next.set("category", categoryFilter);
    if (sortField !== "createdAt") next.set("sort", sortField);
    if (sortDirection !== "desc") next.set("dir", sortDirection);

    setSearchParams(next, { replace: true });
  }, [search, categoryFilter, sortField, sortDirection, setSearchParams]);

  const visibleProducts = filtered
    .filter((p) => {
      if (categoryFilter === "All") return true;
      return (p.category || "General") === categoryFilter;
    })
    .sort((a, b) => {
      const directionFactor = sortDirection === "asc" ? 1 : -1;

      if (sortField === "price") {
        return (Number(a.price || 0) - Number(b.price || 0)) * directionFactor;
      }

      if (sortField === "stock") {
        return (Number(a.stock || 0) - Number(b.stock || 0)) * directionFactor;
      }

      return (new Date(a.createdAt || 0) - new Date(b.createdAt || 0)) * directionFactor;
    });

  const directionOptions =
    sortField === "price"
      ? [
          { value: "asc", label: "Low to High" },
          { value: "desc", label: "High to Low" },
        ]
      : sortField === "stock"
        ? [
            { value: "asc", label: "Low to High" },
            { value: "desc", label: "High to Low" },
          ]
        : [
            { value: "desc", label: "Newest" },
            { value: "asc", label: "Oldest" },
          ];

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);

  const handleCardOpen = (id) => {
    navigate(`/products/${id}`);
  };

  const stopCardNavigation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">Assignment 14</span>
        </div>
        <div className="dash-nav">
          <span className="user-greeting">Hi, {user?.name?.split(" ")[0]}</span>
          <ThemeToggle />
          <button
            type="button"
            className="btn-activity"
            onClick={() => setShowActivityLog((prev) => !prev)}
            aria-label="Toggle activity log"
            aria-expanded={showActivityLog}
          >
            <span className="btn-activity-icon" aria-hidden="true">◷</span>
            <span className="btn-activity-text">Activity</span>
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      <main className="dash-main">
        <section className="products-hero">
          <div className="products-hero-glow" />
          <div className="page-header">
            <div>
              <p className="hero-overline">Inventory Intelligence</p>
              <h2 className="page-title">Products</h2>
              <p className="page-count">{products.length} item{products.length !== 1 ? "s" : ""} in your vault</p>
            </div>
            <Link to="/add-product" className="btn-primary">
              <span>+</span> Add Product
            </Link>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <p className="metric-label">Low Stock</p>
              <p className="metric-value">{lowStockCount}</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Out of Stock</p>
              <p className="metric-value">{outOfStockCount}</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Inventory Value</p>
              <p className="metric-value">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </section>

        <div className="products-toolbar">
          <div>
            <p className="toolbar-title">Explore collection</p>
          </div>
          <div className="toolbar-controls">
            <div className="sort-control">
              <label htmlFor="sortField">Sort By</label>
              <select
                id="sortField"
                value={sortField}
                onChange={(e) => {
                  const value = e.target.value;
                  setSortField(value);
                  if (value === "createdAt") {
                    setSortDirection("desc");
                  }
                }}
              >
                <option value="createdAt">Date</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
            </div>
            <div className="sort-control">
              <label htmlFor="sortDirection">Direction</label>
              <select
                id="sortDirection"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
              >
                {directionOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="search-bar">
              <span className="search-icon">⌕</span>
              <input
                type="text"
                placeholder="Search by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filter-chips" role="tablist" aria-label="Filter products by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`filter-chip ${categoryFilter === category ? "active" : ""}`}
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {showActivityLog && (
          <div className="activity-lightbox" onClick={() => setShowActivityLog(false)}>
            <div
              className="activity-lightbox-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Activity log"
              onClick={(e) => e.stopPropagation()}
            >
              <ActivityLogPanel isOpen={showActivityLog} onClose={() => setShowActivityLog(false)} />
            </div>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading products...</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>{search ? "No results found" : "No products yet"}</h3>
            <p>{search ? "Try a different search term" : "Add your first product to get started"}</p>
            {!search && (
              <Link to="/add-product" className="btn-primary">
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {visibleProducts.map((product) => (
              <article
                key={product._id}
                className="product-card"
                role="button"
                tabIndex={0}
                onClick={() => handleCardOpen(product._id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardOpen(product._id);
                  }
                }}
              >
                <div className="product-image-wrap">
                  {product.imageUrl && !brokenImages[product._id] ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                      onError={() => {
                        setBrokenImages((prev) => ({ ...prev, [product._id]: true }));
                      }}
                    />
                  ) : (
                    <div className="product-image-fallback" aria-hidden="true">
                      A14
                    </div>
                  )}
                </div>
                <div className="product-header">
                  <span className="product-category">{product.category || "General"}</span>
                  <span className={`stock-badge ${product.stock === 0 ? "out" : product.stock < 5 ? "low" : "in"}`}>
                    {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
                  </span>
                </div>
                <h3 className="product-name">{product.name}</h3>
                {product.description && (
                  <p className="product-desc">{product.description}</p>
                )}
                <div className="product-footer">
                  <span className="product-price">${Number(product.price).toFixed(2)}</span>
                  <div className="product-actions">
                    <button
                      className="btn-view"
                      onClick={(e) => {
                        stopCardNavigation(e);
                        navigate(`/products/${product._id}`);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="btn-edit"
                      onClick={(e) => {
                        stopCardNavigation(e);
                        navigate(`/edit-product/${product._id}`);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        stopCardNavigation(e);
                        handleDelete(product._id);
                      }}
                      disabled={deletingId === product._id}
                    >
                      {deletingId === product._id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
