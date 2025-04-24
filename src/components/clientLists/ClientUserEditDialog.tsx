"use client"

import fileIcon from "/file.svg"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form"
import { apiRoutes } from "@/lib/routes"
import axiosInstance from "@/lib/AxiosInstance"
import { useMutation, useQuery } from "@tanstack/react-query"
import type { ClientUser } from "@/types/types"
import type { Dispatch, SetStateAction } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { FileUpload } from "@/components/FileUpload"

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  client: z.string().min(1),
  profilePicture: z.string().optional(),
})

interface ClientUserEditDialogProps {
  user: ClientUser
  refetch: () => void
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

interface UploadResponse {
  url: string;
}

export default function ClientUserEditDialog({ user, refetch, open, onOpenChange }: ClientUserEditDialogProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      client: user.clients[0]._id,
      profilePicture: user.profilePicture || "",
    },
  })

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => axiosInstance.get(apiRoutes.clients.all).then((res) => res.data),
  })

  const { mutate: uploadProfilePicture } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("profilePicture", file)
      const response = await axiosInstance.post(apiRoutes.uploadProfilePicture, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      form.setValue("profilePicture", data.url)
    },
    onError: (error) => {
      console.error("Error uploading profile picture:", error)
    },
  })

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await axiosInstance.put(apiRoutes.clientUsers.detail(user._id), {
        name: values.name,
        email: values.email,
        profilePicture: values.profilePicture,
        clientId: values.client,
      })
      return res.data
    },
    onSuccess: () => {
      toast({
        title: "Client user updated successfully",
        description: "The client user has been updated successfully",
      })
      refetch()
      onOpenChange(false)
      form.reset()
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      updateUser(values)
    } catch (error) {
      console.error("Error during client user update:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Client User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="profilePicture"
              render={({ field }) => (
                <FormItem className="flex w-full sm:col-span-3 flex-col items-start gap-2">
                  <FormLabel>Profile Picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={uploadedFile ? [uploadedFile] : []}
                      onChange={async (files) => {
                        if (files.length > 0) {
                          setUploadedFile(files[0]);
                          await uploadProfilePicture(files[0]);
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex justify-start items-start flex-col gap-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="Enter name" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="Enter email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Client</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client: any) => (
                          <SelectItem key={client._id} value={client._id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          >
            Cancel
          </Button>
          <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 