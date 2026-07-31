import Layout from "../components/layout/Layout";

function AddRide() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Add Ride
        </h1>

        <form className="bg-white shadow rounded-xl p-8 space-y-6">

          <div>
            <label className="block mb-2 font-semibold">
              Platform
            </label>

            <select className="w-full border rounded-lg p-3">
              <option>Swiggy</option>
              <option>Zomato</option>
              <option>Uber</option>
              <option>Rapido</option>
              <option>Blinkit</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Fare (₹)
            </label>

            <input
              type="number"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Distance (km)
            </label>

            <input
              type="number"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Duration (minutes)
            </label>

            <input
              type="number"
              className="w-full border rounded-lg p-3"
            />
          </div>

          <button
            className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600"
          >
            Analyze Ride
          </button>

        </form>

      </div>
    </Layout>
  );
}

export default AddRide;