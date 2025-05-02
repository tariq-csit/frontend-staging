import { Button } from '@/components/ui/button'
import { apiRoutes } from '@/lib/routes';
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/AxiosInstance';
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

const pinSchema = z.object({
  pin: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

function TwoFaVarification(props:{
  varificationToken: string,
  email: string
}) {
  const navigate = useNavigate();
  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });

  const verify2FaMutation = useMutation({
    mutationFn: async (data: z.infer<typeof pinSchema>) => {
      const response = await axiosInstance.post(
        apiRoutes.verify2Fa,
        {'token': data.pin},
        {
          headers: {
            Authorization: `Bearer ${props.varificationToken}`,
          },
        }
      );
      console.log(response.data);
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      toast({
        title: "Success",
        description: "2FA verification successful!",
      });
      navigate('/dashboard');
      pinForm.reset();
    },
    onError: (error) => {
      console.error("Error verifying 2FA:", error);
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
      pinForm.reset();
    },
  });

  function onSubmit(data: z.infer<typeof pinSchema>) {
    verify2FaMutation.mutate(data);
  }

  return (
    <div className='flex px-10 flex-col justify-center items-center gap-8 flex-component self-stretch'>
      <div className="flex flex-col justify-center items-center gap-8 self-stretch">
        <img src="/authentication.svg" className='w-24' alt="Authentication" />
        <div className='flex flex-col justify-center gap-3 self-stretch'>
          <h2 className="text-4xl font-semibold text-center font-poppins self-stretch">
            Authenticate Your Account
          </h2>
          <p className='text-inputBorder font-poppins text-lg self-stretch'>
            Enter the code from your authenticator app
          </p>
        </div>
        <Form {...pinForm}>
          <form onSubmit={pinForm.handleSubmit(onSubmit)} className="flex flex-col justify-center gap-6 self-stretch">
            <FormField
              control={pinForm.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
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
            <FormDescription className='text-inputBorder font-popins text-lg self-stretch'>
              <p>If you want to reset your 2FA setup contact support@securitywall.co</p>
            </FormDescription>
            <Button 
              type="submit" 
              className='text-xl' 
              size={'lg'}
              disabled={verify2FaMutation.isPending}
            >
              {verify2FaMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default TwoFaVarification
