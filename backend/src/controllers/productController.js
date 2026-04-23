const Product = require("../models/Product");
const { writeAuditLog } = require("../utils/auditLogger");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, imageUrl, price, category, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = await Product.create({
      name, description, imageUrl, price, category, stock: stock || 0,
      user: req.user._id,
    });

    await writeAuditLog({
      user: req.user,
      action: "PRODUCT_CREATE",
      targetType: "PRODUCT",
      targetId: product._id.toString(),
      message: `${req.user.name} created product \"${product.name}\"`,
      metadata: { price: product.price, stock: product.stock, category: product.category || "General" },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, description, imageUrl, price, category, stock } = req.body;
    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.imageUrl = imageUrl ?? product.imageUrl;
    product.price = price ?? product.price;
    product.category = category ?? product.category;
    product.stock = stock ?? product.stock;

    const updated = await product.save();

    await writeAuditLog({
      user: req.user,
      action: "PRODUCT_UPDATE",
      targetType: "PRODUCT",
      targetId: updated._id.toString(),
      message: `${req.user.name} updated product \"${updated.name}\"`,
      metadata: { price: updated.price, stock: updated.stock, category: updated.category || "General" },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!product) return res.status(404).json({ message: "Product not found" });

    await writeAuditLog({
      user: req.user,
      action: "PRODUCT_DELETE",
      targetType: "PRODUCT",
      targetId: product._id.toString(),
      message: `${req.user.name} deleted product \"${product.name}\"`,
      metadata: { deletedName: product.name },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
