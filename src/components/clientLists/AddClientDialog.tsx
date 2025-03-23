import fileIcon from "/file.svg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { apiRoutes } from "@/lib/routes";
import axiosInstance from "@/lib/AxiosInstance";
import { PlusIcon } from "lucide-react";

const formSchema = z.object({
  companyName: z.string().min(1),
  email: z.string().email(),
  uploadLogo: z.string().min(1),
})

export default function SendCode() {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      email: "",
      uploadLogo: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    formData.append("logo", values.uploadLogo[0]);
    try {
      // First, upload the logo
      const logoResponse = await axiosInstance.post(apiRoutes.uploadLogo, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      form.setValue("uploadLogo", logoResponse.data.url);

    } catch (error) {
      console.error('Error during logo upload or user signup:', error);
    }

    // TODO: add the logic to add the pentester when you have the api
    console.log(values)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <PlusIcon />
          <span>Add Client</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">Send Signup Code</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="(i.e Security Wall)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Point of Contact</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      placeholder="(i.e hxmir.@gmail.com)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uploadLogo"
              render={({ field }) => (
                <FormItem className="flex w-full sm:col-span-3 flex-col items-start gap-2">
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center gap-2 rounded-formInput border border-dashed bg-[#F5F5F5] border-inputBorder p-2.5 self-stretch">
                      <div className="flex flex-col items-center gap-2 self-stretch">
                        <img className="" src="/papers.svg" />
                        <div className="flex w-3/5 sm:w-auto px-4 justify-center items-center sm:gap-8 border rounded-formInput border-[#353086]">
                          <img src={fileIcon} />
                          <Input
                            type="file"
                            placeholder="Choose files"
                            className="border-none"
                            onChange={(e) => {
                              field.onChange(e.target.files);
                            }}
                          />
                        </div>
                        <label className="font-poppins text-inputBorder text-base lowercase font-medium">
                          or drop files here
                        </label>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="px-6 py-4 border-t flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => form.reset()}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
            Send Signup Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}