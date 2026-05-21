import { CourseData } from './types';

export const seoCourse: CourseData = {
  title: 'SEO Fundamentals: How Search Engines Actually Work',
  slug: 'seo-fundamentals',
  description: 'SEO is not keyword stuffing or meta tag tricks. Modern SEO is about understanding how search engines crawl, index, and rank pages — and building technically sound, genuinely useful content. This course teaches the engineering side of SEO that developers are uniquely positioned to get right.',
  modules: [
    {
      title: 'Module 1: Crawling, Indexing & Technical SEO',
      slug: 'crawling-indexing-technical-seo',
      description: 'Before Google can rank your page, it must find it, crawl it, and understand it. Technical SEO is about removing every obstacle in that pipeline.',
      sort_order: 10,
      topics: [
        {
          title: 'How Search Engines Work: Crawl to Rank',
          slug: 'how-search-engines-work',
          description: 'The full pipeline from Googlebot discovering a URL to it appearing in search results — and what breaks at each stage.',
          sort_order: 10,
          lessons: [
            {
              title: 'The Crawl-Index-Rank Pipeline',
              slug: 'crawl-index-rank-pipeline',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Technical SEO Matters More Than Keywords',
                  subtitle: 'A page Google cannot crawl cannot rank — regardless of content quality',
                  content_json: {
                    the_shift: 'Early SEO (1990s-2000s) was about gaming keyword density and buying links. Google\'s algorithms were easy to fool. Modern Google (post-2012 Penguin/Panda updates, then BERT 2019, MUM 2021) understands content meaning. Keyword stuffing now hurts rankings.',
                    what_actually_matters: [
                      'Technical accessibility: Googlebot can crawl and render your page',
                      'Indexability: page is not blocked by robots.txt, noindex, or canonical issues',
                      'Page experience: Core Web Vitals (loading, interactivity, visual stability)',
                      'Content quality: demonstrates expertise, authoritativeness, trustworthiness (E-E-A-T)',
                      'Links: still a signal but quality > quantity',
                    ],
                    developer_advantage: 'Developers have direct control over 60-70% of ranking factors: page speed, Core Web Vitals, structured data, crawlability, URL structure, canonical tags. These are engineering problems, not content problems.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'The Three Stages: Crawl → Index → Rank',
                  subtitle: 'What happens between a URL existing and appearing in search results',
                  content_json: {
                    stage_1_crawl: {
                      what: 'Googlebot (a web crawler) discovers URLs via sitemaps, internal links, and external links. It fetches the HTML of each URL.',
                      bottlenecks: [
                        'robots.txt Disallow — bot is blocked from crawling the path',
                        'Crawl budget exhausted — large sites with poor internal linking may not get all pages crawled',
                        'Server errors (5xx) — bot backs off and retries later',
                        'Slow server response — bot has limited patience',
                      ],
                      check: 'Google Search Console → Coverage → Crawl Stats',
                    },
                    stage_2_index: {
                      what: 'Googlebot renders the page (executes JavaScript), extracts content, and decides whether to add it to the index.',
                      bottlenecks: [
                        'noindex meta tag or X-Robots-Tag header — page excluded from index',
                        'Canonical pointing elsewhere — Google indexes the canonical, not this URL',
                        'Duplicate content — Google picks one version, others may be deindexed',
                        'Thin content — page doesn\'t provide enough value',
                        'JavaScript rendering issues — content in JS that Googlebot fails to execute',
                      ],
                      check: 'site:yoursite.com in Google Search — shows indexed pages',
                    },
                    stage_3_rank: {
                      what: 'Google scores indexed pages against 200+ signals to determine ranking for each query.',
                      key_signals: [
                        'Relevance: does page content match query intent?',
                        'Authority: how many high-quality sites link to this page/domain?',
                        'Page Experience: Core Web Vitals scores',
                        'Freshness: is content up to date for time-sensitive queries?',
                        'Personalization: location, search history (minor factor)',
                      ],
                    },
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'How Google Renders JavaScript Pages',
                  subtitle: 'Why SSR matters for SEO and what Googlebot actually sees',
                  content_json: {
                    the_problem: 'Googlebot fetches HTML then runs JavaScript in a headless Chromium instance (as of 2019). But JavaScript rendering is expensive at scale. Google uses a two-wave system.',
                    two_wave_rendering: [
                      'Wave 1 (immediate): Googlebot fetches HTML. If content is in the HTML (SSR/SSG), it\'s indexed immediately.',
                      'Wave 2 (delayed): JavaScript is queued for rendering. Can take days to weeks for less important pages.',
                    ],
                    ssr_vs_csr: {
                      CSR_problem: 'Client-Side Rendered React app: initial HTML is <div id="root"></div>. Wave 1 sees empty page. Content only appears after Wave 2 JS rendering.',
                      SSR_solution: 'Server-Side Rendered (Next.js SSR/SSG): initial HTML contains full page content. Wave 1 sees complete page. Indexed immediately.',
                    },
                    what_to_do: `// Next.js — prefer SSG or SSR for SEO-critical pages
// Page component with getStaticProps (SSG)
export async function getStaticProps() {
  const posts = await fetchPosts();
  return { props: { posts }, revalidate: 3600 };
}

// Or use React Server Components (Next.js App Router)
// Server components render on server — HTML sent to client
export default async function Page() {
  const data = await fetchData(); // runs on server
  return <div>{data.title}</div>; // rendered HTML in response
}`,
                    rendered_html_check: 'Google Search Console → URL Inspection → View Crawled Page → Screenshot + HTML tab shows exactly what Googlebot sees.',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 7,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Core Web Vitals: The Page Experience Signals',
                  subtitle: 'The three metrics Google uses to measure user experience',
                  content_json: {
                    overview: 'Core Web Vitals (CWV) became a Google ranking factor in 2021. They measure real user experience, not synthetic benchmarks. Poor CWV hurts rankings for competitive queries.',
                    metrics: [
                      {
                        name: 'LCP — Largest Contentful Paint',
                        measures: 'How long until the largest visible element (hero image, H1) is rendered',
                        good: '≤ 2.5s',
                        poor: '> 4.0s',
                        common_culprits: [
                          'Unoptimized hero images (no WebP, no size attribute)',
                          'Render-blocking CSS/JS in <head>',
                          'Slow server response (TTFB > 600ms)',
                          'No preload for above-the-fold images',
                        ],
                        fix: 'Add fetchpriority="high" to hero <img>. Use next/image (automatic WebP + lazy loading). Preload critical fonts.',
                      },
                      {
                        name: 'CLS — Cumulative Layout Shift',
                        measures: 'How much the page layout shifts while loading (annoying jumps)',
                        good: '≤ 0.1',
                        poor: '> 0.25',
                        common_culprits: [
                          'Images without width/height attributes — browser doesn\'t reserve space',
                          'Ads or embeds injected dynamically above content',
                          'Web fonts causing FOUT (Flash of Unstyled Text)',
                        ],
                        fix: 'Always set width and height on images. Use font-display: optional or swap. Reserve space for dynamic content.',
                      },
                      {
                        name: 'INP — Interaction to Next Paint (replaced FID in 2024)',
                        measures: 'Responsiveness: time from user interaction to next visual update',
                        good: '≤ 200ms',
                        poor: '> 500ms',
                        common_culprits: [
                          'Long JavaScript tasks blocking the main thread',
                          'Expensive event handlers (sorting 10k items on click)',
                          'Third-party scripts (analytics, chat widgets)',
                        ],
                        fix: 'Break long tasks with scheduler.yield(). Defer non-critical third-party scripts. Use Web Workers for heavy computation.',
                      },
                    ],
                    how_to_measure: 'PageSpeed Insights (real field data + lab data). Chrome DevTools Performance tab. web-vitals npm package for in-app measurement.',
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 7,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'Implementing Structured Data (Schema.org)',
                  subtitle: 'How to get rich results in Google Search',
                  content_json: {
                    what_is_structured_data: 'Structured data is machine-readable markup (JSON-LD) that tells Google exactly what your content is: an article, a product, a FAQ, a how-to guide. Google uses it to display rich results: star ratings, prices, FAQ dropdowns directly in search results.',
                    json_ld_example: `<!-- In <head> or anywhere in <body> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How Git Tracks Changes Internally",
  "author": {
    "@type": "Person",
    "name": "Lokesh J"
  },
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-15",
  "description": "A deep dive into Git's object model and how commits are stored."
}
</script>`,
                    faq_schema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the difference between git merge and git rebase?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "git merge creates a merge commit preserving full history. git rebase rewrites commits to create linear history."
      }
    }
  ]
}
</script>`,
                    rich_result_types: [
                      'FAQPage — FAQ dropdowns in search results',
                      'HowTo — step-by-step instructions with images',
                      'Product — price, availability, star ratings',
                      'Article — author, publish date',
                      'BreadcrumbList — breadcrumb navigation in results',
                      'Course — course details (Google for Education)',
                    ],
                    next_js_implementation: `// In Next.js App Router layout or page component
export default function ArticlePage({ article }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    author: { '@type': 'Person', name: article.author },
    datePublished: article.publishedAt,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article>...</article>
    </>
  );
}`,
                    validation: 'Google Rich Results Test (search.google.com/test/rich-results) validates your markup and previews how it appears in search.',
                  },
                  sort_order: 50,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Technical SEO Mistakes Developers Make',
                  subtitle: 'Common engineering decisions that silently destroy rankings',
                  content_json: {
                    mistakes: [
                      {
                        mistake: 'Blocking Googlebot with robots.txt during development, then forgetting to remove it',
                        consequence: 'Entire site deindexed. Can take weeks to recover.',
                        fix: `# robots.txt — check this before launching!
# BAD (blocks everything):
User-agent: *
Disallow: /

# GOOD (allows crawling, blocks specific paths):
User-agent: *
Disallow: /admin/
Disallow: /api/
Sitemap: https://yourdomain.com/sitemap.xml`,
                      },
                      {
                        mistake: 'Missing or incorrect canonical tags causing duplicate content',
                        consequence: 'Google splits link equity between duplicate URLs. Both rank poorly.',
                        fix: `<!-- Every page should declare its canonical URL -->
<link rel="canonical" href="https://yoursite.com/blog/git-internals" />

<!-- Common mistake: canonical points to wrong URL -->
<!-- www vs non-www, http vs https, trailing slash — pick one and be consistent -->

<!-- In Next.js App Router: -->
export const metadata = {
  alternates: {
    canonical: 'https://yoursite.com/blog/git-internals',
  },
};`,
                      },
                      {
                        mistake: 'Images without alt text and without explicit dimensions',
                        consequence: 'CLS score hurt (no dimensions = layout shifts). Accessibility fail. Images not understood by Google Image Search.',
                        fix: `<!-- BAD -->
<img src="/hero.jpg">

<!-- GOOD -->
<img src="/hero.jpg" alt="Diagram showing Git's DAG commit graph" width="800" height="450">

<!-- Next.js next/image handles dimensions automatically -->
<Image src="/hero.jpg" alt="Git DAG diagram" width={800} height={450} priority />`,
                      },
                      {
                        mistake: 'Paginated content without proper pagination signals',
                        consequence: 'Google may not discover pages 2, 3, 4... of paginated lists.',
                        fix: 'Use <link rel="next"> and <link rel="prev"> OR implement infinite scroll with history.pushState() to update the URL as the user scrolls.',
                      },
                    ],
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: SEO for a Next.js Application',
                  subtitle: 'The full technical SEO implementation checklist',
                  content_json: {
                    question: 'You\'re building a content-heavy Next.js app that needs to rank on Google. Walk through the technical SEO implementation you\'d put in place.',
                    answer: `Technical SEO for a Next.js app involves 5 layers:

1. RENDERING STRATEGY
- Use SSG (generateStaticParams) for content that doesn't change per-user
- Use SSR for dynamic but SEO-important content
- Avoid pure CSR for any page that needs to rank

2. METADATA
export const metadata = {
  title: 'Page Title | Site Name',
  description: 'Under 160 chars, describes the page content',
  openGraph: { title, description, images: [{ url, width, height }] },
  alternates: { canonical: 'https://site.com/page' },
};

3. TECHNICAL BASICS
- sitemap.xml (Next.js: app/sitemap.ts export)
- robots.txt (app/robots.ts export)
- Proper status codes: 404 for missing, 301 for permanent redirects

4. CORE WEB VITALS
- next/image for all images (WebP, lazy load, CLS prevention)
- next/font for web fonts (eliminates FOUT, inline critical CSS)
- Code splitting is automatic in Next.js — check bundle with next build output

5. STRUCTURED DATA
- JSON-LD via <script type="application/ld+json"> in page component
- Article schema for blog posts, FAQPage for FAQ sections

Validate: Google Search Console (real data), PageSpeed Insights, URL Inspection.`,
                    follow_up: 'What is the difference between Open Graph and Twitter Card meta tags? — Open Graph (og:title, og:image etc.) controls how links appear when shared on Facebook, LinkedIn, Discord. Twitter Cards are Twitter-specific (twitter:card, twitter:title). In Next.js metadata.openGraph and metadata.twitter configure both. Always set og:image (1200x630px) — links without images get poor engagement.',
                  },
                  sort_order: 70,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'SEO: Core Engineering Principles',
                  subtitle: 'The developer\'s SEO checklist',
                  content_json: {
                    bullets: [
                      'Pipeline: Crawl → Index → Rank. A page blocked at any stage cannot rank.',
                      'Google\'s Chromium renders JS but delays it. Use SSR/SSG for SEO-critical content.',
                      'Core Web Vitals (LCP, CLS, INP) are ranking signals. Optimize images, eliminate layout shifts, avoid long JS tasks.',
                      'Canonical tags prevent duplicate content — every page needs <link rel="canonical">.',
                      'Structured data (JSON-LD) enables rich results: FAQ dropdowns, star ratings, breadcrumbs.',
                      'robots.txt blocks crawling. Check it before launch. sitemap.xml accelerates discovery.',
                    ],
                  },
                  sort_order: 80,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 2,
                  is_interactive: false,
                  is_required: true,
                },
              ],
            },
          ],
          questions: [
            {
              question_type: 'MCQ',
              thinking_type: 'LOGIC',
              difficulty_level: 'BEGINNER',
              title: 'Why CSR Hurts SEO',
              question_text: 'A React SPA renders all content client-side. The initial HTML response is just `<div id="root"></div>`. What is the SEO problem with this approach?',
              options_json: {
                options: [
                  { id: 'a', text: 'React apps cannot be indexed by Google' },
                  { id: 'b', text: 'Google\'s Wave 1 crawl sees empty HTML with no content. Wave 2 JS rendering may be delayed days to weeks, causing significant indexing lag compared to SSR pages.' },
                  { id: 'c', text: 'JavaScript files are blocked by robots.txt by default' },
                  { id: 'd', text: 'CSR apps generate duplicate content across all routes' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'CSR apps can be indexed via JS rendering, but it\'s slow and delayed. SSR/SSG pages are indexed immediately from the HTML response.',
              explanation: 'Google CAN crawl JavaScript-rendered content via its two-wave rendering system. But Wave 2 (JS rendering) is delayed and deprioritized for less crawl-budget sites. An SSR/SSG page with full HTML in the initial response is indexed in Wave 1 immediately. The practical result: CSR pages may take days to weeks to appear in search, SSR pages appear within hours.',
              complexity_score: 2,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Diagnose Indexing Problem',
              question_text: 'A page was published 3 weeks ago but doesn\'t appear in Google Search. The content is high-quality and the page loads correctly in a browser. What do you investigate?',
              scenario_context: `Page URL: https://site.com/blog/git-internals
Tech stack: Next.js App Router (client component with useEffect data fetching)
robots.txt: allows all
Sitemap: page is included`,
              correct_answer: 'The page uses a client component with useEffect — content is rendered in JS, not in initial HTML. Google Wave 1 sees empty content. Also check for accidental noindex meta tag, and inspect via Google Search Console URL Inspection.',
              expected_reasoning: 'Client component + useEffect = CSR. The HTML sent to Googlebot may not contain the article text. GSC URL Inspection shows what Googlebot actually sees.',
              explanation: `Investigation steps:
1. Google Search Console → URL Inspection → "Test Live URL"
   - Check "Page is available to Google"
   - Click "View Crawled Page" → see exact HTML Googlebot saw

2. Check for noindex:
   <meta name="robots" content="noindex"> or
   X-Robots-Tag: noindex in response headers

3. Check rendering:
   - If using 'use client' + useEffect, content only exists after JS executes
   - Fix: convert to Server Component (no 'use client', async data fetch)

4. Fix for Next.js App Router:
// BAD: client component with useEffect
'use client'
export default function BlogPost() {
  const [post, setPost] = useState(null);
  useEffect(() => { fetchPost().then(setPost); }, []);
  return post ? <article>{post.content}</article> : null;
}

// GOOD: server component
export default async function BlogPost({ params }) {
  const post = await fetchPost(params.slug);
  return <article>{post.content}</article>;
}`,
              complexity_score: 3,
              estimated_time: 180,
            },
            {
              question_type: 'SCENARIO_ANALYSIS',
              thinking_type: 'ARCHITECTURE',
              difficulty_level: 'ADVANCED',
              title: 'Core Web Vitals Optimization',
              question_text: 'PageSpeed Insights shows LCP of 4.8s and CLS of 0.32 for your homepage. The hero section has a full-width image and a banner ad that loads after 2 seconds. What specific changes fix both metrics?',
              scenario_context: `Current implementation:
<img src="/hero.jpg"> <!-- no width/height, no loading priority -->
<div id="ad-banner"> <!-- Ad injected by JS 2s after load, pushes content down -->

LCP: 4.8s (Poor), CLS: 0.32 (Poor)`,
              correct_answer: 'Fix LCP: add fetchpriority="high", explicit dimensions, preload link, convert to WebP. Fix CLS: reserve space for ad with min-height CSS before ad loads, add width/height to image.',
              expected_reasoning: 'LCP is slow because the hero image is not prioritized and blocks rendering. CLS is high because the ad shifts content after load. Both have specific fixes.',
              explanation: `LCP Fix:
<!-- 1. Preload the hero image -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">

<!-- 2. Mark it as high priority + explicit dimensions -->
<img
  src="/hero.webp"
  width="1200" height="600"
  fetchpriority="high"
  alt="Hero image"
>

<!-- Or with Next.js: -->
<Image src="/hero.webp" width={1200} height={600} priority alt="Hero" />

CLS Fix:
/* Reserve space for the ad BEFORE it loads */
#ad-banner {
  min-height: 90px; /* standard leaderboard height */
  width: 728px;
}
/* When ad loads it fills the reserved space — no layout shift */

Result expectations:
- LCP should drop to ~1.5-2s (image preloaded, priority fetch)
- CLS should drop to ~0 (space reserved, no unexpected shifts)`,
              complexity_score: 4,
              estimated_time: 300,
            },
          ],
        },
      ],
    },
  ],
};
