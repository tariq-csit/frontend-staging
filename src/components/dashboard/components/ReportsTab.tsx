import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRoutes } from "@/lib/routes";
import axiosInstance from "@/lib/AxiosInstance";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { 
  FileText, 
  Search, 
  Filter,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import ReportCard from "./ReportCard";
import PasswordRequestDialog from "./PasswordRequestDialog";

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

type FilterType = 'all' | 'pentest' | 'retest';
type SortType = 'date' | 'name' | 'size';

const ReportsTab: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("date");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Fetch reports
  const { 
    data: reports, 
    isLoading, 
    error,
    refetch 
  } = useQuery<Report[]>({
    queryKey: ["client-reports"],
    queryFn: async () => {
      const response = await axiosInstance.get(apiRoutes.client.reports);
      return response.data;
    },
  });

  // Extract unique years from reports
  const availableYears = useMemo(() => {
    if (!reports) return [];
    const years = new Set(
      reports.map((report) => new Date(report.publishedAt).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [reports]);

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    if (!reports) return [];

    let filtered = reports;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((report) => report.reportType === filterType);
    }

    // Filter by year
    if (filterYear !== "all") {
      const year = parseInt(filterYear);
      filtered = filtered.filter(
        (report) => new Date(report.publishedAt).getFullYear() === year
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((report) =>
        report.pentest.title.toLowerCase().includes(query) ||
        report.name.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortType) {
        case "date":
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case "name":
          return a.pentest.title.localeCompare(b.pentest.title);
        case "size":
          const sizeA = a.size || 0;
          const sizeB = b.size || 0;
          return sizeB - sizeA;
        default:
          return 0;
      }
    });

    return sorted;
  }, [reports, filterType, filterYear, searchQuery, sortType]);

  const handleRequestPassword = (report: Report) => {
    setSelectedReport(report);
    setPasswordDialogOpen(true);
  };

  const handlePasswordRequestSuccess = () => {
    setPasswordDialogOpen(false);
    setSelectedReport(null);
    toast({
      title: "Password Sent",
      description: "Report password has been sent to your email",
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full dark:bg-gray-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardContent className="p-6">
          <Empty>
            <EmptyMedia variant="icon">
              <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Error Loading Reports</EmptyTitle>
              <EmptyDescription>
                Failed to load reports. Please try again.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => refetch()} variant="outline" className="mt-4">
              Retry
            </Button>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardContent className="p-6">
          <Empty>
            <EmptyMedia variant="icon">
              <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No Reports Available</EmptyTitle>
              <EmptyDescription>
                No reports have been published yet. Check back later.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Filters and Search */}
      <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search - Full Width */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by pentest name or report name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter by Type */}
              <Select value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="pentest">Pentest Reports</SelectItem>
                  <SelectItem value="retest">Retest Reports</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter by Year */}
              {availableYears.length > 0 && (
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Sort */}
              <Select value={sortType} onValueChange={(value) => setSortType(value as SortType)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest First</SelectItem>
                  <SelectItem value="name">Pentest Name (A-Z)</SelectItem>
                  <SelectItem value="size">File Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredAndSortedReports.length} of {reports.length} reports
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {filteredAndSortedReports.length === 0 ? (
        <Card className="dark:bg-gray-900/50 dark:border-gray-800 border border-gray-200">
          <CardContent className="p-6">
            <Empty>
              <EmptyMedia variant="icon">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No Reports Match Your Filters</EmptyTitle>
                <EmptyDescription>
                  Try adjusting your search or filter criteria.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedReports.map((report) => (
            <ReportCard
              key={report._id}
              report={report}
              onRequestPassword={handleRequestPassword}
            />
          ))}
        </div>
      )}

      {/* Password Request Dialog */}
      {selectedReport && (
        <PasswordRequestDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          report={selectedReport}
          onSuccess={handlePasswordRequestSuccess}
        />
      )}
    </div>
  );
};

export default ReportsTab;

