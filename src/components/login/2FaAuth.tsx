import axios from "axios";
import { Button } from "@/components/ui/button";
const twoFaApiUrl = "http://172.86.114.162:4000/api/auth/setup-2fa";


function TwoFaAuth(props: {
  tempToken: string,
  setqrCode: Function
}) {
  return (
    <div className="p-8 flex flex-col justify-center font-poppins items-center gap-12">
        <h2 className="text-xl font-semibold">
          2 Factor Authentication Setup Required
        </h2>
        <Button
          className="px-8 shadow-6"
          onClick={async () => {
            try {
              const response = await axios.post(
                twoFaApiUrl,
                {}, // If the body is empty, pass an empty object
                {
                  headers: {
                    Authorization: `Bearer ${props.tempToken}`, // Add the token to the headers
                  },
                }
              );

              props.setqrCode(response.data.qrCodeUrl);
            } catch (error) {
              console.error("Error setting up 2FA:", error);
            }
          }}
        >
          Next
        </Button>
      </div>
  )
}

export default TwoFaAuth
