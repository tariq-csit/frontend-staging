import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/routes";
import axiosInstance from "@/lib/AxiosInstance";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";

interface Report {
  _id: string;
  pentestId: string;
  reportType: 'pentest' | 'retest';
  pentest: {
    title: string;
  };
}

interface PasswordRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
  onSuccess: () => void;
}

const PasswordRequestDialog: React.FC<PasswordRequestDialogProps> = ({
  open,
  onOpenChange,
  report,
  onSuccess,
}) => {
  const { toast } = useToast();

  const { mutate: requestPassword, isPending } = useMutation({
    mutationFn: async () => {
      const endpoint = report.reportType === 'pentest'
        ? apiRoutes.client.pentests.reports.requestReportPassword(report.pentestId)
        : apiRoutes.client.pentests.reports.requestRetestPassword(report.pentestId);
      
      return axiosInstance.post(endpoint);
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.response?.data?.message || "Failed to request password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConfirm = () => {
    requestPassword();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-500" />
            Request Report Password
          </DialogTitle>
          <DialogDescription className="pt-2">
            The password for the report will be sent to your registered email address.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {report.pentest.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {report.reportType === 'pentest' ? 'Pentest' : 'Retest'} Report
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Password
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordRequestDialog;

