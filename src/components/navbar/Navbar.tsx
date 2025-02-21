import downArrow from "/all-screen-icons.svg";
import notificationBell from "/state=no-ntfcn.svg";
import ntfcnOrange from "/ntfcn=orange.svg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/AxiosInstance";
import { apiRoutes } from "@/lib/routes";

function Navbar(props: { name: string; image: string; role: string }) {
  const handleLogout = async () => {
    try {
      sessionStorage.clear();
      axiosInstance.post(apiRoutes.logout);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex pl-0 pr-6 sm:pr-10 w-full py-4 flex-col h-12 justify-center items-center self-stretch border-b border-secondary bg-white shadow-6">
      <div className="flex pl-10 justify-end items-center gap-6 self-stretch">
        <div className="flex justify-center items-center gap-5 sm:gap-8 lg:gap-[2.8125rem]">
          <div className="flex items-center gap-3">
            <div className="text-end">
              <p className="text-xs font-poppins font-medium">{props.name}</p>
              <p className="text-xs text-inputBorder font-poppins font-normal">
                {props.role}
              </p>
            </div>
            <img className="w-7" src={props.image} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <img
                  className="w-2 sm:w-3 cursor-pointer"
                  src={downArrow}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <img
            className="w-3 sm:w-[1.125rem] h-[1.125rem]"
            src={notificationBell}
          />
          <img
            className="absolute right-8 sm:right-[3.4rem] top-[1.6rem]"
            src={ntfcnOrange}
          />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
