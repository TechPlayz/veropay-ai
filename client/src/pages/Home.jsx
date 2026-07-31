import Layout from "../components/layout/Layout";

function Home() {
  return (
    <Layout>
      <section className="min-h-[80vh] flex flex-col justify-center items-center text-center">

        <h1 className="text-6xl font-extrabold text-gray-900">
          Know Your Worth.
        </h1>

        <h1 className="text-6xl font-extrabold text-green-500 mt-2">
          Every Ride.
        </h1>

        <p className="mt-8 text-xl text-gray-600 max-w-2xl">
          AI-powered fair wage analysis, worker safety insights,
          financial coaching, and smart earnings tracking
          for gig workers.
        </p>

        <div className="flex gap-6 mt-10">
          <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold">
            Start Shift
          </button>

          <button className="border-2 border-green-500 text-green-500 px-8 py-4 rounded-xl font-semibold">
            View Dashboard
          </button>
        </div>

      </section>
    </Layout>
  );
}

export default Home;