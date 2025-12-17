import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Download, Lock, FileText, Calendar, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PentestStatusBadge from "@/components/pentests/PentestStatusBadge";

interface Report {
  _id: string;
  pentestId: string;
  pentest: {
    _id: string;
    title: string;
    service: string;
    status: string;
  };
  reportType: 'pentest' | 'retest';
  name: string;
  size: number | null;
  contentType: string | null;
  publishedAt: string;
  publishedBy: {
    _id: string;
    name: string;
  } | null;
  hasPassword: boolean;
  downloadUrl: string;
  publishComments: string | null;
}

interface ReportCardProps {
  report: Report;
  onRequestPassword: (report: Report) => void;
}

const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} Bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ReportCard: React.FC<ReportCardProps> = ({ report, onRequestPassword }) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Check if URL is still valid (presigned URLs expire after 1 hour)
      // For now, we'll just open it. If expired, backend should handle it.
      window.open(report.downloadUrl, '_blank', 'noopener,noreferrer');
      
      // Small delay to show loading state
      setTimeout(() => {
        setIsDownloading(false);
      }, 500);
    } catch (error: any) {
      setIsDownloading(false);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download report. The link may have expired. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const getReportTypeColor = () => {
    return report.reportType === 'pentest' 
      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
      : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
  };

  return (
    <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Section: Report Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {report.pentest.title}
                  </h3>
                  <Badge variant="outline" className={getReportTypeColor()}>
                    {report.reportType === 'pentest' ? 'Pentest Report' : 'Retest Report'}
                  </Badge>
                  <PentestStatusBadge status={report.pentest.status} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {report.pentest.service}
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {report.name}
                </p>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">Published</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {format(new Date(report.publishedAt), "MMM d, yyyy")}
                </p>
              </div>

              {report.publishedBy && (
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-xs">Published By</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {report.publishedBy.name}
                  </p>
                </div>
              )}

              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1 text-xs">File Size</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatFileSize(report.size)}
                </p>
              </div>

              {report.hasPassword && (
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-xs">Password</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                </div>
              )}
            </div>

            {/* Publish Comments */}
            {report.publishComments && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 cursor-help">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-2">
                          {report.publishComments}
                        </p>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p>{report.publishComments}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Right Section: Actions */}
          <div className="flex flex-col gap-2 lg:min-w-[200px]">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full"
              variant="default"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>

            {report.hasPassword && (
              <Button
                onClick={() => onRequestPassword(report)}
                variant="outline"
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                Request Password
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCard;

