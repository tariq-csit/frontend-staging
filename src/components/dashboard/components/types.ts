import { Pentest } from "@/types/types";

export interface VulnerabilityCounts {
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
}

export interface PentesterMetrics {
  scheduled_pentests_count: number;
  total_assigned_pentests: number;
  average_cvss_score: string;
  Ongoing_pentests: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    total_vulnerabilities: number;
    vulnerability_counts: VulnerabilityCounts;
  }[];
  total_vulnerabilities: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
    Total: number;
  };
  Critical_vulnerabilities_count: number;
  pentester_rank: number;
}

export interface AdminMetrics {
  TotalClients: number;
  Ongoing: number;
  Scheduled: number;
  VulnerabilitiesByMonth: Array<{ month: number; count: number }>;
} 

export interface ClientMetrics {
  ongoingPentests: number;
  scheduledPentests: number;
  vulnerabilityCount: number;
  vulnerabilitiesByMonth: Array<{
    month: number;
    year: number;
    count: number;
  }>;
  pentests: Array<{
    _id: string;
    title: string;
    service: string;
    startDate: string;
    vulnerabilityCount: number;
    status: string;
    pentesters: any[];
  }>;
  overview: {
    pentests: {
      ongoing: number;
      scheduled: number;
      completed: number;
      total: number;
    };
    vulnerabilities: {
      total: number;
      bySeverity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
      byStatus: {
        new: number;
        triaged: number;
        readyForRetest: number;
        resolved: number;
        notApplicable: number;
      };
    };
    riskScore: number;
    completionRate: number;
  };
  severityDistribution: {
    critical: { count: number; percentage: number };
    high: { count: number; percentage: number };
    medium: { count: number; percentage: number };
    low: { count: number; percentage: number };
  };
  statusDistribution: {
    new: { count: number; percentage: number };
    triaged: { count: number; percentage: number };
    readyForRetest: { count: number; percentage: number };
    resolved: { count: number; percentage: number };
    notApplicable: { count: number; percentage: number };
  };
  resolutionMetrics: {
    averageResolutionTime: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      overall: number;
    };
    averageTimeInStatus: {
      new: number;
      triaged: number;
      readyForRetest: number;
      resolved: number;
      notApplicable: number;
    };
    resolutionRate: number;
  };
  trends: {
    resolutionVelocity: {
      last7Days: number;
      last30Days: number;
      trend: string;
    };
    vulnerabilitiesByMonth: Array<{
      month: number;
      year: number;
      total: number;
      bySeverity: Array<{
        critical: number;
        high: number;
        medium: number;
        low: number;
      }>;
    }>;
  };
  serviceTypeAnalytics: {
    webapppentest?: {
      count: number;
      severities: {
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
      averageCvss: number;
      averageSeverity: string;
      criticalCount: number;
    };
    networkpentest?: {
      count: number;
      severities: {
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
      averageCvss: number;
      averageSeverity: string;
      criticalCount: number;
    };
    cloudpentest?: {
      count: number;
      severities: {
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
      averageCvss: number;
      averageSeverity: string;
      criticalCount: number;
    };
    mobileapppentest?: {
      count: number;
      severities: {
        critical: number;
        high: number;
        medium: number;
        low: number;
      };
      averageCvss: number;
      averageSeverity: string;
      criticalCount: number;
    };
  };
  insights: Array<{
    type: string;
    priority: string;
    message: string;
    action: string;
    count: number;
    vulnerabilities?: Array<{
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
    }>;
    pentests?: Array<{
      _id: string;
      title: string;
      endDate: string;
      daysUntilDeadline: number;
      status: string;
    }>;
  }>;
}
