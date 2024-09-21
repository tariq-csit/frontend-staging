import React from 'react'
import { useState } from 'react'
import dashboard from '/state=dashboard.svg'
import leftArrow from '/chevron-left.svg'
import reports from '/state=reports.svg'
import clients from '/state=clients.svg'
import pentesters from '/state=pentesters.svg'
import support from '/state=support.svg'
import pentests from '/state=pentests.svg'
import SidebarNav from './sidebarNav'
import setting from '/tage=setting.svg'
import largeLogo from '/logo-large.png'
import smallLogo from '/logo-small.png'
function Sidebar() {

  const [collapsed, setCollapsed] = useState(false)

  const navComponents = [
    {
      link: 'dashboard',
      text: 'Dashboard',
      icon: dashboard
    },
    {
      link: 'pentest',
      text: 'Pentests',
      icon: pentests
    },
    {
      link: 'reports',
      text: 'Vulnerability Reports',
      icon: reports
    },
    {
      link: 'client-list',
      text: 'Client Lists',
      icon: clients
    },
    {
      link: 'pentesters-list',
      text: 'Pentesters List',
      icon: pentesters
    },
  ]
  return (
    <div className={`flex w-[17.5rem] duration-75 ${collapsed && 'w-[4.75rem]'} h-screen flex-col justify-between items-start shrink-0 rounded-component`}>
      
      
      <div className='flex flex-col justify-center gap-6 self-stretch '>
      
        <div className='flex p-component items-center gap-[0.75rem] self-stretch'>
          <img className={`${collapsed && 'scale-[3.0]'}`} src={collapsed? smallLogo : largeLogo} />
        <div className={`border cursor-pointer border-secondary duration-200 bg-white flex p-1 items-center gap-[0.625rem] rounded-full absolute ${collapsed?'left-16 rotate-180':'left-[16.7rem]'}  top-7`} onClick={()=>setCollapsed(!collapsed)}><img src={leftArrow} alt="left arrow" /></div>
      
      </div>
      <div className={`'flex flex-col mx-auto items-start duration-100 gap-component ${collapsed?'w-[2.75rem]': 'w-[14.625rem]'}`}>

      {
        navComponents.map((nav, index)=>{
          return(
            <SidebarNav key={index} link= {nav.link} navText={nav.text} icon={nav.icon} collapsed={collapsed}/>
          )
        })
      }   
      <div className={`${collapsed?'w-[2.75rem]':'w-[14.625rem]'} my-3 h-[0.0625rem] bg-secondary`}/>
      <SidebarNav link='/setting' navText='Settings' icon={setting} collapsed={collapsed}/>   
      </div>
      </div>
    </div>
  )
}

export default Sidebar
