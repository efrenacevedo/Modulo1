import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const NAV_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Carga de Datos", path: "/cargadatos" }
];

const Navbar = () => {
  const navRef = useRef(null);
  const itemsRef = useRef([]);
  const location = useLocation();

  useEffect(() => {
    const nav = navRef.current;
    const items = itemsRef.current;
    let anim = null;
    let currentActiveItem = null;

    const animate = (from, to) => {
      if (anim) clearInterval(anim);

      const start = Date.now();
      anim = setInterval(() => {
        const p = Math.min((Date.now() - start) / 500, 1);
        const e = 1 - Math.pow(1 - p, 3);

        const x = from + (to - from) * e;
        const y = -40 * (4 * e * (1 - e));
        const r = 200 * Math.sin(p * Math.PI);

        nav.style.setProperty("--translate-x", `${x}px`);
        nav.style.setProperty("--translate-y", `${y}px`);
        nav.style.setProperty("--rotate-x", `${r}deg`);

        if (p >= 1) {
          clearInterval(anim);
          anim = null;
          nav.style.setProperty("--translate-y", "0px");
          nav.style.setProperty("--rotate-x", "0deg");
        }
      }, 16);
    };

    const getCurrentPosition = () =>
      parseFloat(nav.style.getPropertyValue("--translate-x")) || 0;

    const getItemCenter = (item) =>
      item.getBoundingClientRect().left +
      item.offsetWidth / 2 -
      nav.getBoundingClientRect().left -
      5;

    const moveToItem = (item) => {
      const current = getCurrentPosition();
      const center = getItemCenter(item);
      animate(current, center);
      nav.classList.add("show-indicator");
    };

    const setActiveItem = (item) => {
      if (currentActiveItem) currentActiveItem.classList.remove("active");
      currentActiveItem = item;
      item.classList.add("active");
      moveToItem(item);
    };

    items.forEach((item) => {
      item.addEventListener("mouseenter", () => moveToItem(item));
      item.addEventListener("click", () => setActiveItem(item));
    });

    // 🔥 Activar según la ruta actual
    const activeIndex = NAV_ITEMS.findIndex(
      (i) => i.path === location.pathname
    );
    if (activeIndex >= 0 && items[activeIndex]) {
      setTimeout(() => setActiveItem(items[activeIndex]), 100);
    }

    return () => {
      if (anim) clearInterval(anim);
    };
  }, [location.pathname]);

  return (
    <>
      <header>
        <nav>
          <ul ref={navRef}>
            {NAV_ITEMS.map((item, i) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  ref={(el) => (itemsRef.current[i] = el)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* SVG del filtro */}
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="wave-distort">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.0038 0.0038"
              numOctaves="1"
              seed="2"
              result="roughNoise"
            />
            <feGaussianBlur in="roughNoise" stdDeviation="8.5" />
            <feDisplacementMap
              in="SourceGraphic"
              scale="-42"
              xChannelSelector="G"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default Navbar;
