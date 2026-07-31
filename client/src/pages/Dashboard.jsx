import Layout from "../components/layout/Layout";

function Dashboard() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Dashboard
        </h1>

        {/* Stats */}

        <div className="grid grid-cols-4 gap-6">

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">Today's Earnings</p>
            <h2 className="text-3xl font-bold mt-2">₹0</h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">Rides</p>
            <h2 className="text-3xl font-bold mt-2">0</h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">Hours Worked</p>
            <h2 className="text-3xl font-bold mt-2">0h</h2>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">AI Fairness Score</p>
            <h2 className="text-3xl font-bold text-green-500 mt-2">
              --
            </h2>
          </div>

        </div>

      </div>
    </Layout>
  );
}

export default Dashboard;