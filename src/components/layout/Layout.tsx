import { useRef, useEffect, useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "@/lib/AxiosInstance";
import { apiRoutes } from "@/lib/routes";
import bars from "/bars-solid.svg";
import { useQuery } from "@tanstack/react-query";
import { useSidebar } from "@/contexts/SidebarContext";

function Layout() {
  const { isCollapsed, setCollapsed } = useSidebar();
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Fetch user details
  const {  } = useQuery({
    queryKey: ["userData"], 
    queryFn: async () => {
      const response = await axiosInstance.get(apiRoutes.user);
      setUserName(response.data.name);
      setUserImage(response.data.profilePicture);
      setUserRole(response.data.role);
      return response.data;
    },
  });

  // Redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    // Check if we have both tokens for complete authentication
    if (!token || !refreshToken) {
      localStorage.clear(); // Clear any partial authentication state

      // Add redirecturi parameter for the current path
      const currentPath = location.pathname + location.search + location.hash;
      // Only redirect if not already on login/signup routes
      if (!currentPath.startsWith('/login') && !currentPath.startsWith('/signup') && !currentPath.startsWith('/forgot-password')) {
        navigate(`/login?redirecturi=${encodeURIComponent(currentPath)}`);
      } else {
        navigate("/login");
      }
    }
  }, [navigate, location]);

  // Close the sidebar on outside clicks only on mobile
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      // Check if the viewport width is for mobile
      const isMobile = window.innerWidth < 640; // Tailwind's `sm` breakpoint
      if (
        isMobile && // Only handle outside clicks on mobile
        !isCollapsed && // Only check when sidebar is visible
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setCollapsed(true); // Collapse the sidebar
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isCollapsed, setCollapsed]);

  return (
    <div className="flex min-h-screen bg-[#E5E5E5] dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full z-10 bg-white dark:bg-gray-800 transition-all duration-200 ${
          isCollapsed
            ? "w-0 overflow-hidden sm:w-[4.75rem]"
            : "w-[15rem] sm:w-[15rem] lg:w-[17.5rem]"
        }`}
      >
        <Sidebar
          name={userName}
          image={userImage}
          role={userRole}
        />
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-200 ${
          isCollapsed ? "sm:ml-[4.75rem]" : "sm:ml-[15rem] lg:ml-[17.5rem]"
        }`}
      >
        {/* Toggle button for mobile */}
        <div
          className={`sm:hidden bg-secondary dark:bg-gray-700 z-50 rounded-full p-2 fixed top-2 left-2 cursor-pointer ${isCollapsed ? 'block' : 'hidden'}`}
          onClick={() => setCollapsed(false)}
        >
          <img
            className="w-3 h-3 dark:invert"
            src={bars}
            alt="Toggle Sidebar"
          />
        </div>

        <div className="p-4 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
