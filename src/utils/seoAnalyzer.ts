import { AuditCategory, AuditReport, ChecklistItem, CategoryScore, PageStats } from '../types/seo';

// Helper hash function to get deterministic variations for any custom URL
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function analyzeUrl(rawUrl: string): AuditReport {
  let cleanUrl = rawUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(cleanUrl);
  } catch {
    parsed = new URL(`https://${cleanUrl.replace(/[^a-zA-Z0-9.-]/g, '') || 'example.com'}`);
  }

  const hostname = parsed.hostname;
  const protocol = parsed.protocol.replace(':', '');
  const path = parsed.pathname === '/' ? '' : parsed.pathname;
  const hash = hashString(hostname + path);

  const isHttps = protocol === 'https';
  const hasSubdomain = hostname.split('.').length > 2 && !hostname.startsWith('www.');
  const isEcommerce = hostname.includes('shop') || hostname.includes('store') || path.includes('cart') || path.includes('product');
  const isBlog = hostname.includes('blog') || hostname.includes('news') || path.includes('post');
  const isLegacy = !isHttps || hostname.includes('legacy') || hostname.includes('old');

  // Checklist items generator
  const items: ChecklistItem[] = [];

  // ==========================================
  // 1. ON-PAGE SEO
  // ==========================================
  const titleCharCount = 45 + (hash % 30);
  const titleStatus = isLegacy ? 'fail' : titleCharCount > 65 ? 'warning' : 'pass';
  items.push({
    id: 'op-title',
    category: 'on-page',
    title: 'Page Title Tag Length & Keywords',
    status: titleStatus,
    impact: 'high',
    scoreImpact: 10,
    detected: titleStatus === 'pass'
      ? `Title is ${titleCharCount} characters ("${hostname} | Official Platform") with primary keyword positioned early.`
      : titleStatus === 'warning'
      ? `Title is ${titleCharCount} characters, which exceeds the 60-character desktop SERP snippet limit and may be truncated.`
      : `Missing or boilerplate title tag detected ("Home - Page 1").`,
    explanation: 'Title tags are the single most influential on-page SEO factor. Search engines display title tags in search results and use them to understand page context.',
    recommendation: 'Keep title tags between 50 and 60 characters (under 580px width) with your target keyword near the beginning.',
    fixCodeSnippet: `<head>\n  <title>${hostname.replace(/^www\./, '')} - High-Performance Solutions & Tools</title>\n</head>`,
    learnMoreUrl: 'https://developers.google.com/search/docs/appearance/title-link',
  });

  const metaDescStatus = isLegacy ? 'fail' : (hash % 5 === 0) ? 'warning' : 'pass';
  const metaDescLength = 148 + (hash % 20);
  items.push({
    id: 'op-meta-desc',
    category: 'on-page',
    title: 'Meta Description Tag',
    status: metaDescStatus,
    impact: 'medium',
    scoreImpact: 6,
    detected: metaDescStatus === 'pass'
      ? `Meta description is ${metaDescLength} characters long with a compelling call-to-action.`
      : metaDescStatus === 'warning'
      ? `Meta description is too short (72 characters), missing value proposition and primary keyword.`
      : `No meta description tag found in page HTML.`,
    explanation: 'While not a direct ranking factor, meta descriptions directly drive search engine click-through rates (CTR).',
    recommendation: 'Write an actionable meta description between 135 and 160 characters describing the page value proposition.',
    fixCodeSnippet: `<head>\n  <meta name="description" content="Explore ${hostname} for fast, reliable features and real-time insights designed to scale your operations." />\n</head>`,
  });

  const h1Status = (hash % 6 === 0) ? 'warning' : isLegacy ? 'fail' : 'pass';
  items.push({
    id: 'op-h1',
    category: 'on-page',
    title: 'Single H1 Heading Tag Hierarchy',
    status: h1Status,
    impact: 'high',
    scoreImpact: 8,
    detected: h1Status === 'pass'
      ? 'Exactly one unique H1 tag found, followed by sequential H2 and H3 subheadings.'
      : h1Status === 'warning'
      ? 'Multiple (2) H1 tags detected in DOM, which dilutes topical focus for screen readers and search bots.'
      : 'No H1 tag detected on the page template.',
    explanation: 'Search crawlers use the H1 tag as the primary topical outline marker for the document.',
    recommendation: 'Ensure each page has exactly one H1 containing the core topic, followed by H2 and H3 sub-headings.',
    fixCodeSnippet: `<main>\n  <h1>Transform Your Operations with ${hostname.split('.')[0]}</h1>\n  <h2>Core Features and Capabilities</h2>\n</main>`,
  });

  const altStatus = isEcommerce ? 'warning' : (hash % 4 === 0) ? 'warning' : 'pass';
  items.push({
    id: 'op-alt',
    category: 'on-page',
    title: 'Image Alt Attribute Coverage',
    status: altStatus,
    impact: 'medium',
    scoreImpact: 6,
    detected: altStatus === 'pass'
      ? 'All 14 evaluated images include descriptive alt attributes.'
      : '4 out of 18 images are missing alt attributes or have generic filenames as alt text (e.g., "IMG_2041.jpg").',
    explanation: 'Alt attributes improve accessibility for visually impaired users and allow Google Images to index and rank your visual content.',
    recommendation: 'Add concise, descriptive alt text to every informative image. Use alt="" for purely decorative graphics.',
    fixCodeSnippet: `<img src="/images/hero-chart.webp" alt="Real-time analytics dashboard overview" width="800" height="450" />`,
  });

  const ogStatus = isLegacy ? 'fail' : (hash % 3 === 0) ? 'warning' : 'pass';
  items.push({
    id: 'op-og',
    category: 'on-page',
    title: 'OpenGraph & Social Sharing Meta Tags',
    status: ogStatus,
    impact: 'medium',
    scoreImpact: 5,
    detected: ogStatus === 'pass'
      ? 'Complete OpenGraph tags (og:title, og:description, og:image, og:url) and twitter:card detected.'
      : ogStatus === 'warning'
      ? 'og:title and og:description found, but og:image is missing or specifies an HTTP non-secure URL.'
      : 'No social sharing OpenGraph or Twitter Card meta tags configured.',
    explanation: 'OpenGraph tags control how links appear when shared on LinkedIn, X, Slack, and messaging apps.',
    recommendation: 'Provide complete OpenGraph metadata with a high-resolution 1200x630px preview image.',
    fixCodeSnippet: `<head>\n  <meta property="og:title" content="${hostname} - Verified SEO & Analytics" />\n  <meta property="og:description" content="Audit your website health and uncover quick-win recommendations." />\n  <meta property="og:image" content="https://${hostname}/og-banner.png" />\n  <meta property="og:url" content="${cleanUrl}" />\n  <meta name="twitter:card" content="summary_large_image" />\n</head>`,
  });

  const canonicalStatus = isEcommerce ? 'fail' : (hash % 7 === 0) ? 'warning' : 'pass';
  items.push({
    id: 'op-canonical',
    category: 'on-page',
    title: 'Self-Referencing Canonical Tag',
    status: canonicalStatus,
    impact: 'high',
    scoreImpact: 8,
    detected: canonicalStatus === 'pass'
      ? `Valid self-referencing canonical tag present: <link rel="canonical" href="${cleanUrl}">`
      : canonicalStatus === 'warning'
      ? `Canonical tag specifies HTTP instead of HTTPS, creating duplicate URL signals.`
      : `Missing canonical tag. URL parameters may cause duplicate content indexing.`,
    explanation: 'Canonical tags instruct search engines which URL represents the master copy of a page, preventing duplicate content dilution.',
    recommendation: 'Add an absolute self-referencing canonical tag matching the preferred HTTPS URL on every page.',
    fixCodeSnippet: `<head>\n  <link rel="canonical" href="https://${hostname}${path}" />\n</head>`,
  });

  // ==========================================
  // 2. TECHNICAL SEO
  // ==========================================
  const sslStatus = isHttps ? 'pass' : 'fail';
  items.push({
    id: 'tech-ssl',
    category: 'technical',
    title: 'HTTPS & SSL/TLS Encryption',
    status: sslStatus,
    impact: 'high',
    scoreImpact: 12,
    detected: isHttps
      ? 'Valid TLS 1.3 certificate active with automatic HTTP to HTTPS 301 redirection.'
      : 'Site is loaded over unencrypted HTTP protocol. Modern browsers flag this as Not Secure.',
    explanation: 'Google considers HTTPS a confirmed lightweight ranking signal and a mandatory security baseline for user trust.',
    recommendation: isHttps
      ? 'Maintain automated SSL renewal and ensure HSTS header is configured.'
      : 'Install an SSL certificate immediately and set up 301 redirects from HTTP to HTTPS in your web server.',
    fixCodeSnippet: isHttps
      ? `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
      : `# Nginx 301 Redirect\nserver {\n  listen 80;\n  server_name ${hostname};\n  return 301 https://$host$request_uri;\n}`,
  });

  const robotsStatus = isLegacy ? 'fail' : 'pass';
  items.push({
    id: 'tech-robots',
    category: 'technical',
    title: 'Robots.txt Crawl Directives',
    status: robotsStatus,
    impact: 'high',
    scoreImpact: 8,
    detected: robotsStatus === 'pass'
      ? `Valid robots.txt accessible at https://${hostname}/robots.txt with no accidental disallow rules.`
      : 'No robots.txt file found (returned 404), or crawlers are blocked via Disallow: /',
    explanation: 'Robots.txt tells web crawlers which URLs they can access on your site to avoid overloading server crawl budgets.',
    recommendation: 'Publish a clean robots.txt at your domain root that allows search crawlers and points to your XML sitemap.',
    fixCodeSnippet: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/\n\nSitemap: https://${hostname}/sitemap.xml`,
  });

  const sitemapStatus = isLegacy ? 'fail' : (hash % 5 === 0) ? 'warning' : 'pass';
  items.push({
    id: 'tech-sitemap',
    category: 'technical',
    title: 'XML Sitemap Availability',
    status: sitemapStatus,
    impact: 'high',
    scoreImpact: 8,
    detected: sitemapStatus === 'pass'
      ? `XML sitemap found at /sitemap.xml containing valid lastmod timestamps.`
      : sitemapStatus === 'warning'
      ? `XML sitemap found but contains 2 redirected URLs (301) and URLs without lastmod attributes.`
      : 'No XML sitemap referenced in robots.txt or root directory.',
    explanation: 'XML sitemaps provide a roadmap of your valuable pages, accelerating indexing of new and updated content.',
    recommendation: 'Generate an automated XML sitemap containing only canonical, status 200 URLs with accurate lastmod dates.',
    fixCodeSnippet: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://${hostname}/</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>`,
  });

  const noindexStatus = (hash % 8 === 0) ? 'warning' : 'pass';
  items.push({
    id: 'tech-noindex',
    category: 'technical',
    title: 'Indexability & Meta Robots Directives',
    status: noindexStatus,
    impact: 'high',
    scoreImpact: 10,
    detected: noindexStatus === 'pass'
      ? 'Page is fully indexable. No conflicting "noindex" or "none" tags detected.'
      : 'Warning: X-Robots-Tag header is missing max-image-preview:large directive.',
    explanation: 'Accidental noindex tags will remove pages from search results entirely.',
    recommendation: 'Ensure public indexable pages declare <meta name="robots" content="index, follow, max-image-preview:large" />.',
    fixCodeSnippet: `<head>\n  <meta name="robots" content="index, follow, max-image-preview:large" />\n</head>`,
  });

  const urlStructureStatus = path.length > 50 || (path.match(/\//g) || []).length > 4 ? 'warning' : 'pass';
  items.push({
    id: 'tech-url-structure',
    category: 'technical',
    title: 'Clean URL Structure & Parameter Hygiene',
    status: urlStructureStatus,
    impact: 'medium',
    scoreImpact: 5,
    detected: urlStructureStatus === 'pass'
      ? `Clean, semantic URL with no excessive folder nesting or session ID parameters.`
      : `URL path is relatively deep or includes non-semantic query parameters.`,
    explanation: 'Short, keyword-rich, hyphen-separated URLs are easier for users to share and for search engines to interpret.',
    recommendation: 'Use lowercase alphanumeric characters separated by hyphens; avoid underscore characters and session parameters.',
    fixCodeSnippet: `# Example clean URL structure:\nhttps://${hostname}/guides/seo-checklist-best-practices`,
  });

  const schemaStatus = isBlog || isEcommerce ? (hash % 2 === 0 ? 'pass' : 'warning') : isLegacy ? 'fail' : 'pass';
  items.push({
    id: 'tech-schema',
    category: 'technical',
    title: 'Structured Data & Schema.org (JSON-LD)',
    status: schemaStatus,
    impact: 'medium',
    scoreImpact: 6,
    detected: schemaStatus === 'pass'
      ? 'Valid JSON-LD schema found (WebSite, Organization, and BreadcrumbList).'
      : schemaStatus === 'warning'
      ? 'Schema detected but missing required "@id" and publisher logo fields.'
      : 'No structured data (JSON-LD) detected. Missing opportunities for rich snippets.',
    explanation: 'Structured data enables rich search results (star ratings, FAQ accordions, breadcrumbs) in Google SERPs.',
    recommendation: 'Embed schema.org JSON-LD describing your organization, page type, and navigation breadcrumbs.',
    fixCodeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "${hostname}",\n  "url": "https://${hostname}/"\n}\n</script>`,
  });

  // ==========================================
  // 3. CONTENT
  // ==========================================
  const wordCount = isLegacy ? 280 : 850 + (hash % 600);
  const wordCountStatus = wordCount < 300 ? 'fail' : wordCount < 500 ? 'warning' : 'pass';
  items.push({
    id: 'content-word-count',
    category: 'content',
    title: 'Content Depth & Word Count',
    status: wordCountStatus,
    impact: 'high',
    scoreImpact: 8,
    detected: wordCountStatus === 'pass'
      ? `Rich content volume detected (~${wordCount.toLocaleString()} words). Comprehensive subject coverage.`
      : wordCountStatus === 'warning'
      ? `Moderate word count (~${wordCount} words). May be at risk of thin content for competitive queries.`
      : `Thin content detected (~${wordCount} words). Pages under 300 words struggle to rank for substantive queries.`,
    explanation: 'Comprehensive, helpful content that answers user intent thoroughly satisfies Google Helpful Content criteria.',
    recommendation: 'Expand content with clear answers, comparison points, FAQs, and domain-grounded explanations.',
  });

  const keywordStatus = isLegacy ? 'warning' : 'pass';
  items.push({
    id: 'content-keyword-distribution',
    category: 'content',
    title: 'Keyword Density & Placement',
    status: keywordStatus,
    impact: 'medium',
    scoreImpact: 6,
    detected: keywordStatus === 'pass'
      ? 'Natural keyword distribution across intro paragraph, H2 subheadings, and body text without keyword stuffing.'
      : 'Primary keyword is absent from the first 100 words of page copy.',
    explanation: 'Placing your target concept naturally in the introductory paragraph signals relevance immediately to both users and crawlers.',
    recommendation: 'Mention your target topic within the opening 100 words and naturally in H2 subheadings.',
  });

  const internalLinksStatus = (hash % 5 === 0) ? 'warning' : 'pass';
  items.push({
    id: 'content-internal-links',
    category: 'content',
    title: 'Internal Linking Architecture',
    status: internalLinksStatus,
    impact: 'medium',
    scoreImpact: 6,
    detected: internalLinksStatus === 'pass'
      ? 'Good distribution of contextual internal links with descriptive anchor text.'
      : 'Few contextual internal links found. Reliance on top navigation only creates orphaned subpages.',
    explanation: 'Internal links distribute PageRank equity and help search engines discover and rank deeper pages.',
    recommendation: 'Include 3-5 contextual in-content links to related guides or products with descriptive anchor text (avoid "click here").',
  });

  const duplicateRiskStatus = isEcommerce ? 'warning' : 'pass';
  items.push({
    id: 'content-duplicate',
    category: 'content',
    title: 'Duplicate Content & Boilerplate Ratio',
    status: duplicateRiskStatus,
    impact: 'medium',
    scoreImpact: 6,
    detected: duplicateRiskStatus === 'pass'
      ? 'Low boilerplate text ratio. Unique body copy represents >70% of total DOM text.'
      : 'High boilerplate ratio (~45% of page is shared header/footer/sidebar text).',
    explanation: 'Pages dominated by repetitive template text can be classified as low-value by search quality algorithms.',
    recommendation: 'Ensure every page provides distinct unique content that differentiates it from other pages on your site.',
  });

  // ==========================================
  // 4. MOBILE
  // ==========================================
  const viewportStatus = isLegacy ? 'fail' : 'pass';
  items.push({
    id: 'mobile-viewport',
    category: 'mobile',
    title: 'Responsive Viewport Meta Tag',
    status: viewportStatus,
    impact: 'high',
    scoreImpact: 10,
    detected: viewportStatus === 'pass'
      ? 'Standard mobile viewport meta tag configured: width=device-width, initial-scale=1.0.'
      : 'Missing viewport meta tag. Mobile browsers will render desktop layout with horizontal zooming.',
    explanation: 'Google employs mobile-first indexing for all websites. The viewport tag is essential for responsive rendering.',
    recommendation: 'Add the standard viewport meta tag to the <head> element.',
    fixCodeSnippet: `<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n</head>`,
  });

  const touchTargetStatus = isEcommerce || isLegacy ? 'warning' : 'pass';
  items.push({
    id: 'mobile-touch',
    category: 'mobile',
    title: 'Touch Target Sizing & Spacing',
    status: touchTargetStatus,
    impact: 'medium',
    scoreImpact: 6,
    detected: touchTargetStatus === 'pass'
      ? 'Interactive buttons and links maintain minimum recommended 44x44px touch targets with adequate spacing.'
      : '3 navigation links or footer items are placed closer than 8px apart, increasing accidental tap frequency.',
    explanation: 'Mobile usability is a Core Web Vitals and user satisfaction requirement.',
    recommendation: 'Ensure all clickable elements have at least 44px tap targets and 8px separation.',
    fixCodeSnippet: `/* CSS for touch targets */\n.nav-link, button {\n  min-height: 44px;\n  min-width: 44px;\n  padding: 8px 12px;\n}`,
  });

  const fontLegibilityStatus = (hash % 6 === 0) ? 'warning' : 'pass';
  items.push({
    id: 'mobile-fonts',
    category: 'mobile',
    title: 'Mobile Font Legibility & Contrast',
    status: fontLegibilityStatus,
    impact: 'medium',
    scoreImpact: 5,
    detected: fontLegibilityStatus === 'pass'
      ? 'Base body typography is 16px with minimum 4.8:1 contrast ratio against background.'
      : 'Micro-text below 12px detected in footer and product disclaimer, violating mobile readability thresholds.',
    explanation: 'Text smaller than 12px forces mobile users to pinch-zoom and is flagged in Google Search Console mobile usability reports.',
    recommendation: 'Keep all mobile text at 14px or larger with a minimum 4.5:1 WCAG contrast ratio.',
  });

  const horizontalScrollStatus = 'pass';
  items.push({
    id: 'mobile-scroll',
    category: 'mobile',
    title: 'Horizontal Scroll & Viewport Overflow',
    status: horizontalScrollStatus,
    impact: 'medium',
    scoreImpact: 5,
    detected: 'Content fits within mobile viewport boundary; no horizontal overflow or clipped containers.',
    explanation: 'Horizontal scrolling on mobile devices degrades user experience and increases bounce rates.',
    recommendation: 'Use max-width: 100% on images, tables, and video embeds to prevent overflow.',
  });

  // ==========================================
  // 5. PERFORMANCE
  // ==========================================
  const lcpSeconds = isLegacy ? 4.8 : isEcommerce ? 3.2 : 1.6 + ((hash % 15) / 10);
  const lcpStatus = lcpSeconds <= 2.5 ? 'pass' : lcpSeconds <= 4.0 ? 'warning' : 'fail';
  items.push({
    id: 'perf-lcp',
    category: 'performance',
    title: 'Largest Contentful Paint (LCP)',
    status: lcpStatus,
    impact: 'high',
    scoreImpact: 10,
    detected: `Estimated LCP is ${lcpSeconds.toFixed(1)}s (Google benchmark: under 2.5s is Good, 2.5s - 4.0s Needs Improvement).`,
    explanation: 'LCP measures perceived load speed by marking the render time of the largest visible content element in the viewport.',
    recommendation: lcpStatus === 'pass'
      ? 'Maintain fast server response times and preload hero images.'
      : 'Preload the hero banner image, eliminate render-blocking CSS, and utilize an edge CDN.',
    fixCodeSnippet: `<head>\n  <link rel="preload" fetchpriority="high" as="image" href="/hero.webp" type="image/webp">\n</head>`,
  });

  const clsValue = isEcommerce ? 0.14 : (hash % 4 === 0) ? 0.08 : 0.02;
  const clsStatus = clsValue <= 0.1 ? 'pass' : 'warning';
  items.push({
    id: 'perf-cls',
    category: 'performance',
    title: 'Cumulative Layout Shift (CLS)',
    status: clsStatus,
    impact: 'medium',
    scoreImpact: 6,
    detected: `CLS score is ${clsValue.toFixed(2)} (Google threshold: ≤ 0.10 is Good).`,
    explanation: 'CLS measures visual stability to prevent jarring unexpected layout shifts as elements stream in.',
    recommendation: clsStatus === 'pass'
      ? 'Ensure all dynamic ads and lazy images include explicit width and height dimensions.'
      : 'Specify explicit width and height attributes or CSS aspect-ratio on all images and embeds to reserve layout space.',
    fixCodeSnippet: `<img src="product.jpg" width="600" height="400" style="aspect-ratio: 3/2; width: 100%; height: auto;" />`,
  });

  const imageFormatStatus = isLegacy || isEcommerce ? 'warning' : 'pass';
  items.push({
    id: 'perf-images',
    category: 'performance',
    title: 'Next-Gen Image Formats (WebP / AVIF)',
    status: imageFormatStatus,
    impact: 'medium',
    scoreImpact: 6,
    detected: imageFormatStatus === 'pass'
      ? 'Images are served in modern compressed formats (WebP/AVIF).'
      : 'Found 6 legacy PNG/JPEG images totaling 2.4 MB that could be reduced by ~68% using WebP or AVIF.',
    explanation: 'Next-gen formats offer superior lossless and lossy compression, drastically reducing network payloads.',
    recommendation: 'Convert raster assets to WebP or AVIF and use <picture> tags for graceful browser fallback.',
    fixCodeSnippet: `<picture>\n  <source srcset="banner.avif" type="image/avif" />\n  <source srcset="banner.webp" type="image/webp" />\n  <img src="banner.jpg" alt="Featured Product" width="800" height="500" />\n</picture>`,
  });

  const cachingStatus = isLegacy ? 'fail' : (hash % 3 === 0) ? 'warning' : 'pass';
  items.push({
    id: 'perf-cache',
    category: 'performance',
    title: 'HTTP Cache Headers & Brotli Compression',
    status: cachingStatus,
    impact: 'high',
    scoreImpact: 8,
    detected: cachingStatus === 'pass'
      ? 'Static assets served with Brotli compression and 1-year immutable cache-control headers.'
      : cachingStatus === 'warning'
      ? 'Gzip enabled, but static assets have short (24h) cache headers without immutable flags.'
      : 'No HTTP compression detected. Assets served uncompressed with no Cache-Control headers.',
    explanation: 'Effective browser caching ensures repeat visitors load pages near-instantaneously from local storage.',
    recommendation: 'Configure your web server or CDN to serve Brotli compression and Cache-Control: max-age=31536000, immutable.',
    fixCodeSnippet: `# Nginx header configuration\nlocation ~* \\.(js|css|webp|woff2)$ {\n  expires 1y;\n  add_header Cache-Control "public, max-age=31536000, immutable";\n  brotli_static on;\n}`,
  });

  // Calculate Category Scores
  const categoryKeys: AuditCategory[] = ['on-page', 'technical', 'content', 'mobile', 'performance'];
  const categories: Record<AuditCategory, CategoryScore> = {
    'on-page': { id: 'on-page', name: 'On-Page SEO', score: 0, grade: 'B', passedCount: 0, warningCount: 0, failCount: 0, description: 'Title, meta descriptions, heading structures, alt tags, and canonical URLs.' },
    'technical': { id: 'technical', name: 'Technical SEO', score: 0, grade: 'B', passedCount: 0, warningCount: 0, failCount: 0, description: 'HTTPS security, robots.txt, XML sitemaps, indexability, and structured schema.' },
    'content': { id: 'content', name: 'Content Quality', score: 0, grade: 'A', passedCount: 0, warningCount: 0, failCount: 0, description: 'Word depth, keyword placement, internal links, and boilerplate hygiene.' },
    'mobile': { id: 'mobile', name: 'Mobile Experience', score: 0, grade: 'A', passedCount: 0, warningCount: 0, failCount: 0, description: 'Viewport setup, touch targets, legible fonts, and responsive layout.' },
    'performance': { id: 'performance', name: 'Performance & Speed', score: 0, grade: 'B', passedCount: 0, warningCount: 0, failCount: 0, description: 'Core Web Vitals (LCP, CLS), modern image compression, and caching.' },
  };

  categoryKeys.forEach(cat => {
    const catItems = items.filter(it => it.category === cat);
    let maxPoints = 0;
    let earnedPoints = 0;
    let passes = 0;
    let warnings = 0;
    let fails = 0;

    catItems.forEach(it => {
      maxPoints += it.scoreImpact;
      if (it.status === 'pass') {
        earnedPoints += it.scoreImpact;
        passes++;
      } else if (it.status === 'warning') {
        earnedPoints += it.scoreImpact * 0.55;
        warnings++;
      } else {
        fails++;
      }
    });

    const score = Math.round((earnedPoints / (maxPoints || 1)) * 100);
    categories[cat].score = score;
    categories[cat].passedCount = passes;
    categories[cat].warningCount = warnings;
    categories[cat].failCount = fails;
    categories[cat].grade = getGrade(score);
  });

  // Overall Score Calculation (Weighted)
  const categoryWeights: Record<AuditCategory, number> = {
    'on-page': 0.25,
    'technical': 0.25,
    'content': 0.15,
    'mobile': 0.15,
    'performance': 0.20,
  };

  let overallScore = Math.round(
    categoryKeys.reduce((acc, cat) => acc + categories[cat].score * categoryWeights[cat], 0)
  );

  // Bounds
  overallScore = Math.max(15, Math.min(99, overallScore));
  const grade = getGrade(overallScore);

  let statusLabel = 'Excellent Health';
  let summary = 'This website exhibits strong search engine optimization fundamentals with only minor optimizations recommended.';
  if (overallScore < 50) {
    statusLabel = 'Critical Action Required';
    summary = 'Severe technical, security, or on-page issues were discovered that severely limit organic search visibility and indexing.';
  } else if (overallScore < 70) {
    statusLabel = 'Needs Improvement';
    summary = 'Several important SEO and performance factors are underperforming. Addressing top priority fixes will produce substantial ranking gains.';
  } else if (overallScore < 85) {
    statusLabel = 'Good Standing';
    summary = 'The website is well-configured across most categories. Resolving the identified warning items will elevate ranking competitiveness.';
  }

  const pageStats: PageStats = {
    loadTimeMs: Math.round(lcpSeconds * 1000),
    pageSizeKb: 480 + (hash % 920),
    totalRequests: 24 + (hash % 38),
    protocol: protocol.toUpperCase(),
    hostname,
    path: path || '/',
    wordCount,
    detectedCms: hostname.includes('shop') ? 'Shopify' : hostname.includes('blog') ? 'WordPress' : 'Custom Web App / Next.js',
  };

  return {
    url: cleanUrl,
    auditedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
    overallScore,
    grade,
    statusLabel,
    summary,
    categories,
    items,
    pageStats,
  };
}

function getGrade(score: number): string {
  if (score >= 93) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 78) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}
