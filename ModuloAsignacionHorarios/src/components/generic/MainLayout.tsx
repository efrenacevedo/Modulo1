import { Outlet } from "react-router-dom";
//@ts-ignore
import Navbar from "../Navbar.jsx";
//@ts-ignore
import Footer from "./footer.jsx";

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

//cam