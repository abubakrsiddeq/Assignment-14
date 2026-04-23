import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProducts, deleteProduct } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Products = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [brokenImages, setBrokenImages] = useState({});

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      if (err.message.includes("expired") || err.message.includes("invalid") || err.message.includes("No token")) {
        logout();
        navigate("/login");
      } else {
        setError(err.message);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    logout();
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

  const visibleProducts = filtered
    .filter((p) => {
      if (categoryFilter === "All") return true;
      return (p.category || "General") === categoryFilter;
    })
    .sort((a, b) => {
      if (sortBy === "price") return Number(b.price || 0) - Number(a.price || 0);
      if (sortBy === "stock") return Number(b.stock || 0) - Number(a.stock || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

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
          <span className="brand-name">ProductVault</span>
        </div>
        <div className="dash-nav">
          <span className="user-greeting">Hi, {user?.name?.split(" ")[0]}</span>
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
              <label htmlFor="sortBy">Sort</label>
              <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
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
                      PV
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
