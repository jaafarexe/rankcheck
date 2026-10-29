import React from 'react';
import { AuditCategory, CategoryScore } from '../types/seo';
import { LayoutList, Server, FileText, Smartphone, Gauge, Check, AlertTriangle, X } from 'lucide-react';

interface CategoryScoreGridProps {
  categories: Record<AuditCategory, CategoryScore>;
  selectedCategory: AuditCategory | 'all';
  onSelectCategory: (cat: AuditCategory | 'all') => void;
}

const CATEGORY_META: Record<AuditCategory, { icon: React.ElementType; label: string }> = {
  'on-page': { icon: LayoutList, label: 'On-Page SEO' },
  'technical': { icon: Server, label: 'Technical SEO' },
  'content': { icon: FileText, label: 'Content' },
  'mobile': { icon: Smartphone, label: 'Mobile' },
  'performance': { icon: Gauge, label: 'Performance' },
};

export const CategoryScoreGrid: React.FC<CategoryScoreGridProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const catKeys: AuditCategory[] = ['on-page', 'technical', 'content', 'mobile', 'performance'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {catKeys.map((catKey) => {
        const cat = categories[catKey];
        const meta = CATEGORY_META[catKey];
        const Icon = meta.icon;
        const isSelected = selectedCategory === catKey;

        let scoreBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        let barColor = 'bg-emerald-500';
        if (cat.score < 50) {
          scoreBadgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
          barColor = 'bg-rose-500';
        } else if (cat.score < 70) {
          scoreBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
          barColor = 'bg-amber-500';
        } else if (cat.score < 85) {
          scoreBadgeColor = 'text-sky-700 bg-sky-50 border-sky-200';
          barColor = 'bg-sky-500';
        }

        return (
          <button
            key={catKey}
            type="button"
            onClick={() => onSelectCategory(isSelected ? 'all' : catKey)}
            className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative bg-white ${
              isSelected
                ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                  {meta.label}
                </h4>
              </div>
              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border ${scoreBadgeColor}`}>
                {cat.score}
              </span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 my-2.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full ${barColor} transition-all duration-700`}
                style={{ width: `${cat.score}%` }}
              />
            </div>

            {/* Pass / Warn / Fail count strip */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <Check className="w-3 h-3" />
                <span className="font-mono tabular-nums">{cat.passedCount}</span> pass
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <AlertTriangle className="w-3 h-3" />
                <span className="font-mono tabular-nums">{cat.warningCount}</span> warn
              </span>
              <span className="flex items-center gap-1 text-rose-700 font-medium">
                <X className="w-3 h-3" />
                <span className="font-mono tabular-nums">{cat.failCount}</span> fail
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
