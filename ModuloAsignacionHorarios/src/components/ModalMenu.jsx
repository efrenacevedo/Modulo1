import "./ModalNavbar.css"
import { Link } from "react-router-dom"

const ModalMenu = ({ onClose }) => {
  return (            
    <div className="hamburger-panel">
      <Link to="/" onClick={onClose}>Principal</Link>
      <Link to="/cargadatos" onClick={onClose}>Cargar Datos</Link>
      <Link to="/login" onClick={onClose}>Cerrar sesión</Link>
    </div>
  )
}

export default ModalMenu
