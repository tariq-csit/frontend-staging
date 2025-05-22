import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const style = `flex w-full px-4 py-3 gap-4 items-center rounded-nav transition-all duration-200`;

export type NavItem = {
  link: string;
  text: string;
  icon: string | React.ReactNode;
  subItems?: NavItem[];
};

type propsType = {
  link: string;
  onClick?: () => void;
  collapsed: boolean;
  icon: React.ReactNode | string;
  navText: string;
  setCollapsed: (status:boolean)=>void;
  subItems?: NavItem[];
};

function SidebarNav(props: propsType) {
  const { pathname } = useLocation();
  const [active, setActive] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  useEffect(() => {
    const isMainActive = pathname === props.link || pathname === `/${props.link}`;
    const isSubActive = props.subItems?.some(item => pathname === item.link || pathname === `/${item.link}`);
    setActive(isMainActive || !!isSubActive);
    setShowSubMenu(isMainActive || !!isSubActive);
  }, [pathname, props.link, props.subItems]);

  return (
    <div className="w-full">
      <NavLink
        to={props.link}
        className={`${style} ${
          active
            ? "bg-primary-100 dark:bg-indigo-900/30 font-poppins text-primary-900 dark:text-indigo-300"
            : "bg-white dark:bg-gray-800 text-[#34465f] dark:text-gray-300 sm:opacity-75 hover:opacity-100"
        }`}
        onClick={() => {
          const isMobile = window.innerWidth < 640;
          if (isMobile) props.setCollapsed(true);
          if (props.subItems) setShowSubMenu(!showSubMenu);
          props.onClick?.();
        }}
      >
        {/* Icon */}
        {typeof props.icon === 'string' ? (
          <img
            className={`w-5 h-5 ${
              props.collapsed ? "scale-150" : ""
            } dark:invert-[.75]`}
            src={props.icon}
            alt={`${props.navText} icon`}
          />
        ) : (
          props.icon
        )}
        
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
                    ? "bg-primary-100 dark:bg-indigo-900/30 font-poppins text-primary-900 dark:text-indigo-300"
                    : "bg-white dark:bg-gray-800 text-[#34465f] dark:text-gray-300 sm:opacity-75 hover:opacity-100"
                }`
              }
            >
              {typeof item.icon === 'string' ? (
                <img
                  className="w-5 h-5 dark:invert-[.75]"
                  src={item.icon}
                  alt={`${item.text} icon`}
                />
              ) : (
                item.icon
              )}
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
