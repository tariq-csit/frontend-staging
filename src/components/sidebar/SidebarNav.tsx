import React from 'react'
import { NavLink } from 'react-router-dom'
const style = `flex h-nav p-nav gap-nav items-center rounded-nav`

type propsType={
  link: string,
  collapsed: boolean,
  icon: any,
  navText: string
}

function SidebarNav(props: propsType) {
  return (
      <NavLink to={props.link} className={(e)=>e.isActive? `bg-primary-100 font-poppins text-primary-900 ${style}` : `bg-white hover:bg-primary-100 text-[#64748B] ${style}`} >
        <img className={`w-3 h-3 sm:w-[0.875rem] sm:h-[0.875rem] ${props.collapsed && 'scale-150'}`} src={props.icon} />
        {!props.collapsed &&<p className={`text-2xs sm:text-xs lg:text-sm font-poppins sm:ml-2 font-medium leading-3 sm:leading-tight`}> {props.navText}</p>}
      </NavLink>

  )
}

export default SidebarNav
