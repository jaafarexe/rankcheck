import React, { useState } from 'react';
import { ChecklistItem } from '../types/seo';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Code2,
} from 'lucide-react';

interface ChecklistRowProps {
  item: ChecklistItem;
  isResolved?: boolean;
  onToggleResolve: (id: string) => void;
}

export const ChecklistRow: React.FC<ChecklistRowProps> = ({
  item,
  isResolved = false,
  onToggleResolve,
}) => {
  const [isExpanded, setIsExpanded] = useState(item.status === 'fail');
  const [copied, setCopied] = useState(false);

  const handleCopySnippet = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.fixCodeSnippet) return;
    navigator.clipboard.writeText(item.fixCodeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusIcons = {
    pass: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    fail: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
  };

  const statusBadge = {
    pass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    fail: 'text-rose-700 bg-rose-50 border-rose-200',
  }[item.status];

  const impactColor = {
    high: 'text-rose-600 font-semibold',
    medium: 'text-amber-600 font-medium',
    low: 'text-slate-500 font-normal',
  }[item.impact];

  return (
    <div
      className={`border rounded-xl transition-all overflow-hidden ${
        isResolved
          ? 'bg-slate-50/70 border-slate-200 opacity-75'
          : item.status === 'fail'
          ? 'bg-white border-rose-200/80 shadow-xs'
          : item.status === 'warning'
          ? 'bg-white border-amber-200/80 shadow-xs'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Header bar / Main summary row */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          {/* Status icon or resolved checkbox */}
          <div className="pt-0.5 sm:pt-0 shrink-0">
            {isResolved ? (
              <CheckCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
            ) : (
              statusIcons[item.status]
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="capitalize font-medium text-slate-700">
                {item.category.replace('-', ' ')}
              </span>
              <span aria-hidden="true">·</span>
              <span className={impactColor}>
                {item.impact.toUpperCase()} IMPACT
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-500">
                +{item.scoreImpact} pts
              </span>
              {isResolved && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-700 font-semibold">
                    Marked as resolved
                  </span>
                </>
              )}
            </div>

            <h4
              className={`text-sm sm:text-base font-bold text-slate-900 mt-0.5 ${
                isResolved ? 'line-through text-slate-500' : ''
              }`}
            >
              {item.title}
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-1 sm:line-clamp-2">
              {item.detected}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 shrink-0 ml-2">
          {/* Status chip */}
          <span
            className={`text-xs uppercase font-bold px-2 py-0.5 rounded border hidden sm:inline-block ${statusBadge}`}
          >
            {item.status}
          </span>

          {/* Quick Resolve Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleResolve(item.id);
            }}
            title={isResolved ? 'Reopen checklist item' : 'Mark item as resolved'}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors border cursor-pointer ${
              isResolved
                ? 'bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
          </button>

          {/* Expand toggle */}
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label={isExpanded ? 'Collapse item details' : 'Expand item details'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Accordion Details */}
      {isExpanded && (
        <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs sm:text-sm">
          {/* Detailed detected finding */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800 block mb-1">
              Inspection Finding:
            </span>
            <p className="text-slate-700 font-mono text-xs bg-slate-50 p-2 rounded border border-slate-100">
              {item.detected}
            </p>
          </div>

          {/* Why it matters */}
          <div>
            <span className="font-semibold text-slate-800 block mb-1">
              Why this matters for your rankings:
            </span>
            <p className="text-slate-600 leading-relaxed">
              {item.explanation}
            </p>
          </div>

          {/* Actionable recommendation */}
          <div className="bg-amber-50/60 border border-amber-200/70 p-3.5 rounded-lg">
            <span className="font-semibold text-amber-900 block mb-1">
              Clear Recommendation:
            </span>
            <p className="text-amber-800 leading-relaxed">
              {item.recommendation}
            </p>
          </div>

          {/* Code snippet if available */}
          {item.fixCodeSnippet && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-600" />
                  Recommended Fix Implementation:
                </span>
                <button
                  type="button"
                  onClick={handleCopySnippet}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto selection:bg-slate-700">
                <code>{item.fixCodeSnippet}</code>
              </pre>
            </div>
          )}

          {/* External Google Docs Link if provided */}
          {item.learnMoreUrl && (
            <div className="pt-1">
              <a
                href={item.learnMoreUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <span>Read Google Search Central Documentation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
