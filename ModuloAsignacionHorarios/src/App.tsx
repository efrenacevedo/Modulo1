import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//@ts-ignore
import ExcelManager from "./Components/ExcelManager.jsx";
//@ts-ignore
import Home from "./Components/Generic/Home.jsx";
//@ts-ignore
import NotFound from "./Components/Generic/NotFound";
//@ts-ignore
import MainLayout from "./Components/Generic/MainLayout";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cargadatos" element={<ExcelManager />} />
        </Route>

        {}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
