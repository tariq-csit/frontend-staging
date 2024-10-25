import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const twoFaVerifyUrl = "http://172.86.114.162:4000/api/auth/setup-2fa-verify";

const pinSchema = z.object({
  pin: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

function QrCodeAuth(props: {
  qrCode: string;
  tempToken: string;
  settoken: (token: string) => void;
}) {
  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });

  async function pinSubmit(data: z.infer<typeof pinSchema>) {
    try {
      const response = await axios.post(
        twoFaVerifyUrl,
        { token: data.pin },
        {
          headers: {
            Authorization: `Bearer ${props.tempToken}`,
          },
        }
      );
      props.settoken(response.data.token);
      localStorage.setItem("token", response.data.token);
    } catch (error: any) {
      console.log(error);
    }
  }

  return (
    <div className="p-8 flex flex-col justify-center font-poppins items-center gap-12">
      <h2 className="text-xl font-semibold">Scan this QR code to set up 2FA:</h2>
      <img
        src={props.qrCode}
        alt="QR code"
        style={{ width: "256px", height: "256px", objectFit: "contain" }}
      />
      <Form {...pinForm}>
        <form onSubmit={pinForm.handleSubmit(pinSubmit)} className="w-2/3 space-y-6">
          <FormField
            control={pinForm.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}

export default QrCodeAuth;
