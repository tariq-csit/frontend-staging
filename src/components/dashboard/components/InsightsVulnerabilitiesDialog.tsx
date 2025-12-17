import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ExternalLink, MessageSquare } from "lucide-react";
import VulnerabilitySeverityBadge from "@/components/vulenerabilityReports/subcomponents/VulnerabilitySeverityBadge";
import VulnerabilityStatusBadge from "@/components/vulenerabilityReports/subcomponents/VulnerabilityStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Vulnerability {
  _id: string;
  title: string;
  severity: string;
  status: string;
  cvss: number | null;
  createdAt: string;
  pentest: {
    _id: string;
    title: string;
    service: string;
    status: string;
  };
  reporter?: {
    _id: string;
    name: string;
    profilePicture?: string;
  } | null;
  lastComment?: {
    _id: string;
    comment: string;
    createdAt: string;
    author: {
      _id: string;
      name: string;
      role: string;
      profilePicture?: string;
    };
    daysSinceComment: number;
  };
}

interface InsightsVulnerabilitiesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  vulnerabilities: Vulnerability[];
  insightType: string;
}

const InsightsVulnerabilitiesDialog: React.FC<InsightsVulnerabilitiesDialogProps> = ({
  open,
  onOpenChange,
  title,
  vulnerabilities,
  insightType,
}) => {
  const handleViewVulnerability = (pentestId: string, vulnerabilityId: string) => {
    const url = `/vulnerability-reports/${pentestId}/vulnerabilities/${vulnerabilityId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            {vulnerabilities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No vulnerabilities found
              </div>
            ) : (
              vulnerabilities.map((vuln) => (
                <div
                  key={vuln._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {vuln.title}
                        </h3>
                        <VulnerabilitySeverityBadge severity={vuln.severity} />
                        <VulnerabilityStatusBadge status={vuln.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Pentest:</span>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {vuln.pentest.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {vuln.pentest.service}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">CVSS Score:</span>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {vuln.cvss !== null && vuln.cvss !== undefined ? vuln.cvss.toFixed(1) : "N/A"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Reported {vuln.createdAt ? format(new Date(vuln.createdAt), "MMM d, yyyy") : "Unknown date"}
                          </p>
                        </div>
                      </div>

                      {insightType === "unresponded_comments" && vuln.lastComment && (
                        <>
                          <Separator className="my-3" />
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-start gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={vuln.lastComment.author.profilePicture} />
                                    <AvatarFallback className="text-xs">
                                      {vuln.lastComment.author.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {vuln.lastComment.author.name || "Unknown"}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {vuln.lastComment.author.role}
                                  </Badge>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                    {vuln.lastComment.daysSinceComment === 0
                                      ? "Today"
                                      : `${vuln.lastComment.daysSinceComment} day${vuln.lastComment.daysSinceComment > 1 ? "s" : ""} ago`}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                  {vuln.lastComment.comment}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {vuln.lastComment.createdAt ? format(new Date(vuln.lastComment.createdAt), "MMM d, yyyy 'at' h:mm a") : "Unknown date"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewVulnerability(vuln.pentest._id, vuln._id)}
                      className="flex-shrink-0"
                    >
                      View Details
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default InsightsVulnerabilitiesDialog;

