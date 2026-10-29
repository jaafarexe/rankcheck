import React from 'react';
import { AuditReport } from '../types/seo';
import { ScoreGauge } from './ScoreGauge';
import { Clock, HardDrive, Network, FileCode, CheckCircle2, AlertTriangle, XCircle, Globe, Shield } from 'lucide-react';

interface AuditSummaryCardProps {
  report: AuditReport;
  onFilterStatus: (status: 'fail' | 'warning' | 'pass') => void;
}

export const AuditSummaryCard: React.FC<AuditSummaryCardProps> = ({
  report,
  onFilterStatus,
}) => {
  const failCount = report.items.filter((i) => i.status === 'fail').length;
  const warnCount = report.items.filter((i) => i.status === 'warning').length;
  const passCount = report.items.filter((i) => i.status === 'pass').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Col: Radial Gauge & Health Badge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-8">
          <ScoreGauge
            score={report.overallScore}
            grade={report.grade}
            statusLabel={report.statusLabel}
            size={190}
          />

          {/* Quick clickable breakdown pills */}
          <div className="flex items-center gap-2 mt-5 w-full justify-center">
            <button
              type="button"
              onClick={() => onFilterStatus('fail')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>{failCount} Errors</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterStatus('warning')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{warnCount} Warnings</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterStatus('pass')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{passCount} Passed</span>
            </button>
          </div>
        </div>

        {/* Right Col: Executive Summary & Technical Metadata Grid */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
              <span className="font-semibold text-slate-700">AUDIT TARGET</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-900">{report.pageStats.hostname}</span>
              <span aria-hidden="true">·</span>
              <span>Crawled {report.auditedAt}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Executive SEO & Performance Health
            </h2>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Technical Metadata KPI strip */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Est. Page Speed</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                {(report.pageStats.loadTimeMs / 1000).toFixed(1)}s
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Payload Size</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                {report.pageStats.pageSizeKb} KB
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Protocol</span>
              </div>
              <span className="text-sm font-bold font-mono text-slate-900">
                {report.pageStats.protocol}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                <span>Detected Platform</span>
              </div>
              <span className="text-sm font-bold text-slate-900 truncate">
                {report.pageStats.detectedCms}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
