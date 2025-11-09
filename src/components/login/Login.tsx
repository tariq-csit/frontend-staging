import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm"
import { useEffect, useState } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

function Login() {
  const navigate = useNavigate();
  const { redirectTo } = useAuthRedirect();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      redirectTo();
    }
    setIsCheckingAuth(false);
  }, [redirectTo]);

  if (isCheckingAuth) {
    return null; // or return a loading spinner if you prefer
  }

  // Only render LoginForm if we're done checking auth and there's no token
  return <LoginForm />;
}

export default Login
