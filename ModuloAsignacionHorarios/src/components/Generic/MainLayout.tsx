import { Outlet } from "react-router-dom";
//@ts-ignore
import Navbar from "../Navbar.jsx";
//@ts-ignore
import Footer from "../Generic/Footer.jsx";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
