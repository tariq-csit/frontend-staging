import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const style = `flex w-full px-4 py-3 gap-4 items-center rounded-nav transition-all duration-200`;

type propsType = {
  link: string;
  collapsed: boolean;
  icon: string;
  navText: string;
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
          : "bg-white hover:bg-primary-100 text-[#64748B]"
      }`}
    >
      {/* Icon */}
      <img
        className={`w-5 h-5 transition-transform duration-300 ${
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
