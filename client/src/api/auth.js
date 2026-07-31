import client from "./client";

export const login = (email, password) =>
  client.post("/api/auth/login", { email, password });

export const me = () => client.get("/api/auth/me");

export const register = (formData) =>
  client.post("/api/auth/register", formData);
