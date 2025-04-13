import leftArrow from "/chevron-left.svg";
import SidebarNav from "./SidebarNav";
import setting from "/tage=setting.svg";
import { LogOut } from "lucide-react";
import largeLogo from "/logo-large.png";
import smallLogo from "/logo-small.png";
import ProfileNav from "./ProfileNav";
import { apiRoutes } from "@/lib/routes";
import axiosInstance from "@/lib/AxiosInstance";

function Sidebar(props: {
  name: string,
  image: string,
  role: string,
  collapsed: boolean,
  setCollapsed: (status:boolean)=>void
}) {

  const navComponents = [
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
  return (
    <>
    <div
      className={`sm:flex bg-white w-[18.5rem] fixed z-10  ${
        props.collapsed? "hidden sm:w-[4.75rem]":'flex sm:w-[15rem] lg:w-[17.5rem]'} h-auto min-h-screen flex-col justify-between items-start shrink-0 rounded-component`}
    >
      <div className="flex flex-col justify-center gap-6 self-stretch ">
        <div className="flex  items-center gap-[0.75rem] self-stretch">
          <img
            className={`${props.collapsed? "p-0": 'p-6'}  mt-4 sm:mt-2`}
            src={props.collapsed ? smallLogo : largeLogo}
          />
          <div
            className={`border cursor-pointer -right-3 hidden sm:visible border-secondary duration-200 bg-white sm:flex p-1 items-center gap-[0.625rem] rounded-full absolute ${
              props.collapsed ? "rotate-180" : ""
            }  top-7`}
            onClick={() => props.setCollapsed(!props.collapsed)}
          >
            <img src={leftArrow} alt="left arrow" />
          </div>
        </div>
        <div
          className={`'flex flex-col mx-8 sm:mx-auto items-start duration-100 gap-6 ${
            props.collapsed ? "w-[2.75rem]" : "sm:w-48 lg:w-[14.625rem]"
          }`}
        >
          {navComponents.map((nav, index) => {
            return (
              <SidebarNav
                key={index}
                link={nav.link}
                navText={nav.text}
                icon={nav.icon}
                collapsed={props.collapsed}
                setCollapsed={props.setCollapsed}
                subItems={nav.subItems}
              />
            );
          })}
          <div
            className={`${
              props.collapsed ? "w-[2.75rem]" : "mx-auto w-5/6 sm:w-48 lg:w-[14.625rem]"
            } my-3 h-[0.0625rem] bg-secondary`}
          />
          <SidebarNav
            link="/settings"
            navText="Settings"
            icon={setting}
            collapsed={props.collapsed}
            setCollapsed={props.setCollapsed}
          />
          <SidebarNav
            link="#"
            navText="Logout"
            icon={<LogOut />}
            collapsed={props.collapsed}
            setCollapsed={props.setCollapsed}
            onClick={() => {
              localStorage.clear();
              localStorage.clear();
              axiosInstance.post(apiRoutes.logout);
            }}
          />
        </div>
      </div>
      <ProfileNav image={props.image} role={props.role} name={props.name} collapsed={props.collapsed}/>
    </div>
    </>
  );
}

export default Sidebar;
