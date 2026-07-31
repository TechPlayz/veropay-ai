import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <Navbar />

      <main className="p-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;