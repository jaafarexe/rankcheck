import React, { useState } from 'react';
import { Search, Globe, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface UrlAuditFormProps {
  onAudit: (url: string) => void;
  isLoading: boolean;
  currentUrl?: string;
}

const PRESET_URLS = [
  {
    label: 'SaaS Platform',
    url: 'https://growflow-saas.io',
    note: 'Healthy SaaS (Grade A-)',
  },
  {
    label: 'E-Commerce Store',
    url: 'https://thevintagestore.shop/catalog',
    note: 'Missing Alts & Slow Assets (Grade C+)',
  },
  {
    label: 'Tech Blog / Media',
    url: 'https://blog.techinsider-news.com/posts',
    note: 'Strong Content, Schema Warnings (Grade B)',
  },
  {
    label: 'Legacy HTTP Site',
    url: 'http://legacy-local-plumber.net',
    note: 'Insecure & Mobile Failures (Grade F)',
  },
];

export const UrlAuditForm: React.FC<UrlAuditFormProps> = ({
  onAudit,
  isLoading,
  currentUrl,
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl || 'https://growflow-saas.io');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }
    setError(null);
    onAudit(inputUrl.trim());
  };

  const handleSelectPreset = (url: string) => {
    setInputUrl(url);
    setError(null);
    onAudit(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-2">
          <span>INSTANT WEBSITE AUDIT ENGINE</span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-500 font-normal">27 Structural & Technical Checks</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Audit any website URL for actionable SEO rankings
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Uncover critical indexing bugs, On-Page tags, mobile responsiveness issues, and Core Web Vitals speed bottlenecks with plain-language recommendations.
        </p>

        {/* URL Form */}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="https://example.com"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-lg transition-colors cursor-pointer shadow-sm shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing URL...</span>
                </>
              ) : (
                <>
                  <span>Run SEO Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-600 font-medium">{error}</p>}
        </form>

        {/* Preset quick test links */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Try live demo presets:</span>
          {PRESET_URLS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => handleSelectPreset(preset.url)}
              disabled={isLoading}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
                inputUrl === preset.url
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title={preset.note}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
