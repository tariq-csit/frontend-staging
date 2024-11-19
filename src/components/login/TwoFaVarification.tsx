import { Button } from '@/components/ui/button'
import { apiRoutes } from '@/lib/routes';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

const pinSchema = z.object({
  pin: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});


function TwoFaVarification(props:{
  varificationToken: string
}) {
  const navigate = useNavigate();

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });

  async function pinSubmit(data: z.infer<typeof pinSchema>) {
    try {
      const response = await axios.post(
        apiRoutes.verify2Fa,
        {'token':data.pin},
        {
          headers: {
            Authorization: `Bearer ${props.varificationToken}`,
          },
        }
      );
      
      sessionStorage.setItem('token', response.data.token)
      navigate('/dashboard')
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      console.log(data.pin)
    } 
  }


  return (
    <div className="p-8 flex flex-col justify-center font-poppins items-center gap-12">
        <h2 className="text-xl font-semibold">
          Verify 2 Factor Authentication
        </h2>
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
          <Button type="submit">Verify</Button>
        </form>
      </Form>
      
    </div>
  )
}

export default TwoFaVarification
