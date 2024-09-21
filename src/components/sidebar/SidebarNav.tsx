import React from 'react'
import { NavLink } from 'react-router-dom'
const style = `flex h-nav p-nav gap-nav items-center rounded-nav`

function SidebarNav(props) {
  return (
      <NavLink to={props.link} className={(e)=>e.isActive? `bg-secondary text-primary-900 ${style}` : `bg-white hover:bg-primary-100 text-[#64748B] ${style}`} >
        <img className={`w-[0.875rem] h-[0.875rem] ${props.collapsed && 'scale-150'}`} src={props.icon} />
        {!props.collapsed &&<p className={`text-sm ml-2 font-medium leading-tight`}> {props.navText}</p>}
      </NavLink>

  )
}

export default SidebarNav
