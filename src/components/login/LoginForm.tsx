import { useState } from "react";
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
      <TwoFaAuth tempToken={tempToken} setqrCode={setqrCode}/>
    );
  } else if (token === "" && qrCode !== "") {
    return (
      <QrCodeAuth tempToken={tempToken} qrCode={qrCode} settoken={settoken} />
    );
  } else {
    return(
      <SuccessfulMessage settempToken={settempToken} setqrCode={setqrCode}/>
    )
  }
}

export default LoginForm;
