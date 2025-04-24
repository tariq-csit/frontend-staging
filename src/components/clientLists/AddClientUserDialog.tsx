import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/routes";
import axiosInstance from "@/lib/AxiosInstance";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Client } from "@/types/types";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  client: z.string().min(1),
})

export default function AddClientUserDialog({refetch}: {refetch: () => void}) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      client: "",
    },
  })

  const {data: clients} = useQuery({
    queryKey: ["clients"],
    queryFn: () => axiosInstance.get(apiRoutes.clients.all).then((res) => res.data),
  })

  const { mutate: onboardClientUser, isPending } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await axiosInstance.post(apiRoutes.clients.onboardUser, {
        name: values.name,
        email: values.email,
        password: "password", // Default password that user can change later
        profilePicture: "", // Can be updated by user later
        clientId: values.client,
      });
      return response.data;
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: "Client user added successfully",
      });
      refetch();
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error onboarding client user:', error);
      toast({
        title: "Error onboarding client user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onboardClientUser(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add Client User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">Add Client User</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-max-full"
                        placeholder="(i.e hxmir)"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="w-max-full"
                        placeholder="(i.e hxmir.@gmail.com)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                      <FormItem className="w-full">
                          <SelectTrigger className="w-full">
                            <SelectValue className="w-full" placeholder="Select a client" />
                          </SelectTrigger>
                        <FormControl>
                          <SelectContent>
                            {clients && clients.map((client: Client) => (
                              <SelectItem key={client._id} value={client._id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </FormControl>
                      </FormItem>
                    </Select>
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
          <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Client User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}