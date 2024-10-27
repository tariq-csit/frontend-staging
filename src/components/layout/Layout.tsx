import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';

function Layout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);
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
