import Sidebar from '../sidebar/Sidebar';
import Navbar from '../navbar/Navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/AxiosInstance';
import { apiRoutes } from '@/lib/routes';

function Layout() {
  const [collapsed, setCollapsed] = useState(false); // State to manage sidebar collapse
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await axiosInstance.get(apiRoutes.user);
      setUserName(response.data.name);
      setUserImage(response.data.img);
      setUserRole(response.data.role);
    })();
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full z-10 bg-white shadow-md transition-all duration-300 ${
          collapsed ? 'hidden sm:block sm:w-[4.75rem]' : 'visible sm:w-[15rem] lg:w-[17.5rem]'
        }`}
      >
        <Sidebar
          name={userName}
          image={userImage}
          role={userRole}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* Main Content */}
      <div
        className={`w-screen flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'sm:ml-[4.75rem]' : 'sm:ml-[15rem] lg:ml-[17.5rem]'
        }`}
      >
        <Navbar name={userName} role={userRole} image={userImage} />
        <div className="flex-1 sm:overflow-y-auto bg-[#E5E5E5] pt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
