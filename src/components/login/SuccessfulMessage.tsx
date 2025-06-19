import { Button } from "@/components/ui/button";
import { CheckCircle2, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SuccessfulMessage(props: {
  settempToken: Function;
  setqrCode: Function;
}) {
  const navigate = useNavigate();

  const handleComplete = () => {
    props.settempToken("");
    props.setqrCode("");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Left side - Abstract ellipses background */}
      <div className="hidden md:flex border-r border-gray-200 dark:border-white/10 md:w-1/2 bg-gray-50 dark:bg-black p-8 flex-col justify-between relative overflow-hidden">
        {/* Blurred ellipses background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl opacity-10 dark:opacity-30"></div>
          <div className="absolute top-40 right-10 w-80 h-80 bg-primary rounded-full blur-3xl opacity-50 dark:opacity-20"></div>
          <div className="absolute bottom-32 left-10 w-72 h-72 bg-primary rounded-full blur-3xl opacity-50 dark:opacity-25"></div>
          <div className="absolute bottom-10 right-32 w-64 h-64 bg-primary rounded-full blur-3xl opacity-50 dark:opacity-15"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary rounded-full blur-3xl opacity-50 dark:opacity-10"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-2 text-gray-800 dark:text-white">
        </div>
        <div className="relative z-10 text-gray-800 dark:text-white max-w-md mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold mb-2">
            <img src="/logo-large.png" alt="Slash Logo" className="h-20 dark:invert" />
          </h1>
          <p className="text-sm text-gray-600 dark:text-white/80 mb-8">
            Your account is now protected with two-factor authentication. Welcome to Slash!
          </p>
        </div>
        <div className="relative z-10 text-center text-gray-500 dark:text-white/60 text-sm">
          Copyright © 2025 Slash
        </div>
      </div>

      {/* Right side - Success Form */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center bg-white dark:bg-black">
        <div className="w-full max-w-md">
          <div className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl p-8 space-y-6 shadow-lg dark:shadow-none">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Setup Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Your account is now protected with an additional layer of security</p>
            </div>

            {/* Success Content */}
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                To ensure everything is working correctly, you'll need to sign in again
                using your password and the verification code from your authenticator app.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  <strong>Important:</strong> Make sure to keep your authenticator app safe and accessible.
                  If you lose access to your authenticator app, you'll need to contact support to regain
                  access to your account.
                </p>
              </div>
            </div>

            <Button 
              onClick={handleComplete}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign in with 2FA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessfulMessage;
