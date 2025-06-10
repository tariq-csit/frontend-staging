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

  if (signUpData.code === "" && signUpData.name === "") {
    return <Code setSignUpData={setSignUpData as (data: Partial<SignUpData>) => void} signUpData={signUpData} />;
  } else if (signUpData.code != "" && signUpData.companyName === "") {
    return <Credentials setSignUpData={setSignUpData as (data: Partial<SignUpData>) => void} signUpData={signUpData} />;
  } else {
    return <SignUpForm setSignUpData={setSignUpData as (data: Partial<SignUpData>) => void} signUpData={signUpData} />;
  }
}

export default SignUp;
