import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Code from "./Code";
import Credentials from "./Credentials";
import SignUpForm from "./SignUpForm";

function SignUp() {
  const [signUpCode, setSignUpCode] = useState("");
  const [credentials, setCredentials] = useState("");
  const [signUpData, setSignUpData] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);
  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className="bg-[url('/login-image.png')] bg-cover bg-center h-[20vh] sm:h-auto sm:w-1/2"></div>
      <div className="flex flex-col overflow-y-scroll sm:w-1/2 py-12 px-6 sm:px-16 self-stretch bg-[#F5F5F5]">
      <div className="">
        {signUpCode === "" && credentials === "" ? (
          <Code setSignUpCode={setSignUpCode} />
        ) : signUpCode != "" && credentials === "" ? (
          <Credentials setCredentials={setCredentials} />
        ) : (
          <SignUpForm setSignUpData={setSignUpData} />
        )}
        </div>
      </div>
    </div>
  );
}

export default SignUp;
