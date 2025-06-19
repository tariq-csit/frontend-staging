import { useState, useEffect } from "react";
import InitialForm from "./InitialForm";
import TwoFaAuth from "./2FaAuth";
import QrCodeAuth from "./QrCodeAuth";
import SuccessfulMessage from "./SuccessfulMessage";
import TwoFaVarification from "./2FaVarification";

function LoginForm() {
  const [varificationToken, setvarificationToken] = useState('')
  const [tempToken, settempToken] = useState("");
  const [qrCode, setqrCode] = useState("");
  const [token, settoken] = useState("");
  const [email, setEmail] = useState('');
  const [setupKey, setsetupKey] = useState("");
  
  useEffect(() => {
    // Monitor setupKey changes for debugging/logging purposes
    if (setupKey) {
      console.log('2FA setup key generated:', setupKey.substring(0, 8) + '...');
    }
  }, [setupKey]);

  useEffect(() => {
    // Clear any stale authentication state on component mount
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // If we have tokens but we're on the login form, they might be stale
    if (token || refreshToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }, []);

  if (tempToken === "" && varificationToken === "") {
    return (
      <InitialForm settempToken={settempToken} setvarificationToken={setvarificationToken} setEmail={setEmail}/>
    );
  } else if (varificationToken !== "" && tempToken === "") {
    return (
      <TwoFaVarification varificationToken={varificationToken} email={email}/>
    );
  } else if (tempToken !== "" && qrCode === "") {
    return (
      <TwoFaAuth tempToken={tempToken} setqrCode={setqrCode} setsetupKey={setsetupKey}/>
    );
  } else if (token === "" && qrCode !== "") {
    return (
      <QrCodeAuth tempToken={tempToken} qrCode={qrCode} settoken={settoken} setupKey={setupKey} />
    );
  } else {
    return(
      <SuccessfulMessage settempToken={settempToken} setqrCode={setqrCode}/>
    )
  }
}

export default LoginForm;
