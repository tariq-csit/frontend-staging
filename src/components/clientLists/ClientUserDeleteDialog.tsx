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

interface ClientUserDeleteDialogProps {
  user: ClientUser
  refetch: () => void
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  isClientView?: boolean
}

export default function ClientUserDeleteDialog({ user, refetch, open, onOpenChange, isClientView = false }: ClientUserDeleteDialogProps) {
  const { isClient } = useUser();

  const { mutate: deleteUser, isPending } = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      // Use the client-specific endpoint if the user is a client
      const endpoint = isClient() 
        ? apiRoutes.client.team.details(user._id)
        : apiRoutes.clientUsers.detail(user._id);
      await axiosInstance.delete(endpoint)
    },
    onSuccess: () => {
      refetch()
      toast({
        title: isClientView ? "Team member deleted successfully" : "Client user deleted successfully",
        description: isClientView ? "The team member has been deleted successfully" : "The client user has been deleted successfully",
      })
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isClientView ? "Delete Team Member" : "Delete Client User"}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {user.name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteUser()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 