import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold text-green-400">
        VeroPay AI
      </h1>

      <div className="flex gap-6">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/add-ride">Add Ride</Link>
        <Link to="/chat">AI Chat</Link>
      </div>
    </nav>
  );
}

export default Navbar;