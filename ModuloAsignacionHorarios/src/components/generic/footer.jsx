import "./footer.css";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="content">
        {/* TOP */}
        <div className="top">
          <div className="logo-details">
            <span className="logo_name">
              Universidad Autónoma del Estado de Hidalgo
            </span>
          </div>
        </div>

        {/* LINKS */}
        <div className="link-boxes">
          {/* MENÚ */}
          <ul className="box">
            <li className="link_name">Menú</li>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/bachillerato">Bachillerato</Link></li>
            <li><Link to="/licenciatura">Licenciatura</Link></li>
            <li><Link to="/postgrado">Posgrado</Link></li>
            <li><Link to="/">Investigacion</Link></li>
          </ul>

          {/* LIGAS DE INTERÉS */}
          <ul className="box">
            <li className="link_name">Ligas de interés</li>
            <li><Link to="/ANUIES">ANUIES</Link></li>
            <li><Link to="/CUMex">CUMex</Link></li>
          </ul>

          {/* LEGAL */}
          <ul className="box">
            <li className="link_name">Legal</li>
            <li><Link to="/privacidad">Aviso de privacidad</Link></li>
            <li><Link to="/contraloriasocial">Contraloría Social</Link></li>
            <li><Link to="/transparencia">Trasnparencia</Link></li>
            <li><Link to="/gaceta">Gaceta</Link></li>
          </ul>

          {/* INFORMACIÓN */}
          <ul className="box">
            <li className="link_name">Información</li>
            <li><Link to="/calendarioacademico">Calendario Académico</Link></li>
            <li><Link to="/mapasyaccesibilidad">Mapas y accesibilidad</Link></li>
          </ul>

          {/* CONTACTO */}
          <ul className="box">
            <li className="link_name">Contacto</li>
            <li>
              <Link to="/"></Link>
                Torres de Rectoría Pachuca–Actopan Km. 4.5,
                Col. Campo de Tiro, Pachuca de Soto, Hidalgo,
                C.P. 42039
              
            </li>
            <li>
              <a href="tel:+527717172000">
                Teléfono: +52 (771) 717 2000
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="bottom-details">
        <div className="bottom_text">
          <span>
            © 2026 Universidad Autónoma del Estado de Hidalgo
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
