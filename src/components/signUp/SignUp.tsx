import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Code from "./Code";
import Credentials from "./CompanyCredentials";
import SignUpForm from "./SignUpForm";
import { SignUpData } from "@/types/types";


function SignUp() {
  const [signUpData, setSignUpData] = useState<SignUpData>({
    name: "",
    email: "",
    password: "",
    code: "",
    companyName: "",
    poc_email: "",
    logoUrl: "",
  });

  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);


  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className="bg-[url('/login-image.png')] bg-cover bg-center h-[20vh] sm:h-auto sm:w-1/2"></div>
      <div className="flex flex-col overflow-y-scroll sm:w-1/2 py-12 px-6 sm:px-16 self-stretch bg-[#F5F5F5]">
      <div className="">
        {signUpData.code === "" && signUpData.name === "" ? (
          <Code setSignUpData={setSignUpData as (data: Partial<SignUpData>) => void} signUpData={signUpData} />
        ) : signUpData.code != "" && signUpData.companyName === "" ? (
          <Credentials setSignUpData={setSignUpData as (data: Partial<SignUpData>) => void} signUpData={signUpData} />
        ) : (
          <SignUpForm setSignUpData={setSignUpData as (data: Partial<SignUpData>) => void} signUpData={signUpData} />
        )}
        </div>
      </div>
    </div>
  );
}

export default SignUp;
