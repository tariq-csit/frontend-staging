"use client"

import { useMutation } from "@tanstack/react-query"
import axiosInstance from "@/lib/AxiosInstance"
import { apiRoutes } from "@/lib/routes"
import type { Client } from "@/types/types"
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
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ClientDeleteDialogProps {
  client: Client
  refetch: () => void
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

export default function ClientDeleteDialog({ client, refetch, open, onOpenChange }: ClientDeleteDialogProps) {
  const { mutate: deleteClient, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.delete(apiRoutes.clients.detail(client._id))
      // delay for 250ms after successful action
      await new Promise(resolve => setTimeout(resolve, 250))
      return res.data
    },
    onSuccess: () => {
      toast({
        title: "Client deleted successfully",
        description: "The client has been deleted successfully",
      })
      refetch() 
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Client</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {client.name}? This action cannot be undone. Deleting a client will also delete all the users and pentests associated with them.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteClient()}
            disabled={isPending}
            variant="destructive"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
