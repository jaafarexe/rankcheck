import React, { useState, useMemo, useRef } from 'react';
import { AuditCategory, AuditReport, AuditStatus } from './types/seo';
import { analyzeUrl } from './utils/seoAnalyzer';
import { Header } from './components/Header';
import { UrlAuditForm } from './components/UrlAuditForm';
import { AuditProgressScanner } from './components/AuditProgressScanner';
import { AuditSummaryCard } from './components/AuditSummaryCard';
import { CategoryScoreGrid } from './components/CategoryScoreGrid';
import { ChecklistFilterBar } from './components/ChecklistFilterBar';
import { ChecklistRow } from './components/ChecklistRow';
import { QuickWinsPanel } from './components/QuickWinsPanel';
import { ExportModal } from './components/ExportModal';
import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  const [targetUrl, setTargetUrl] = useState('https://growflow-saas.io');
  const [isAuditing, setIsAuditing] = useState(false);
  const [report, setReport] = useState<AuditReport>(() => analyzeUrl('https://growflow-saas.io'));
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  // Filter states
  const [statusFilter, setStatusFilter] = useState<AuditStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | 'all'>('all');
  const [highImpactOnly, setHighImpactOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNavSection, setActiveNavSection] = useState('overview');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Section references for smooth navigation
  const urlFormRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const quickWinsRef = useRef<HTMLDivElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);

  const handleStartAudit = (urlToAudit: string) => {
    setTargetUrl(urlToAudit);
    setIsAuditing(true);
    setResolvedIds(new Set()); // Reset resolved items on new audit
  };

  const handleAuditComplete = () => {
    const newReport = analyzeUrl(targetUrl);
    setReport(newReport);
    setIsAuditing(false);
    // Smooth scroll to summary
    overviewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleResolve = (id: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNavigate = (section: string) => {
    setActiveNavSection(section);
    if (section === 'overview') {
      overviewRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'checklist') {
      checklistRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'categories') {
      categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'quick-wins') {
      quickWinsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickFixSelect = (id: string) => {
    // Navigate and highlight checklist item
    setStatusFilter('all');
    setCategoryFilter('all');
    setHighImpactOnly(false);
    setSearchQuery('');
    checklistRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Dynamically compute adjusted score based on resolved checklist items
  const dynamicReport = useMemo(() => {
    if (resolvedIds.size === 0) return report;

    // Calculate score points gained by resolved items
    let gainedScore = 0;
    report.items.forEach((item) => {
      if (resolvedIds.has(item.id)) {
        if (item.status === 'fail') {
          gainedScore += Math.round(item.scoreImpact * 0.9);
        } else if (item.status === 'warning') {
          gainedScore += Math.round(item.scoreImpact * 0.45);
        }
      }
    });

    const adjustedScore = Math.min(100, report.overallScore + gainedScore);
    return {
      ...report,
      overallScore: adjustedScore,
      grade: adjustedScore >= 93 ? 'A+' : adjustedScore >= 85 ? 'A' : adjustedScore >= 75 ? 'B' : report.grade,
      statusLabel: adjustedScore >= 85 ? 'Optimized Health' : report.statusLabel,
    };
  }, [report, resolvedIds]);

  // Filter checklist items
  const filteredItems = useMemo(() => {
    return dynamicReport.items.filter((item) => {
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      // High impact filter
      if (highImpactOnly && item.impact !== 'high') {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDetected = item.detected.toLowerCase().includes(q);
        const matchRec = item.recommendation.toLowerCase().includes(q);
        if (!matchTitle && !matchDetected && !matchRec) {
          return false;
        }
      }
      return true;
    });
  }, [dynamicReport, statusFilter, categoryFilter, highImpactOnly, searchQuery]);

  const filterCounts = useMemo(() => {
    const total = dynamicReport.items.length;
    const pass = dynamicReport.items.filter((i) => i.status === 'pass').length;
    const warning = dynamicReport.items.filter((i) => i.status === 'warning').length;
    const fail = dynamicReport.items.filter((i) => i.status === 'fail').length;
    const highImpact = dynamicReport.items.filter((i) => i.impact === 'high').length;
    return { total, pass, warning, fail, highImpact };
  }, [dynamicReport]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Bar Header */}
      <Header
        onNewAuditClick={() => {
          urlFormRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onExportClick={() => setIsExportOpen(true)}
        activeSection={activeNavSection}
        onNavigate={handleNavigate}
        hasReport={Boolean(report)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* URL Form Section */}
        <section ref={urlFormRef}>
          <UrlAuditForm
            onAudit={handleStartAudit}
            isLoading={isAuditing}
            currentUrl={targetUrl}
          />
        </section>

        {/* Live scanning progress animation */}
        {isAuditing && (
          <AuditProgressScanner
            url={targetUrl}
            onComplete={handleAuditComplete}
          />
        )}

        {/* Audit Report Container */}
        {!isAuditing && report && (
          <div className="space-y-8">
            {/* Resolution Progress Bar if items are marked resolved */}
            {resolvedIds.size > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950">
                      Interactive Punch-List Progress:
                    </span>{' '}
                    <span className="text-emerald-800">
                      You have marked {resolvedIds.size} issue{resolvedIds.size > 1 ? 's' : ''} as resolved! Live simulated score updated to {dynamicReport.overallScore}/100.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResolvedIds(new Set())}
                  className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-semibold underline shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Fixes</span>
                </button>
              </div>
            )}

            {/* Overview Section: Score Gauge & Executive Metrics */}
            <section ref={overviewRef} className="scroll-mt-20">
              <AuditSummaryCard
                report={dynamicReport}
                onFilterStatus={(status) => {
                  setStatusFilter(status);
                  checklistRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </section>

            {/* Quick Wins High-Impact Section */}
            <section ref={quickWinsRef} className="scroll-mt-20">
              <QuickWinsPanel
                items={dynamicReport.items}
                resolvedIds={resolvedIds}
                onSelectFix={handleQuickFixSelect}
              />
            </section>

            {/* Category Breakdown Cards */}
            <section ref={categoriesRef} className="scroll-mt-20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Category Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any category card to filter checklist items directly
                  </p>
                </div>
                {categoryFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('all')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    Reset Category Filter
                  </button>
                )}
              </div>

              <CategoryScoreGrid
                categories={dynamicReport.categories}
                selectedCategory={categoryFilter}
                onSelectCategory={(cat) => {
                  setCategoryFilter(cat);
                  checklistRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </section>

            {/* Full Checklist Section */}
            <section ref={checklistRef} className="scroll-mt-20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Structured Audit Checklist
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspect findings, review ranking impact, and apply code recommendations
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  Showing <span className="font-bold text-slate-900 font-mono">{filteredItems.length}</span> of{' '}
                  <span className="font-mono">{dynamicReport.items.length}</span> checks
                </div>
              </div>

              {/* Filter Bar */}
              <ChecklistFilterBar
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                highImpactOnly={highImpactOnly}
                onHighImpactToggle={() => setHighImpactOnly(!highImpactOnly)}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                counts={filterCounts}
              />

              {/* Checklist Items List */}
              {filteredItems.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    No checklist items match the current filters.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try clearing your search query or selecting "All Items" in the filter bar.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setHighImpactOnly(false);
                      setSearchQuery('');
                    }}
                    className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <ChecklistRow
                      key={item.id}
                      item={item}
                      isResolved={resolvedIds.has(item.id)}
                      onToggleResolve={handleToggleResolve}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Marketing Style Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">RankCheck</span>
            <span aria-hidden="true">·</span>
            <span>Professional SEO Audit & Performance Engine</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <span>Core Web Vitals Evaluator</span>
            <span aria-hidden="true">·</span>
            <span>Googlebot Mobile Simulation</span>
            <span aria-hidden="true">·</span>
            <span>On-Page & Technical Checklist</span>
          </div>
        </div>
      </footer>

      {/* Export & Report Modal */}
      {report && (
        <ExportModal
          report={dynamicReport}
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}
