import { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCube, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/effect-cube";
import "./home.css";

export default function Home() {
  useEffect(() => {
    // Nada aquí porque Swiper ya se inicializa con React
  }, []);

  return (
    <section className="home-section">
      {}
      <div className="background" />

      <div className="content">
        <h1>Universidad Autónoma del Estado de Hidalgo</h1>
        <p>
          La Escuela Superior Tepeji es creada como parte del proceso de desconcentración de los programas educativos de la Universidad Autónoma del Estado de Hidalgo, a fin de atender las demandas regionales y dar respuesta a las necesidades económicas, sociales y educativas de la región.
        </p>
        <button>Quienes somos</button>
      </div>

      <Swiper
        effect="cube"
        grabCursor
        loop
        speed={1000}
        autoplay={{
          delay: 2600,
          pauseOnMouseEnter: true,
        }}
        cubeEffect={{
          shadow: false,
          slideShadows: true,
          shadowOffset: 10,
          shadowScale: 0.94,
        }}
        modules={[EffectCube, Autoplay]}
        className="swiper"
      >
        <SwiperSlide>
          <img src="https://img.freepik.com/foto-gratis/paisaje-analogico-ciudad-edificios_23-2149661462.jpg" />
          <div className="cost">Somos Excelencia</div>
          <div className="overlay">
            <h1>Visita nuestro campus</h1>
            <p>
              Descubre las instalaciones.
            </p>
            <div className="ratings">
              
              <span></span>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <img src="..\src\assets\image1.jpg" />
          <div className="cost">Por un futuro mejor</div>
          <div className="overlay">
            <h1>Luchamos por un futuro mejor</h1>
            <p>
              ..nose que poner aca..
            </p>
            <div className="ratings">
              
              <span></span>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <img src="..\src\assets\image2.jpg" />
          <div className="cost dark-text">Somos honestidad</div>
          <div className="overlay">
            <h1>Juntos haremos historia</h1>
            <p>
              nose
            </p>
            <div className="ratings">
              
              <span></span>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <img src="..\src\assets\uaehTepeji.webp" />
          <div className="cost dark-text">Somos garzas</div>
          <div className="overlay">
            <h1>Orgullosamente garzas</h1>
            <p>
              pongan lo que quieran
            </p>
            <div className="ratings">
              
              <span></span>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}
