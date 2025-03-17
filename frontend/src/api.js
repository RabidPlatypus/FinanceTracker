import axios from "axios";

const API = axios.create({
  baseURL: "https://financetracker-3bne.onrender.com", // Use your actual Render URL
});


// Attach token for authenticated requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
