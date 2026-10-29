import React, { useEffect, useState } from 'react';
import { ShieldCheck, Cpu, Smartphone, FileSearch, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuditProgressScannerProps {
  url: string;
  onComplete: () => void;
}

const AUDIT_STEPS = [
  { label: 'Resolving DNS & SSL/TLS certificate integrity', icon: ShieldCheck },
  { label: 'Crawling DOM structure, Title, Meta & Canonical tags', icon: FileSearch },
  { label: 'Simulating mobile viewport & touch interactions', icon: Smartphone },
  { label: 'Estimating Core Web Vitals (LCP, CLS, Caching)', icon: Cpu },
  { label: 'Compiling checklist matrix & impact recommendations', icon: Sparkles },
];

export const AuditProgressScanner: React.FC<AuditProgressScannerProps> = ({
  url,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < AUDIT_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercent = Math.round(((currentStepIndex + 1) / AUDIT_STEPS.length) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs my-6">
      <div className="max-w-xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-700 mb-3">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
          <span>Active Crawl In Progress</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          Analyzing {url}
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Simulating Googlebot Smartphone crawler
        </p>

        {/* Progress bar */}
        <div className="mt-6 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-slate-900 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step list */}
        <div className="mt-6 space-y-2.5 text-left border border-slate-100 rounded-lg p-4 bg-slate-50/50">
          {AUDIT_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 text-xs transition-opacity ${
                  isDone
                    ? 'text-slate-800'
                    : isCurrent
                    ? 'text-indigo-900 font-medium'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isCurrent ? 'text-indigo-600 animate-pulse' : 'text-slate-400'
                    }`}
                  />
                )}
                <span className="truncate">{step.label}</span>
                {isCurrent && (
                  <span className="ml-auto font-mono text-[10px] text-indigo-600 shrink-0">
                    Running...
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
