import { useRef, useEffect, useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import Navbar from '../navbar/Navbar';
import { Outlet, useNavigate } from 'react-router-dom';
import axiosInstance from '@/lib/AxiosInstance';
import { apiRoutes } from '@/lib/routes';
import bars from '/bars-solid.svg';
import cross from '/xmark-solid.svg';

function Layout() {
  const [collapsed, setCollapsed] = useState(false); // State to manage sidebar collapse
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fetch user details
  useEffect(() => {
    (async () => {
      const response = await axiosInstance.get(apiRoutes.user);
      setUserName(response.data.name);
      setUserImage(response.data.img);
      setUserRole(response.data.role);
    })();
  }, []);

  // Redirect to login if no token
  useEffect(() => {
    if (!sessionStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  // Close the sidebar on outside clicks
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        !collapsed && // Only check when sidebar is visible
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setCollapsed(true); // Collapse the sidebar
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [collapsed]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full z-10 bg-white ${
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
        className={`w-screen flex-1 flex flex-col ${
          collapsed ? 'sm:ml-[4.75rem]' : 'sm:ml-[15rem] lg:ml-[17.5rem]'
        }`}
      >
        {/* Toggle button for mobile */}
        <div
          className="sm:hidden bg-secondary z-50 rounded-full block p-2 absolute top-2 left-2"
          onClick={() => setCollapsed(!collapsed)}
        >
          <img className="w-3 h-3" src={collapsed ? bars : cross} />
        </div>
        <Navbar name={userName} role={userRole} image={userImage} />
        <div
          className={`flex-1 bg-[#E5E5E5] overflow-hidden relative`}
        >
          <div className="absolute inset-0 overflow-y-auto pt-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
