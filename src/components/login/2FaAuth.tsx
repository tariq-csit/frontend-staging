import axios from "axios";
import { apiRoutes } from "@/lib/routes";
import { Button } from "@/components/ui/button";

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
                apiRoutes.twoFa,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${props.tempToken}`,
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
