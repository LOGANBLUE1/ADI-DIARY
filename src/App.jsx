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
import Error from "./pages/Error"

const App = () => {
  const [session, setSession] = useState(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => listener.subscription.unsubscribe()
  }, [])
  if (!session) return <Login />
  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar/>
        <Routes>
          <Route path="/" element={<Categories/>} />
          <Route path="/category/:category" element={<CategoryItems/>} />
          <Route path="/item/:id" element={<ItemDetail/>} />
          <Route path="/all" element={<Home/>} />
          <Route path="*" element={<Error/>} />
        </Routes>
      </div>
  )
};

export default App;
