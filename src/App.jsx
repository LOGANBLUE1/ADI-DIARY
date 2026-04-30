import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./components/Login";
import { Routes } from "react-router-dom";
import Navbar from "./components/Navbar"
import { Route } from "react-router-dom";
import Categories from "./pages/Categories"
import CategoryItems from "./pages/CategoryItems"
import ItemDetail from "./pages/ItemDetail"
import Home from "./pages/Home"
import SharedWithMe from "./pages/SharedWithMe"
import MyShares from "./pages/MyShares"
import Error from "./pages/Error"

const App = () => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Show loading state while checking for session
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg mb-4 animate-pulse">
            <span className="text-5xl">📔</span>
          </div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return <Login />
  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar/>
        <Routes>
          <Route path="/" element={<Categories/>} />
          <Route path="/category/:category" element={<CategoryItems/>} />
          <Route path="/item/:id" element={<ItemDetail/>} />
          <Route path="/all" element={<Home/>} />
          <Route path="/shared-with-me" element={<SharedWithMe/>} />
          <Route path="/my-shares" element={<MyShares/>} />
          <Route path="*" element={<Error/>} />
        </Routes>
      </div>
  )
};

export default App;
