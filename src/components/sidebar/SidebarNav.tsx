import React from 'react'
import { NavLink } from 'react-router-dom'
const style = 'flex h-nav p-nav items-center gap-nav self-stretch rounded-nav'

function SidebarNav(props) {
  return (
      <NavLink to={props.link} className={(e)=>e.isActive? `bg-secondary ${style}` : `bg-white ${style}`} ><img src={props.icon}/><p className='text-sm'> {props.navText}</p></NavLink>

  )
}

export default SidebarNav
