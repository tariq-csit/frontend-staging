import React from 'react'
import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className='flex'>
      <Sidebar/>
      <div className='w-full'>
        <Navbar/>
        <Outlet/>
      </div>
      
    </div>
  )
}

export default Layout
