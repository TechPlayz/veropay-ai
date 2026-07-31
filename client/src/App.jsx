import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AddRide from "./pages/AddRide";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import RideAnalysis from "./pages/RideAnalysis";
import RideHistory from "./pages/RideHistory";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/add-ride" element={<ProtectedRoute><AddRide /></ProtectedRoute>} />
      <Route path="/analysis" element={<ProtectedRoute><RideAnalysis /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><RideHistory /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
