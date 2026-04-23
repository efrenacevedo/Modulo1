import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ModalMenu from "./ModalMenu";



import "./Navbar.css";

const NAV_ITEMS = [
  { label: "Inicio", path: "/" },
  { label: "Carga de Datos", path: "/cargadatos" },
  {
    modal: true,
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    )
  }
];


const Navbar = () => {
  const navRef = useRef(null);
  const itemsRef = useRef([]);
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);

  /* ---------------- Animación del indicador ---------------- */
  useEffect(() => {
    const nav = navRef.current;
    const items = itemsRef.current;
    let anim = null;
    let currentActiveItem = null;
    const ul = nav;

    const animate = (from, to) => {
      if (anim) clearInterval(anim);
      const start = Date.now();

      anim = setInterval(() => {
        const p = Math.min((Date.now() - start) / 500, 1);
        const e = 1 - Math.pow(1 - p, 3);

        nav.style.setProperty("--translate-x", `${from + (to - from) * e}px`);
        nav.style.setProperty("--translate-y", `${-40 * (4 * e * (1 - e))}px`);
        nav.style.setProperty("--rotate-x", `${200 * Math.sin(p * Math.PI)}deg`);

        if (p >= 1) {
          clearInterval(anim);
          nav.style.setProperty("--translate-y", "0px");
          nav.style.setProperty("--rotate-x", "0deg");
        }
      }, 16);
    };

    const getItemCenter = (item) =>
      item.getBoundingClientRect().left +
      item.offsetWidth / 2 -
      nav.getBoundingClientRect().left - 5;

    const moveToItem = (item) => {
      animate(
        parseFloat(nav.style.getPropertyValue("--translate-x")) || 0,
        getItemCenter(item)
      );
      nav.classList.add("show-indicator");
    };

    const setActiveItem = (item) => {
  if (!item || !nav) return;

  if (currentActiveItem) {
    currentActiveItem.classList.remove("active");
  }

  currentActiveItem = item;
  item.classList.add("active");
  moveToItem(item);
};


    items.forEach((item) => {
      item.addEventListener("mouseenter", () => moveToItem(item));
      item.addEventListener("click", () => setActiveItem(item));
    });

    const index = NAV_ITEMS.findIndex(
      (i) => i.path === location.pathname
    );
    if (index >= 0 && items[index]) {
      setTimeout(() => setActiveItem(items[index]), 100);
    }

    return () => {
      if (anim) clearInterval(anim);
    };
  }, [location.pathname]);

  /* ---------------- Cerrar menú hamburguesa al click fuera ---------------- */
  useEffect(() => {
    if (!openMenu) return;

    const close = () => setOpenMenu(false);
    window.addEventListener("click", close);

    return () => window.removeEventListener("click", close);
  }, [openMenu]);

  return (
    <>
      <header>
        <nav>
          <ul ref={navRef}>
            {NAV_ITEMS.map((item, i) => (
              <li key={i}>
                {item.modal ? (
                  <a
                    href="#"
                    ref={(el) => (itemsRef.current[i] = el)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenu((prev) => !prev);
                    }}
                    className="hamburger-btn"
                  >
                    {item.icon ?? item.label}
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    ref={(el) => (itemsRef.current[i] = el)}
                  >
                    {item.label}
                  </Link>
                )}

              </li>
            ))}
          </ul>
          {openMenu && <ModalMenu />}
        </nav>
      </header>

      

      {/* SVG filtro */}
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="wave-distort">
            <feTurbulence baseFrequency="0.0038" numOctaves="1" />
            <feGaussianBlur stdDeviation="8.5" />
            <feDisplacementMap scale="-42" />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default Navbar;
