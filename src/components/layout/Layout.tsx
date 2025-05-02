import { useRef, useEffect, useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/AxiosInstance";
import { apiRoutes } from "@/lib/routes";
import bars from "/bars-solid.svg";
import { useQuery } from "@tanstack/react-query";

function Layout() {
  const [collapsed, setCollapsed] = useState(true); // State to manage sidebar collapse
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

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
      navigate("/login");
    }
  }, [navigate]);

// Close the sidebar on outside clicks only on mobile
useEffect(() => {
  const handleOutsideClick = (event: MouseEvent) => {
    // Check if the viewport width is for mobile
    const isMobile = window.innerWidth < 640; // Tailwind's `sm` breakpoint
    if (
      isMobile && // Only handle outside clicks on mobile
      !collapsed && // Only check when sidebar is visible
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
}, [collapsed]);


  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full z-10 bg-white ${
          collapsed
            ? "w-0 overflow-hidden sm:w-[4.75rem]"
            : "w-[15rem] sm:w-[15rem] lg:w-[17.5rem]"
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
          collapsed ? "sm:ml-[4.75rem]" : "sm:ml-[15rem] lg:ml-[17.5rem]"
        }`}
      >
        {/* Toggle button for mobile */}
        <div
          className={`sm:hidden bg-secondary z-50 rounded-full p-2 absolute top-2 left-2 cursor-pointer ${collapsed?'block':'hidden'}`}
          onClick={() => {
            setCollapsed(false);
          }}
        >
          <img
            className="w-3 h-3"
            src={bars}
            alt="Toggle Sidebar"
          />
        </div>

        <div className={`flex-1 bg-[#E5E5E5] relative`}>
          <div className="overflow-y-auto p-4 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
