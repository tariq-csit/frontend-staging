import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="p-8 flex flex-col justify-center font-poppins items-center gap-8 max-w-xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-center">
              Two-Factor Authentication Setup Complete
            </CardTitle>
            <CardDescription className="text-center">
              Your account is now protected with an additional layer of security
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="text-center">
              To ensure everything is working correctly, you'll need to sign in again
              using your password and the verification code from your authenticator app.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800">
                <strong>Important:</strong> Make sure to keep your authenticator app safe and accessible.
                If you lose access to your authenticator app, you'll need to contact support to regain
                access to your account.
              </p>
            </div>
          </div>

          <Button 
            onClick={handleComplete}
            className="w-full"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign in with 2FA
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default SuccessfulMessage;
