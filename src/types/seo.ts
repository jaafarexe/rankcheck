export type AuditStatus = 'pass' | 'warning' | 'fail';

export type AuditCategory = 'on-page' | 'technical' | 'content' | 'mobile' | 'performance';

export type AuditImpact = 'high' | 'medium' | 'low';

export interface ChecklistItem {
  id: string;
  category: AuditCategory;
  title: string;
  status: AuditStatus;
  impact: AuditImpact;
  scoreImpact: number;
  detected: string;
  recommendation: string;
  explanation: string;
  fixCodeSnippet?: string;
  learnMoreUrl?: string;
  resolved?: boolean;
}

export interface CategoryScore {
  id: AuditCategory;
  name: string;
  score: number;
  grade: string;
  passedCount: number;
  warningCount: number;
  failCount: number;
  description: string;
}

export interface PageStats {
  loadTimeMs: number;
  pageSizeKb: number;
  totalRequests: number;
  protocol: string;
  hostname: string;
  path: string;
  wordCount: number;
  detectedCms: string;
}

export interface AuditReport {
  url: string;
  auditedAt: string;
  overallScore: number;
  grade: string;
  statusLabel: string;
  summary: string;
  categories: Record<AuditCategory, CategoryScore>;
  items: ChecklistItem[];
  pageStats: PageStats;
}
