import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState } from "react"
import type { ReactNode } from "react"
// @ts-ignore
import ExcelManager from "./Components/ExcelManager.jsx"
// @ts-ignore
import Navbar from "./Components/Navbar.jsx"
// @ts-ignore
import Home from "./Components/Generic/Home.jsx"
// @ts-ignore
import Footer from "./Components/Generic/Footer.jsx"
// @ts-ignore
import Login from "./Components/Auth/Login.jsx"

import "./App.css"

type PrivateRouteProps = {
  auth: boolean
  children: ReactNode
}

function PrivateRoute({ auth, children }: PrivateRouteProps) {
  return auth ? children : <Navigate to="/login" />
}

function App() {
  const [auth, setAuth] = useState(false)

  return (
    <Router>
      {auth && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login setAuth={setAuth} />} />

        <Route
          path="/"
          element={
            <PrivateRoute auth={auth}>
              <Home />
            </PrivateRoute>
          }
        />

        <Route
          path="/cargadatos"
          element={
            <PrivateRoute auth={auth}>
              <ExcelManager />
            </PrivateRoute>
          }
        />

        <Route
          path="*"
          element={<h2 style={{ padding: 40 }}>404 - Página no encontrada</h2>}
        />
      </Routes>

      {auth && <Footer />}
    </Router>
  )
}

export default App
