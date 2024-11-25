import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
const style = `flex px-4 py-3 gap-4 py-3 items-center sm:w-auto w-52 rounded-nav`

type propsType={
  link: string,
  collapsed: boolean,
  icon: string,
  navText: string
}

function SidebarNav(props: propsType) {

  const {pathname} = useLocation()
  const [active, setActive] = useState(false)

  useEffect(()=>{
    if (pathname === `/${props.link}`) {
      setActive(true)
    } else {
      setActive(false)
    }
  }, [pathname])

  return (
      <NavLink to={props.link} className={active ? `bg-primary-100 font-poppins text-primary-900 ${style}` : `bg-white hover:bg-primary-100 text-[#64748B] ${style}`} >
        <img className={`w-3 h-3 sm:w-[0.875rem] sm:h-[0.875rem] ${props.collapsed && 'scale-150'}`} src={props.icon} />
        {!props.collapsed &&<p className={`text-xs lg:text-sm font-poppins ml-2 font-medium leading-3 sm:leading-tight`}> {props.navText}</p>}
      </NavLink>

  )
}

export default SidebarNav
