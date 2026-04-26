import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-white text-2xl font-bold">📔</div>
            <span className="text-white text-xl font-semibold">Adi's Diary</span>
          </Link>
          <div className="flex space-x-4">
            <Link
              to="/"
              className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition duration-200 font-medium"
            >
              Categories
            </Link>
            <Link
              to="/all"
              className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition duration-200 font-medium"
            >
              All Items
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
};

export default Navbar;