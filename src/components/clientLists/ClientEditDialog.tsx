import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form"
import { apiRoutes } from "@/lib/routes"
import axiosInstance from "@/lib/AxiosInstance"
import { useMutation } from "@tanstack/react-query"
import type { Client } from "@/types/types"
import type { Dispatch, SetStateAction } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { FileUpload } from "@/components/FileUpload"
import { useState, useEffect } from "react"

interface UploadResponse {
  url: string;
}

const formSchema = z.object({
  companyName: z.string().min(1),
  email: z.string().email(),
  uploadLogo: z.string().min(1),
})

interface ClientEditDialogProps {
  client: Client
  refetch: () => void
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

export default function ClientEditDialog({ client, refetch, open, onOpenChange }: ClientEditDialogProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState(client.logoUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: client.name,
      email: client.poc_email,
      uploadLogo: client.logoUrl,
    },
  })

  const { mutate: updateClient, isPending: isUpdatingClient } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await axiosInstance.put(apiRoutes.clients.detail(client._id), {
        name: values.companyName,
        poc_email: values.email,
        logoUrl: currentLogoUrl,
      })
      return res.data
    },
    onSuccess: () => {
      toast({
        title: "Client updated successfully",
        description: "The client has been updated successfully",
      })
      refetch()
      onOpenChange(false)
    },
  })

  const { mutate: uploadLogo, isPending: isUploadingLogo } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("logo", file)
      const response = await axiosInstance.post(apiRoutes.uploadLogo, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data as UploadResponse
    },
    onSuccess: (data) => {
      setCurrentLogoUrl(data.url)
      form.setValue("uploadLogo", data.url)
    },
    onError: (error) => {
      console.error("Error uploading logo:", error)
      toast({
        title: "Error uploading logo",
        description: "There was an error uploading the logo. Please try again.",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (open) {
      setCurrentLogoUrl(client.logoUrl)
      setUploadedFile(null)
    }
  }, [open, client.logoUrl])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      updateClient(values)
    } catch (error) {
      console.error("Error during client update:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem className="flex justify-start items-start flex-col gap-2">
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="(i.e Security Wall)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex justify-start items-start flex-col gap-2">
                  <FormLabel>Point of Contact</FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="(i.e hxmir.@gmail.com)" {...field} />
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
                      maxSize={5 * 1024 * 1024} // 5MB
                      acceptedTypes={{
                        'image/*': ['.jpg', '.jpeg', '.png']
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

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              form.reset()
              onOpenChange(false)
            }}
            disabled={isUploadingLogo}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isUpdatingClient || isUploadingLogo}
          >
            {isUpdatingClient ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
            ) : isUploadingLogo ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Uploading Logo...</span></>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
