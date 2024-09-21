import React from "react";
import { useState } from "react";
import dashboard from "/state=dashboard.svg";
import leftArrow from "/chevron-left.svg";
import reports from "/state=reports.svg";
import clients from "/state=clients.svg";
import pentesters from "/state=pentesters.svg";
import pentests from "/state=pentests.svg";
import SidebarNav from "./SidebarNav";
import setting from "/tage=setting.svg";
import largeLogo from "/logo-large.png";
import smallLogo from "/logo-small.png";
import ProfileNav from "./ProfileNav";
import bars from '/bars-solid.svg'
import cross from '/xmark-solid.svg'
function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navComponents = [
    {
      link: "dashboard",
      text: "Dashboard",
      icon: dashboard,
    },
    {
      link: "pentest",
      text: "Pentests",
      icon: pentests,
    },
    {
      link: "reports",
      text: "Vulnerability Reports",
      icon: reports,
    },
    {
      link: "client-list",
      text: "Client Lists",
      icon: clients,
    },
    {
      link: "pentesters-list",
      text: "Pentesters List",
      icon: pentesters,
    },
  ];
  return (
    <>
    <div className="sm:hidden bg-secondary z-10 rounded-full p-2 absolute top-2 left-2"
    onClick={()=>setCollapsed(!collapsed)}><img className="w-3 h-3" src={collapsed?bars:cross} /></div>
    <div
      className={`sm:flex sm:visible bg-white  w-[12.5rem] absolute sm:relative  duration-75 ${
        collapsed? "hidden sm:w-[4.75rem]":'visible flex sm:w-[17.5rem]'} h-screen flex-col justify-between items-start shrink-0 rounded-component`}
    >
      <div className="flex flex-col justify-center gap-6 self-stretch ">
        <div className="flex p-component items-center gap-[0.75rem] self-stretch">
          <img
            className={`${collapsed && "scale-[3.0]"} mt-4 sm:mt-2`}
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
          className={`'flex flex-col mx-auto items-start duration-100 gap-component ${
            collapsed ? "w-[2.75rem]" : "w-40 sm:w-[14.625rem]"
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
              collapsed ? "w-[2.75rem]" : "mx-auto w-5/6 sm:w-[14.625rem]"
            } my-3 h-[0.0625rem] bg-secondary`}
          />
          <SidebarNav
            link="/setting"
            navText="Settings"
            icon={setting}
            collapsed={collapsed}
          />
        </div>
      </div>
      <ProfileNav collapsed={collapsed}/>
    </div>
    </>
  );
}

export default Sidebar;
