import Sidebar from '../sidebar/Sidebar'
import Navbar from '../navbar/Navbar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/AxiosInstance';
import { apiRoutes } from '@/lib/routes';

function Layout() {
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')
  const [userRole, setUserRole] = useState('')
  const navigate = useNavigate();
  useEffect(()=>{
    ;(async ()=>{
      const response = await axiosInstance.get(apiRoutes.user);
      setUserName(response.data.name)
      setUserImage(response.data.img)
      setUserRole(response.data.role)
    })()
  })
  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);
  return (
    <div className='flex'>
      <Sidebar name={userName} image={userImage} role={userRole}/>
      <div className='w-full flex flex-col gap-10 bg-[#E5E5E5]'>
        <Navbar name={userName} role={userRole} image={userImage}/>
        <Outlet/>
      </div>
      
    </div>
  )
}

export default Layout
