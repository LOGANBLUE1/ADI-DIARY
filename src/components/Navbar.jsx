import { Link } from "react-router-dom"
import { useState } from "react"
import { supabase } from "../supabaseClient"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
  }

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
            <div className="text-white text-2xl font-bold">📔</div>
            <span className="text-white text-lg sm:text-xl font-semibold">Adi's Diary</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
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
            <button
              onClick={handleLogout}
              className="text-white hover:bg-white hover:bg-opacity-20 px-4 py-2 rounded-lg transition duration-200 font-medium"
            >
              Logout
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-white hover:bg-white hover:bg-opacity-20 px-4 py-3 rounded-lg transition duration-200 font-medium"
            >
              Categories
            </Link>
            <Link
              to="/all"
              onClick={() => setIsOpen(false)}
              className="block text-white hover:bg-white hover:bg-opacity-20 px-4 py-3 rounded-lg transition duration-200 font-medium"
            >
              All Items
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left text-white hover:bg-white hover:bg-opacity-20 px-4 py-3 rounded-lg transition duration-200 font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
};

export default Navbar;