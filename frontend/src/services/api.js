const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5010";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

// Auth
export const registerUser = (name, email, password) =>
  fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  }).then(handleResponse);

export const loginUser = (email, password) =>
  fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(handleResponse);

// Products
export const fetchProducts = () =>
  fetch(`${BASE_URL}/products`, { headers: getAuthHeaders() }).then(handleResponse);

export const fetchProductById = (id) =>
  fetch(`${BASE_URL}/products/${id}`, { headers: getAuthHeaders() }).then(handleResponse);

export const createProduct = (data) =>
  fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const updateProduct = (id, data) =>
  fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }).then(handleResponse);

export const deleteProduct = (id) =>
  fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(handleResponse);

// Activity logs
export const fetchMyLogs = () =>
  fetch(`${BASE_URL}/logs`, { headers: getAuthHeaders() }).then(handleResponse);

export const clearMyLogs = () =>
  fetch(`${BASE_URL}/logs`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then(handleResponse);
