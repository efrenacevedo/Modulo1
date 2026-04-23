import "./ModalAlert.css";

const ModalAlert = ({ mensaje, type , onClose }) => {
  return (
    <div className="alert-overlay" onClick={onClose}>
      <div
        className={`alert-panel ${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h1>
          {type === "error" && "❌ Error"}
          {type === "success" && "✅ Éxito"}
          {type === "info" && "ℹ️ Información"}
        </h1>

        <h2>{mensaje}</h2>

        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default ModalAlert;
