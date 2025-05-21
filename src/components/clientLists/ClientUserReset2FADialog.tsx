"use client"

import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import type { ClientUser } from "@/types/types"
import { toast } from "@/hooks/use-toast"
import type { Dispatch, SetStateAction } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/useUser"

interface ClientUserReset2FADialogProps {
  user: ClientUser
  refetch: () => void
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  isClientView?: boolean
}

export default function ClientUserReset2FADialog({ user, refetch, open, onOpenChange, isClientView = false }: ClientUserReset2FADialogProps) {
  const { isClient } = useUser();

  const { mutate: reset2FA, isPending } = useMutation({
    mutationFn: async () => {
      // Use the client-specific endpoint if the user is a client
      const endpoint = isClient() 
        ? apiRoutes.client.team.reset2FA(user._id)
        : apiRoutes.clientUsers.reset2FA(user._id);
      await axiosInstance.post(endpoint)
    },
    onSuccess: () => {
      refetch()
      toast({
        title: "2FA Reset Successful",
        description: "The user will need to set up 2FA again on their next login.",
      })
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset 2FA. Please try again.",
        variant: "destructive",
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset 2FA for {isClientView ? "team member" : "user"} {user.name}? They will need to set it up again on their next login.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => reset2FA()}
            variant="destructive"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset 2FA"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 