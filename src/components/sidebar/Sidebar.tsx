import leftArrow from "/chevron-left.svg";
import SidebarNav, { NavItem } from "./SidebarNav";
import setting from "/tage=setting.svg";
import { LogOut, Network, Users } from "lucide-react";
import largeLogo from "/logo-large.png";
import smallLogo from "/logo-small.png";
import ProfileNav from "./ProfileNav";
import { apiRoutes } from "@/lib/routes";
import axiosInstance from "@/lib/AxiosInstance";
import { useSidebar } from "@/contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/hooks/useUser";

function Sidebar(props: {
  name: string,
  image: string,
  role: UserRole,
}) {
  const { isCollapsed, toggle, setCollapsed } = useSidebar();
  const navigate = useNavigate();
  
  // Admin navigation items
  const adminNavItems: NavItem[] = [
    {
      link: "/dashboard",
      text: "Dashboard",
      icon: "/state=dashboard.svg",
    },
    {
      link: "/pentests",
      text: "Pentests",
      icon: "/state=pentests.svg",
    },
    {
      link: "/vulnerability-reports",
      text: "Vulnerability Reports",
      icon: "/state=reports.svg",
    },
    {
      link: "/clients",
      text: "Client Lists",
      icon: "/state=clients.svg",
      subItems: [
        {
          link: "/clients/users",
          icon: "/state=clients.svg",
          text: "Client Users"
        }
      ]
    },
    {
      link: "/pentesters",
      text: "Pentesters List",
      icon: "/state=pentesters.svg",
    },
  ];

  // Pentester navigation items (based on PRD requirements)
  const pentesterNavItems: NavItem[] = [
    {
      link: "/dashboard",
      text: "Dashboard",
      icon: "/state=dashboard.svg",
    },
    {
      link: "/pentests",
      text: "Assigned Pentests",
      icon: "/state=pentests.svg",
    },
    {
      link: "/vulnerability-reports",
      text: "Vulnerability Reports",
      icon: "/state=reports.svg",
    },
  ];

  // Client navigation items
  const clientNavItems: NavItem[] = [
    {
      link: "/dashboard",
      text: "Dashboard",
      icon: "/state=dashboard.svg",
    },
    {
      link: "/pentests",
      text: "Pentests",
      icon: "/state=pentests.svg",
    },
    {
      link: "/vulnerability-reports",
      text: "Vulnerability Reports",
      icon: "/state=reports.svg",
    },
    {
      link: "/clients/users",
      text: "My Team",
      icon: <Users className="w-6 h-6 text-gray-500" />,
    },
    {
      link: "/integration",
      text: "Integration",
      icon: <Network className="w-6 h-6 text-gray-500" />,
    },
  ];

  // Select navigation based on role
  const navComponents = (() => {
    switch (props.role) {
      case 'admin':
        return adminNavItems;
      case 'pentester':
        return pentesterNavItems;
      case 'client':
        return clientNavItems;
      default:
        return [];
    }
  })();

  return (
    <>
    <div
      className={`sm:flex bg-white w-[18.5rem] fixed z-10  ${
        isCollapsed ? "hidden sm:w-[4.75rem]":'flex sm:w-[15rem] lg:w-[17.5rem]'} h-auto min-h-screen flex-col justify-between items-start shrink-0 rounded-component`}
    >
      <div className="flex flex-col justify-center gap-6 self-stretch ">
        <div className="flex  items-center gap-[0.75rem] self-stretch">
          <img
            className={`${isCollapsed ? "p-0": 'p-6'}  mt-4 sm:mt-2`}
            src={isCollapsed ? smallLogo : largeLogo}
          />
          <div
            className={`border cursor-pointer -right-3 hidden sm:visible border-secondary duration-200 bg-white sm:flex p-1 items-center gap-[0.625rem] rounded-full absolute ${
              isCollapsed ? "rotate-180" : ""
            }  top-7`}
            onClick={toggle}
          >
            <img src={leftArrow} alt="left arrow" />
          </div>
        </div>
        <div
          className={`'flex flex-col mx-8 sm:mx-auto items-start duration-100 gap-6 ${
            isCollapsed ? "w-[2.75rem]" : "sm:w-48 lg:w-[14.625rem]"
          }`}
        >
          {navComponents.map((nav, index) => {
            return (
              <SidebarNav
                key={index}
                link={nav.link}
                navText={nav.text}
                icon={nav.icon}
                collapsed={isCollapsed}
                setCollapsed={setCollapsed}
                subItems={nav.subItems}
              />
            );
          })}
          <div
            className={`${
              isCollapsed ? "w-[2.75rem]" : "mx-auto w-5/6 sm:w-48 lg:w-[14.625rem]"
            } my-3 h-[0.0625rem] bg-secondary`}
          />
          <SidebarNav
            link="/settings"
            navText="Settings"
            icon={setting}
            collapsed={isCollapsed}
            setCollapsed={setCollapsed}
          />
          <SidebarNav
            link="#"
            navText="Logout"
            icon={<LogOut />}
            collapsed={isCollapsed}
            setCollapsed={setCollapsed}
            onClick={async () => {
              await axiosInstance.post(apiRoutes.logout);
              localStorage.clear();
              navigate("/login");
            }}
          />
        </div>
      </div>
      <ProfileNav image={props.image} role={props.role} name={props.name} collapsed={isCollapsed}/>
    </div>
    </>
  );
}

export default Sidebar;
