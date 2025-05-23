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
import { useUser } from "@/hooks/useUser";

// Different schemas for client and admin users
const clientFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const adminFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  client: z.string().min(1),
});

export default function AddClientUserDialog({refetch, isClientView = false}: {refetch: () => void, isClientView?: boolean}) {
  const [open, setOpen] = useState(false);
  const { isClient, loading } = useUser();
  
  // Use the appropriate schema based on user role
  const formSchema = isClient() ? clientFormSchema : adminFormSchema;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isClient() 
      ? {
          name: "",
          email: "",
        }
      : {
          name: "",
          email: "",
          client: "",
        },
  });

  // Only fetch clients for admin users
  const {data: clients} = useQuery({
    queryKey: ["clients"],
    queryFn: () => axiosInstance.get(apiRoutes.clients.all).then((res) => res.data),
    enabled: !isClient() && !loading, // Only fetch if user is not a client
  });

  const { mutate: onboardClientUser, isPending } = useMutation({
    mutationFn: async (values: any) => {
      // Use the client-specific endpoint if the user is a client
      const endpoint = isClient() ? apiRoutes.client.team.add : apiRoutes.clients.onboardUser;
      
      // Only send client ID for admin users
      const payload = isClient()
        ? {
            name: values.name,
            email: values.email,
          }
        : {
            name: values.name,
            email: values.email,
            clientId: values.client,
            password: "", 
            profilePicture: "",
          };
          
      const response = await axiosInstance.post(endpoint, payload);
      return response.data;
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: isClientView ? "Team member added successfully" : "Client user added successfully",
      });
      refetch();
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error onboarding client user:', error);
      toast({
        title: isClientView ? "Error adding team member" : "Error onboarding client user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  function onSubmit(values: any) {
    onboardClientUser(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          {isClientView ? "Add Team Member" : "Add Client User"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-bold">
            {isClientView ? "Add Team Member" : "Add Client User"}
          </DialogTitle>
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
            
            {/* Only show client field for admin users */}
            {!isClient() && (
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{isClientView ? "Organization" : "Client"}</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormItem className="w-full">
                            <SelectTrigger className="w-full">
                              <SelectValue className="w-full" placeholder={isClientView ? "Select an organization" : "Select a client"} />
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
            )}
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
              isClientView ? "Add Team Member" : "Add Client User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}