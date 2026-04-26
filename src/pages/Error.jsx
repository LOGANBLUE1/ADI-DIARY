import { Link } from "react-router-dom";

const Error = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl sm:text-6xl md:text-8xl mb-4">🔍</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 px-4">Oops! Page not found</p>
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 sm:px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition duration-200 active:scale-95 sm:hover:scale-105 touch-manipulation text-sm sm:text-base"
        >
          🏠 Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Error;

