import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
const pinSchema = z.object({
  pin: z.string().length(6, {
    message: "Your sign-up code must be 6 characters.",
  }),
});



const Code = (props:{
  setSignUpCode: (code:string)=>void,
})=>{

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });

  const pinSubmit=(data: z.infer<typeof pinSchema>)=>{
    props.setSignUpCode(data.toString())
  }

  return(
    <div className='flex px-10 flex-col justify-center items-center gap-8 flex-component self-stretch'>

    <div className="flex flex-col justify-center items-center gap-8 self-stretch">
    <img src="/authentication.svg" className='w-24' />
    <div className='flex flex-col justify-center gap-3 self-stretch'>
        <h2 className="text-4xl font-semibold text-center font-poppins self-stretch">
          Enter your signup code
        </h2>
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
          <Button type="submit" className='text-xl' size={'lg'}>Continue</Button>
        </form>
      </Form>
      <div className="flex gap-3 justify-center w-full">
        <div className="w-2 h-2 rounded-full bg-primary-900" />
        <div className="w-2 h-2 rounded-full bg-[#C8C8C8]" />
        <div className="w-2 h-2 rounded-full bg-[#C8C8C8]" />
      </div>      
    </div>
    </div>
  )
}

export default Code;
