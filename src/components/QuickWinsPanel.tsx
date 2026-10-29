import React from 'react';
import { ChecklistItem } from '../types/seo';
import { Flame, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface QuickWinsPanelProps {
  items: ChecklistItem[];
  resolvedIds: Set<string>;
  onSelectFix: (id: string) => void;
}

export const QuickWinsPanel: React.FC<QuickWinsPanelProps> = ({
  items,
  resolvedIds,
  onSelectFix,
}) => {
  // Filter for High impact items that are warning or fail, not yet resolved
  const urgentFixes = items.filter(
    (item) => item.impact === 'high' && item.status !== 'pass' && !resolvedIds.has(item.id)
  );

  const potentialBoost = urgentFixes.reduce((acc, curr) => {
    return acc + (curr.status === 'fail' ? curr.scoreImpact : Math.round(curr.scoreImpact * 0.45));
  }, 0);

  if (urgentFixes.length === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-emerald-950">
          No Critical High-Impact Bottlenecks!
        </h4>
        <p className="text-xs text-emerald-800 mt-1 max-w-md mx-auto">
          All high-priority SEO parameters have passed or been marked as resolved. Review medium and low impact warning items to fine-tune your performance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50/50 via-white to-rose-50/30 border border-amber-200/90 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              High-Impact Quick Wins
            </h3>
            <p className="text-xs text-slate-500">
              Fix these {urgentFixes.length} priority items first to unlock maximum search visibility
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-2xs self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Estimated Score Gain:</span>
          <span className="text-sm font-bold font-mono text-emerald-600 tabular-nums">
            +{potentialBoost} pts
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {urgentFixes.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectFix(item.id)}
            className="p-3.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-semibold uppercase text-slate-500 tracking-wide">
                  {item.category}
                </span>
                <span
                  className={`flex items-center gap-1 font-semibold uppercase text-[10px] ${
                    item.status === 'fail' ? 'text-rose-600' : 'text-amber-600'
                  }`}
                >
                  {item.status === 'fail' ? (
                    <XCircle className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {item.status}
                </span>
              </div>
              <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                {item.title}
              </h5>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {item.recommendation}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-mono text-emerald-600 font-semibold">
                +{item.scoreImpact} pts
              </span>
              <span className="text-indigo-600 font-medium flex items-center gap-0.5 group">
                <span>View fix</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
