import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//@ts-ignore
import ExcelManager from "./Components/ExcelManager.jsx";
//@ts-ignore
import Navbar from "./Components/Navbar.jsx";
//@ts-ignore
import Home from "./Components/Generic/Home.jsx";
//@ts-ignore
import Footer from "./Components/Generic/Footer.jsx";

import "./App.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cargadatos" element={<ExcelManager />} />
        <Route
          path="*"
          element={<h2 style={{ padding: 40 }}>404 - Página no encontrada</h2>}
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
