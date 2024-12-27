import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const style = `flex w-full px-4 py-3 gap-4 items-center rounded-nav transition-all duration-200`;

type propsType = {
  link: string;
  collapsed: boolean;
  icon: string;
  navText: string;
  setCollapsed: (status:boolean)=>void;
};

function SidebarNav(props: propsType) {
  const { pathname } = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(pathname === `/${props.link}`);
  }, [pathname, props.link]);

  return (
    <NavLink
      to={props.link}
      className={`${style} ${
        active
          ? "bg-primary-100 font-poppins text-primary-900"
          : "bg-white text-[#34465f] sm:opacity-75 hover:opacity-100"
      }`}
      onClick={()=>{
        const isMobile = window.innerWidth < 640;
        isMobile && props.setCollapsed(true)
      }}
    >
      {/* Icon */}
      <img
        className={`w-5 h-5 ${
          props.collapsed ? "scale-150" : ""
        }`}
        src={props.icon}
        alt={`${props.navText} icon`}
      />
      
      {/* Text */}
      {!props.collapsed && (
        <p className="text-xs lg:text-sm font-poppins ml-2 font-medium leading-3 sm:leading-tight">
          {props.navText}
        </p>
      )}
    </NavLink>
  );
}

export default SidebarNav;
