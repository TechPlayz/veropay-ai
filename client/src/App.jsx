import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AddRide from "./pages/AddRide";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import RideAnalysis from "./pages/RideAnalysis";
import RideHistory from "./pages/RideHistory";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-ride" element={<AddRide />} />
        <Route path="/analysis" element={<RideAnalysis />} />
        <Route path="/history" element={<RideHistory />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;