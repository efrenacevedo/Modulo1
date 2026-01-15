import "./Footer.css";

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
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Bachillerato</a></li>
            <li><a href="#">Licenciatura</a></li>
            <li><a href="#">Posgrado</a></li>
            <li><a href="#">Investigación</a></li>
          </ul>

          {/* LIGAS DE INTERÉS */}
          <ul className="box">
            <li className="link_name">Ligas de interés</li>
            <li><a href="#">ANUIES</a></li>
            <li><a href="#">CUMex</a></li>
          </ul>

          {/* LEGAL */}
          <ul className="box">
            <li className="link_name">Legal</li>
            <li><a href="#">Aviso de Privacidad</a></li>
            <li><a href="#">Contraloría Social</a></li>
            <li><a href="#">Transparencia</a></li>
            <li><a href="#">Gaceta</a></li>
          </ul>

          {/* INFORMACIÓN */}
          <ul className="box">
            <li className="link_name">Información</li>
            <li><a href="#">Calendario Académico</a></li>
            <li><a href="#">Mapas y Accesibilidad</a></li>
          </ul>

          {/* CONTACTO */}
          <ul className="box">
            <li className="link_name">Contacto</li>
            <li>
              <a href="#">
                Torres de Rectoría Pachuca–Actopan Km. 4.5,
                Col. Campo de Tiro, Pachuca de Soto, Hidalgo,
                C.P. 42039
              </a>
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
