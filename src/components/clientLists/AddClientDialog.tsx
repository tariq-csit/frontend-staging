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
import { Loader2, PlusIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";

interface UploadResponse {
  url: string;
}

const formSchema = z.object({
  companyName: z.string().min(1),
  email: z.string().email(),
  uploadLogo: z.string().optional(),
})

export default function AddClientDialog({refetch}: {refetch: () => void}) {
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      email: "",
      uploadLogo: "",
    },
  })

  const {mutate: addClient, isPending: isAddingClient} = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await axiosInstance.post(apiRoutes.clients.all, {
        "name": values.companyName,
        "poc_email": values.email,
        "logoUrl": values.uploadLogo,
      });
      return res.data;
    },
    onSuccess: () => {
      // refetch the clients list
      refetch();
      form.reset();
      setOpen(false);
    }
  })

  const {mutate: uploadLogo} = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      const response = await axiosInstance.post(apiRoutes.uploadLogo, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data as UploadResponse;
    },
    onSuccess: (data) => {
      form.setValue("uploadLogo", data.url);
    },
    onError: (error) => {
      console.error('Error uploading logo:', error);
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      addClient(values);
    } catch (error) {
      console.error('Error during client creation:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <PlusIcon />
          <span>Add Client</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">Add Client</DialogTitle>
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
              render={({field}) => (
                <FormItem className="flex w-full sm:col-span-3 flex-col items-start gap-2">
                  <FormLabel>Company Logo</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={uploadedFile ? [uploadedFile] : []}
                      onChange={async (files) => {
                        if (files.length > 0) {
                          setUploadedFile(files[0]);
                          await uploadLogo(files[0]);
                        } else {
                          setUploadedFile(null);
                          field.onChange("");
                        }
                      }}
                      maxFiles={1}
                      maxSize={5 * 1024 * 1024} // 5MB
                      acceptedTypes={{
                        'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.svg']
                      }}
                      className="w-full"
                    />
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
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isAddingClient}>
            {isAddingClient ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Adding Client...</span></>) : "Add Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}