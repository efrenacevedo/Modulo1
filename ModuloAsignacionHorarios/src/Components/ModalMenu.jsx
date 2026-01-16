
import "./ModalNavbar.css";

const ModalMenu = ({ onClose }) => {
  return (            
    <div className="hamburger-panel">
      <a href="/">Principal</a>
      <a href="/cargadatos">Cargar Datos</a>
      <a href="/login">Cerrar sesión</a>
    </div>
  );
};

export default ModalMenu;
