require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const logRoutes = require("./src/routes/logRoutes");

const app = express();

const startServer = async () => {
  await connectDB();
};

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5010",
    ];

    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isHostedApp = /^https:\/\/.+\.(vercel\.app|netlify\.app)$/.test(origin);

    if (allowedOrigins.includes(origin) || isLocalhost || isHostedApp) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Product API is running", version: "1.0.0" }));
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/logs", logRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

startServer()
  .then(() => {
    const PORT = process.env.PORT || 5010;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
