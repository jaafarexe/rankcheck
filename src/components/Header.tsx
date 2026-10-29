import React from 'react';
import { Search, Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onNewAuditClick: () => void;
  onExportClick: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  hasReport: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewAuditClick,
  onExportClick,
  activeSection,
  onNavigate,
  hasReport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
            RC
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('overview');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap hover:text-slate-700 transition-colors"
          >
            RankCheck <span className="text-slate-400 font-normal text-sm ml-1">SEO Audit</span>
          </a>
        </div>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 cursor-pointer ${
              activeSection === 'overview'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Audit Overview
          </button>
          <button
            type="button"
            onClick={() => onNavigate('checklist')}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 cursor-pointer ${
              activeSection === 'checklist'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Full Checklist
          </button>
          <button
            type="button"
            onClick={() => onNavigate('categories')}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 cursor-pointer ${
              activeSection === 'categories'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Category Scores
          </button>
          <button
            type="button"
            onClick={() => onNavigate('quick-wins')}
            className={`transition-colors whitespace-nowrap pb-0.5 border-b-2 cursor-pointer ${
              activeSection === 'quick-wins'
                ? 'text-slate-900 border-slate-900 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Quick Wins
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          {hasReport && (
            <button
              type="button"
              onClick={onExportClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Report</span>
            </button>
          )}
          <button
            type="button"
            onClick={onNewAuditClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Audit Another URL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
