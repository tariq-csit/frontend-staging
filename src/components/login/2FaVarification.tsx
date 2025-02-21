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
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from 'react';
import { Loader } from 'lucide-react';

const pinSchema = z.object({
  pin: z.string().length(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});


function TwoFaVarification(props:{
  varificationToken: string,
  email: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const navigate = useNavigate();

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });

  async function pinSubmit(data: z.infer<typeof pinSchema>) {
    setLoading(true)
    setError(false)
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
      setLoading(false)
      pinForm.reset();
      console.log(response)
      
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      setLoading(false)
      setError(true)
      pinForm.reset();
    } 
  }

  if(loading){
    return(
      <div className="p-8 flex flex-col justify-center font-poppins items-center gap-12 h-screen">
        <Loader/>
      </div> 
    )
  }
  if(error){
    return(
      <div className="flex flex-col justify-center font-poppins gap-12 items-center">
        <h2 className="text-4xl font-semibold">
          Invalid Token.
        </h2>
        <Button
        onClick={()=>setError(false)}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className='flex px-10 flex-col justify-center items-center gap-8 flex-component self-stretch'>

    <div className="flex flex-col justify-center items-center gap-8 self-stretch">
    <img src="/authentication.svg" className='w-24' />
    <div className='flex flex-col justify-center gap-3 self-stretch'>
        <h2 className="text-4xl font-semibold text-center font-poppins self-stretch">
        Authenticate Your Account
        </h2>
        <p className='text-inputBorder font-poppins text-lg self-stretch'>
        Enter the code from you authenticator app
        </p>
        </div>
        <Form {...pinForm}>
        <form onSubmit={pinForm.handleSubmit(pinSubmit)} className="flex flex-col justify-center gap-6 self-stretch">
          <FormField
            control={pinForm.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup >
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
          <Button type="submit" className='text-xl' size={'lg'}>Submit</Button>
        </form>
      </Form>
      
    </div>
    </div>

  )
}

export default TwoFaVarification
