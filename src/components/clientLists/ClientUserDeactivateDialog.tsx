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

interface ClientUserDeactivateDialogProps {
  user: ClientUser
  refetch: () => void
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  isClientView?: boolean
}

export default function ClientUserDeactivateDialog({ user, refetch, open, onOpenChange, isClientView = false }: ClientUserDeactivateDialogProps) {
  const { isClient } = useUser();

  const { mutate: deactivateUser, isPending } = useMutation({
    mutationFn: async () => {
      // Use the client-specific endpoint if the user is a client
      const endpoint = isClient() 
        ? apiRoutes.client.team.deactivate(user._id)
        : apiRoutes.clientUsers.deactivate(user._id);
      
      await axiosInstance.patch(endpoint, {
        isActive: !user.isActive
      })
    },
    onSuccess: () => {
      refetch()
      toast({
        title: user.isActive 
          ? (isClientView ? "Team Member Deactivated" : "User Deactivated")
          : (isClientView ? "Team Member Activated" : "User Activated"),
        description: `${user.name} has been ${user.isActive ? "deactivated" : "activated"} successfully.`,
      })
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${user.isActive ? "deactivate" : "activate"} ${isClientView ? "team member" : "user"}. Please try again.`,
        variant: "destructive",
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {user.isActive 
              ? (isClientView ? "Deactivate Team Member" : "Deactivate User")
              : (isClientView ? "Activate Team Member" : "Activate User")
            }
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to {user.isActive ? "deactivate" : "activate"} {isClientView ? "team member" : "user"} {user.name}? 
            {user.isActive ? " They will no longer be able to access the system." : " They will regain access to the system."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => deactivateUser()}
            variant={user.isActive ? "destructive" : "default"}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {user.isActive ? "Deactivating..." : "Activating..."}
              </>
            ) : (
              user.isActive 
                ? (isClientView ? "Deactivate Team Member" : "Deactivate User") 
                : (isClientView ? "Activate Team Member" : "Activate User")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 