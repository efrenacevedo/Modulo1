import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState } from "react"
import type { ReactNode } from "react"
// @ts-ignore
import ExcelManager from "./components/ExcelManager.jsx"
// @ts-ignore
import Home from "./components/generic/Home.jsx"
// @ts-ignore
import Login from "./components/auth/Login.jsx"
// @ts-ignore
import NotFound from "./components/generic/Notfound.jsx"
// @ts-ignore
import MainLayout from "./components/generic/MainLayout.js"

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
      <Routes>
        <Route path="/login" element={<Login setAuth={setAuth} />} />

        <Route element={<MainLayout />}>
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
          element={<ExcelManager />}
          />

        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
