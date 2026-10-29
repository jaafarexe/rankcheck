import React from 'react';
import { AuditCategory, AuditStatus } from '../types/seo';
import { Search, SlidersHorizontal, CheckCircle2, AlertTriangle, XCircle, Flame } from 'lucide-react';

interface ChecklistFilterBarProps {
  statusFilter: AuditStatus | 'all';
  onStatusFilterChange: (status: AuditStatus | 'all') => void;
  categoryFilter: AuditCategory | 'all';
  onCategoryFilterChange: (category: AuditCategory | 'all') => void;
  highImpactOnly: boolean;
  onHighImpactToggle: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  counts: {
    total: number;
    pass: number;
    warning: number;
    fail: number;
    highImpact: number;
  };
}

export const ChecklistFilterBar: React.FC<ChecklistFilterBarProps> = ({
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  highImpactOnly,
  onHighImpactToggle,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Top row: Status Tabs & Quick Wins Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('fail')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'fail'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-rose-600 hover:text-rose-700'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Fails ({counts.fail})</span>
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('warning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'warning'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-amber-600 hover:text-amber-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Warnings ({counts.warning})</span>
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('pass')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'pass'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-emerald-600 hover:text-emerald-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Passes ({counts.pass})</span>
          </button>
        </div>

        {/* Quick wins toggle & search */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onHighImpactToggle}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
              highImpactOnly
                ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/10'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${highImpactOnly ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>High Impact Only ({counts.highImpact})</span>
          </button>

          <div className="relative min-w-[200px] flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search checklist..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Category selector row */}
      <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
        <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3" />
          Category:
        </span>
        {(['all', 'on-page', 'technical', 'content', 'mobile', 'performance'] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryFilterChange(cat)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            {cat === 'all'
              ? 'All Categories'
              : cat === 'on-page'
              ? 'On-Page SEO'
              : cat === 'technical'
              ? 'Technical SEO'
              : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};
