import LoginForm from "./LoginForm"



function Login() {

  return (
    <div className='flex'>
      <div className="bg-login bg-cover bg-center w-1/2"></div>
      <div className="flex w-1/2 py-12 px-10 flex-col items-center shrink-0 self-stretch bg-[#F5F5F5]">
        <div className="flex px-10 flex-col items-start justify-center gap-8 flex-component self-start">
          <div className="flex flex-col items-start gap-8 self-stretch">
            
            <div className="flex flex-col justify-center items-start gap-3 self-stretch">
              <h1 className="font-poppins text-[2.5rem] font-semibold">Welcome Back!</h1>
              <p className="self-stretch text-inputBorder font-poppins text-lg">
                Please sign in to streamline the management and monitoring of penetration tests.
              </p>
            </div>
            <LoginForm/>
            <p className="font-poppins text-inputBorder ">Don’t have an account?<a className="text-primary-900 font-medium cursor-pointer"> Signup Now!</a></p>
            <div className="flex flex-col items-start gap-[0.5625rem] self-stretch">
              <div className="flex justify-center items-center gap-3 self-stretch text-inputBorder">
                <div className="w-[4.375rem] border h-[0.0625rem] bg-inputBorder"/>
                <span className="w-[1.0625rem] h-[1.1875rem] -mt-2">or</span> 
                <div className="w-[4.375rem] border h-[0.0625rem] bg-inputBorder"/> 
              </div>
              <div className="flex justify-center items-center gap-2 self-stretch">
                <img src="/google.svg"  />
                <span className="w-[9.9375rem] text-inputBorder font-poppins">Sign in with Google</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
