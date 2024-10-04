import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className='flex'>
      <Sidebar/>
      <div className='w-full flex flex-col gap-10 bg-[#E5E5E5]'>
        <Navbar/>
        <Outlet/>
      </div>
      
    </div>
  )
}

export default Layout
