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
import { Input } from "@/components/ui/input";
const formSchema = z.object({
  signUpCode: z.string().min(2, {
    message: "Sign Up code must be atleast 9 charaters long.",
  }),
});



const Code = (props:{
  setSignUpCode: (code:string)=>void,
})=>{

   const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        signUpCode: "",
      },
    });

  const pinSubmit=(data: z.infer<typeof formSchema>)=>{
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
        <Form {...form}>
        <form onSubmit={form.handleSubmit(pinSubmit)} className="flex flex-col justify-center gap-6 self-stretch">
          <FormField
            control={form.control}
            name="signUpCode"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                <Input {...field} className="bg-white" placeholder="i.e, xxi-jjh-ttk" />
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
