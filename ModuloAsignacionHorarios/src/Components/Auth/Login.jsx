import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./login.css"

import garzaLogo from "../../assets/icon-Garza.png"
export default function Login({ setAuth }) {
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    if (!user.trim() || !pass.trim()) {
      setError("Por favor completa todos los campos")
      return
    }

    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    if (user === "admin" && pass === "1234") {
      setAuth(true)
      navigate("/")
    } else {
      setError("Usuario o contraseña incorrectos")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            {/* Usa tu imagen local en lugar del SVG */}
            <img 
              src={garzaLogo} 
              alt="Logo Garza - Colegio La Garza" 
              className="garza-logo-img"
            />
            <div className="school-name">Colegio La Garza</div>
          </div>
          <h1>Bienvenido</h1>
          <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
              Usuario
            </label>
            <input
              id="username"
              type="text"
              placeholder="Ingresa tu usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Procesando...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>

          <div className="login-footer">
            <p className="demo-credentials">
              <strong>Demo:</strong> admin / 1234
            </p>
            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}