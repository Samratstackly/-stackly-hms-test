export default function Welcome() {
  return (
    <div className="bg-black flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-6">
        Welcome to HMS 🚀
      </h1>
      <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
        Submit
      </button>
    </div>
  );
}