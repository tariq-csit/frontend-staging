import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/AxiosInstance";
import { apiRoutes } from "@/lib/routes";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    email: z.string().email(),
})

export default function SendCode() {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    const { mutate: sendSignupCode, isPending: isSendingSignupCode } = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const response = await axiosInstance.post(apiRoutes.clients.sendSignupCode, {
                email: values.email
            });
            return response.data;
        },
        onSuccess: () => {
            form.reset();
            setOpen(false);
            toast({
                title: "Signup code sent",
                description: "The signup code has been sent to the email address"
            })
        },
        onError: () => {
            toast({
                title: "Error sending signup code",
                description: "The signup code could not be sent to the email address",
                variant: "destructive"
            })
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        sendSignupCode(values);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Send Signup Code</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl font-bold">Send Signup Code</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
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
                    </form>
                </Form>

                <DialogFooter className="px-6 py-4 border-t flex justify-end space-x-2">
                    <DialogClose asChild>
                        <Button variant="outline" onClick={() => form.reset()}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" onClick={form.handleSubmit(onSubmit)} disabled={isSendingSignupCode}>
                        {isSendingSignupCode ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Sending...</span></>) : "Send Signup Code"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}