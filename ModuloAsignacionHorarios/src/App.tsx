import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// @ts-ignore: importing a JS module without a declaration file
import ExcelManager from './Components/ExcelManager.jsx';



function App() {
 const Inicio = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>Bienvenido al Sistema de Gestión de Aulas</h1>
    <p>Selecciona una opción en el menú superior para comenzar.</p>
    <Link to="/cargadatos" style={buttonStyle}>Ir a Cargar Datos</Link>
  </div>
);

  return (
    <Router>
      <nav style={navStyle}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/" style={linkStyle}>Inicio</Link>
          <Link to="/cargadatos" style={linkStyle}>Carga de Datos</Link>
        </div>
      </nav>

      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Inicio />} />
        
        {/* Tu ruta específica: localhost:5173/cargadatos */}
        <Route path="/cargadatos" element={<ExcelManager />} />
        
        {/* Ruta para manejar errores 404 (opcional) */}
        <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}
const navStyle = {
  padding: '20px',
  backgroundColor: '#1e293b',
  color: 'white',
  display: 'flex',
  justifyContent: 'center'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: 'bold'
};

const buttonStyle = {
  display: 'inline-block',
  marginTop: '20px',
  padding: '10px 20px',
  backgroundColor: '#3b82f6',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '8px'
};



export default App
