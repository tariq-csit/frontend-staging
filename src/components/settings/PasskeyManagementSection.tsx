import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import {
  getUserPasskeys,
  deletePasskey,
  PasskeyInfo,
  isWebAuthnSupported,
} from "@/lib/authService";
import { PasskeyRegistrationDialog } from "@/components/login/PasskeyRegistrationDialog";
import { Shield, Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function PasskeyManagementSection() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPasskey, setSelectedPasskey] = useState<PasskeyInfo | null>(null);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: passkeys = [], isLoading, error } = useQuery<PasskeyInfo[]>({
    queryKey: ["passkeys"],
    queryFn: getUserPasskeys,
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (credentialId: string) => {
      await deletePasskey(credentialId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
      toast({
        title: "Passkey Deleted",
        description: "The passkey has been deleted successfully.",
      });
      setDeleteDialogOpen(false);
      setSelectedPasskey(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete passkey",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (passkey: PasskeyInfo) => {
    setSelectedPasskey(passkey);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedPasskey) {
      deleteMutation.mutate(selectedPasskey.credentialId);
    }
  };

  if (!isWebAuthnSupported()) {
    return (
      <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-700">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Passkeys are not supported in your browser. Please use a modern browser with WebAuthn support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm dark:bg-gray-900 dark:border-gray-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-end mb-6">
          <Button
            onClick={() => setRegisterDialogOpen(true)}
            className="bg-indigo-700 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Passkey
          </Button>
        </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">
                Failed to load passkeys. Please try again.
              </p>
            </div>
          ) : passkeys.length === 0 ? (
            <div className="py-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                No passkeys registered yet
              </p>
              <Button
                onClick={() => setRegisterDialogOpen(true)}
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Passkey
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {passkeys.map((passkey) => (
                <div
                  key={passkey.credentialId}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {passkey.deviceName}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Created: {format(new Date(passkey.createdAt), "MMM d, yyyy")}
                        </p>
                        {passkey.lastUsedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last used: {format(new Date(passkey.lastUsedAt), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(passkey)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="dark:bg-gray-900 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-gray-100">Delete Passkey</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              Are you sure you want to delete the passkey for "{selectedPasskey?.deviceName}"? 
              This action cannot be undone. You will need to register this passkey again to use it for login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Registration Dialog */}
      <PasskeyRegistrationDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
      />
    </>
  );
}

