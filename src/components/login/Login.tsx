import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm"
import { useEffect } from "react";

function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  return <LoginForm />;
}

export default Login
