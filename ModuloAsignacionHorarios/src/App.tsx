import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// @ts-ignore: importing a JS module without a declaration file
import ExcelManager from "./Components/ExcelManager.jsx";
// @ts-ignore: importing a JS module without a declaration file
import Navbar from "./Components/Navbar.jsx";
import "./App.css";

const Inicio = () => (
  <div style={{ padding: "120px 40px", textAlign: "center" }}>
    <h1>Bienvenido al Sistema de Gestión de Aulas</h1>
    <p>Selecciona una opción en el menú superior para comenzar.</p>

    <Link to="/cargadatos" style={buttonStyle}>
      Ir a Cargar Datos
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      {/* */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/cargadatos" element={<ExcelManager />} />
        <Route path="*" element={<h2 style={{ padding: 40 }}>404 - Página no encontrada</h2>} />
      </Routes>
    </Router>
  );
}

const buttonStyle = {
  display: "inline-block",
  marginTop: "20px",
  padding: "12px 24px",
  backgroundColor: "#3b82f6",
  color: "white",
  textDecoration: "none",
  borderRadius: "10px",
  fontWeight: "bold"
};

export default App;
