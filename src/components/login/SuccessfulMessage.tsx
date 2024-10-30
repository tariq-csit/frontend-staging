import { Link } from "react-router-dom";

function SuccessfulMessage() {
  return (
    <div className="p-8 flex flex-col justify-center font-poppins items-center gap-12">
      <h2 className="text-xl font-semibold">
        2 Factor Authentication Successful
      </h2>
      <Link to={"/login"} className="px-8 shadow-6">
        Login
      </Link>
    </div>
  )
}

export default SuccessfulMessage
