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
