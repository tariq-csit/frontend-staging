import { useState } from "react";
import leftArrow from "/chevron-left.svg";
import SidebarNav from "./SidebarNav";
import setting from "/tage=setting.svg";
import largeLogo from "/logo-large.png";
import smallLogo from "/logo-small.png";
import ProfileNav from "./ProfileNav";
import bars from '/bars-solid.svg'
import cross from '/xmark-solid.svg'
function Sidebar(props: {
  name: string,
  image: string,
  role: string
}) {
  const [collapsed, setCollapsed] = useState(true);

  const navComponents = [
    {
      link: "dashboard",
      text: "Dashboard",
      icon: "/state=dashboard.svg",
    },
    {
      link: "dashboard/pentests",
      text: "Pentests",
      icon: "/state=pentests.svg",
    },
    {
      link: "dashboard/vulnerability-reports",
      text: "Vulnerability Reports",
      icon: "/state=reports.svg",
    },
    {
      link: "dashboard/client-lists",
      text: "Client Lists",
      icon: "/state=clients.svg",
    },
    {
      link: "dashboard/pentesters-list",
      text: "Pentesters List",
      icon: "/state=pentesters.svg",
    },
  ];
  return (
    <>
    <div className="sm:hidden bg-secondary z-50 rounded-full p-2 absolute top-2 left-2"
    onClick={()=>setCollapsed(!collapsed)}><img className="w-3 h-3" src={collapsed?bars:cross} /></div>
    <div
      className={`sm:flex sm:visible bg-white w-[18.5rem] fixed z-40 sm:relative  duration-75 ${
        collapsed? "hidden sm:w-[4.75rem]":'visible flex sm:w-[15rem] lg:w-[17.5rem]'} h-auto min-h-screen flex-col justify-between items-start shrink-0 rounded-component`}
    >
      <div className="flex flex-col justify-center gap-6 self-stretch ">
        <div className="flex  items-center gap-[0.75rem] self-stretch">
          <img
            className={`${collapsed? "p-0": 'p-6'}  mt-4 sm:mt-2`}
            src={collapsed ? smallLogo : largeLogo}
          />
          <div
            className={`border cursor-pointer -right-3 hidden sm:visible border-secondary duration-200 bg-white sm:flex p-1 items-center gap-[0.625rem] rounded-full absolute ${
              collapsed ? "rotate-180" : ""
            }  top-7`}
            onClick={() => setCollapsed(!collapsed)}
          >
            <img src={leftArrow} alt="left arrow" />
          </div>
        </div>
        <div
          className={`'flex flex-col mx-8 sm:mx-auto items-start duration-100 gap-6 ${
            collapsed ? "w-[2.75rem]" : "w-40 sm:w-48 lg:w-[14.625rem]"
          }`}
        >
          {navComponents.map((nav, index) => {
            return (
              <SidebarNav
                key={index}
                link={nav.link}
                navText={nav.text}
                icon={nav.icon}
                collapsed={collapsed}
              />
            );
          })}
          <div
            className={`${
              collapsed ? "w-[2.75rem]" : "mx-auto w-5/6 sm:w-48 lg:w-[14.625rem]"
            } my-3 h-[0.0625rem] bg-secondary`}
          />
          <SidebarNav
            link="dashboard/settings"
            navText="Settings"
            icon={setting}
            collapsed={collapsed}
          />
        </div>
      </div>
      <ProfileNav image={props.image} role={props.role} name={props.name} collapsed={collapsed}/>
    </div>
    </>
  );
}

export default Sidebar;
