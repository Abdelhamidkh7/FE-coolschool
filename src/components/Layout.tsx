import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className=" w-full h-screen overflow-hidden">
        <Outlet />
      </div>
      </div>
    
  );
};

export default Layout;
