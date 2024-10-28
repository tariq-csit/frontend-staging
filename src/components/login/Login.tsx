import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm"
import { useEffect } from "react";



function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);
  return (
    <div className='flex min-h-screen'>
      <div className="bg-login bg-cover bg-center w-1/2"></div>
      <div className="flex w-1/2 py-12 px-10 flex-col items-center justify-center shrink-0 self-stretch bg-[#F5F5F5]">
            <LoginForm/>
          </div>
        </div>
  )
}

export default Login
