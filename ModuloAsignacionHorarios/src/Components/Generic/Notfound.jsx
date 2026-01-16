import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <section className="page_404">
      <div className="container_404">
        <div className="four_zero_four_bg">
          <h1>404</h1>
        </div>

        <div className="content_box_404">
          <h3>Parece que estas perdido</h3>
          <p>La pagina que estas buscando por el momento no esta disponible</p>

          <Link to="/" className="link_404">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
