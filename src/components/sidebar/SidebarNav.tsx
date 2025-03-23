import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const style = `flex w-full px-4 py-3 gap-4 items-center rounded-nav transition-all duration-200`;

type propsType = {
  link: string;
  collapsed: boolean;
  icon: string;
  navText: string;
  setCollapsed: (status:boolean)=>void;
  subItems?: Array<{
    link: string;
    icon: string;
    text: string;
  }>;
};

function SidebarNav(props: propsType) {
  const { pathname } = useLocation();
  const [active, setActive] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  useEffect(() => {
    const isMainActive = pathname === `/${props.link}`;
    const isSubActive = props.subItems?.some(item => pathname === `/${item.link}`);
    setActive(isMainActive || !!isSubActive);
    setShowSubMenu(isMainActive || !!isSubActive);
  }, [pathname, props.link, props.subItems]);

  return (
    <div className="w-full">
      <NavLink
        to={props.link}
        className={`${style} ${
          active
            ? "bg-primary-100 font-poppins text-primary-900"
            : "bg-white text-[#34465f] sm:opacity-75 hover:opacity-100"
        }`}
        onClick={() => {
          const isMobile = window.innerWidth < 640;
          if (isMobile) props.setCollapsed(true);
          if (props.subItems) setShowSubMenu(!showSubMenu);
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

      {/* Submenu */}
      {!props.collapsed && props.subItems && showSubMenu && (
        <div className="ml-8 mt-1">
          {props.subItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.link}
              className={({ isActive }) =>
                `${style} ${
                  isActive
                    ? "bg-primary-100 font-poppins text-primary-900"
                    : "bg-white text-[#34465f] sm:opacity-75 hover:opacity-100"
                }`
              }
            >
              <img
                className="w-5 h-5"
                src={item.icon}
                alt={`${item.text} icon`}
              />
              <p className="text-xs lg:text-sm font-poppins font-medium leading-3 sm:leading-tight">
                {item.text}
              </p>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default SidebarNav;
