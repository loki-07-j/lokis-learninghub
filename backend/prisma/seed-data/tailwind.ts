import { CourseData } from './types';

export const tailwindCourse: CourseData = {
  title: 'Tailwind CSS: Utility-First Styling',
  slug: 'tailwind-css-utility-first',
  description: 'Tailwind flips the CSS mental model: instead of writing custom classes and then styling them, you compose design directly in HTML using single-purpose utility classes. Understanding why this works — and when it doesn\'t — separates effective Tailwind from a mess of class strings.',
  modules: [
    {
      title: 'Module 1: The Utility-First Philosophy & Configuration',
      slug: 'tailwind-philosophy-config',
      description: 'Why utility-first CSS exists, how Tailwind\'s build system works, and how to configure it for a real project.',
      sort_order: 10,
      topics: [
        {
          title: 'Why Utility-First CSS Exists',
          slug: 'utility-first-css',
          description: 'Tailwind is a different bet about where complexity should live in a codebase. Understanding the trade-off makes you use it well.',
          sort_order: 10,
          lessons: [
            {
              title: 'The Problem Tailwind Was Built to Solve',
              slug: 'tailwind-problem-solution',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Tailwind CSS Was Created',
                  subtitle: 'The scaling problem with semantic CSS',
                  content_json: {
                    the_problem: 'Traditional CSS starts clean. You write .card, .button, .header — semantic names. Then requirements change. .button needs a variant. .card needs a dark version. You add .button--primary, .button--secondary, .card--dark. After 6 months: 80KB of CSS, 40% of it dead code, and fear of deleting anything because you\'re not sure what it still styles.',
                    the_css_growth_problem: [
                      'CSS only grows — removing a class risks breaking something, so you add instead of modify',
                      'Specificity wars: overriding existing styles requires more specific selectors',
                      'Naming is hard: "what do I call this component that is a card but also a widget?"',
                      'Context switching: jumping between HTML and CSS files to understand what something looks like',
                    ],
                    tailwind_bet: 'Adam Wathan (Tailwind\'s creator) wrote "CSS Utility Classes and Separation of Concerns" in 2017. His argument: the "separation" in HTML+CSS was never truly meaningful — they\'re always coupled. A utility-first approach moves all styling decisions into the HTML, making the relationship explicit instead of implicit.',
                    the_result: 'Tailwind CSS (2017) — a utility-first framework where every class does exactly one thing. Styling is done by composing these single-purpose classes directly on HTML elements.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Utility Classes vs Component Classes',
                  subtitle: 'The fundamental shift in mental model',
                  content_json: {
                    traditional_approach: `/* CSS file */
.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* HTML */
<div class="card">...</div>`,
                    tailwind_approach: `<!-- No CSS file needed -->
<div class="bg-white rounded-lg p-6 shadow-md">...</div>`,
                    what_each_class_does: [
                      '`bg-white` → background-color: rgb(255 255 255)',
                      '`rounded-lg` → border-radius: 0.5rem',
                      '`p-6` → padding: 1.5rem (24px)',
                      '`shadow-md` → box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    ],
                    the_mental_shift: 'You stop thinking "what class name describes this element?" and start thinking "what visual properties does this element need?" The HTML becomes the single source of truth for appearance.',
                    what_stays_the_same: 'CSS concepts don\'t change: you still need to understand the box model, flexbox, grid, specificity. Tailwind is a vocabulary for applying CSS, not a replacement for understanding it.',
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'How Tailwind Generates CSS at Build Time',
                  subtitle: 'JIT compiler, purging, and why your CSS bundle is tiny',
                  content_json: {
                    the_old_way: 'Tailwind v2 pre-generated every possible class (~3.5MB CSS). Then PurgeCSS removed unused classes in production. This worked but had two problems: dev builds were huge, and dynamically constructed class names got purged.',
                    jit_engine: 'Tailwind v3 (2021) switched to a Just-In-Time compiler. Instead of pre-generating everything, it scans your files for class names and generates ONLY the CSS those classes need — on demand, in milliseconds.',
                    how_jit_works: [
                      '1. Tailwind watches your content files (configured in tailwind.config.js)',
                      '2. It scans for strings matching utility class patterns',
                      '3. Only the matched classes have CSS generated',
                      '4. Result: ~5-20KB CSS in production regardless of how many utilities Tailwind supports',
                    ],
                    critical_implication: `// THIS WILL FAIL — dynamic class construction
const color = 'red';
<div className={\`text-\${color}-500\`}>  // Tailwind can't detect 'text-red-500' as a string</div>

// THIS WORKS — full class names in source
const colorClass = 'text-red-500';  // Tailwind finds 'text-red-500' as a literal string
<div className={colorClass}>`,
                    content_config: `// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',  // Scan these files
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  // ...
}`,
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Responsive Design with Breakpoint Prefixes',
                  subtitle: 'Mobile-first responsive classes',
                  content_json: {
                    default_breakpoints: {
                      sm: '640px',
                      md: '768px',
                      lg: '1024px',
                      xl: '1280px',
                      '2xl': '1536px',
                    },
                    mobile_first: 'Unprefixed classes apply at all sizes. Prefixed classes apply at that breakpoint AND ABOVE. This is mobile-first by default.',
                    example: `<!-- Base: stacked (mobile). md+: side by side -->
<div class="flex flex-col md:flex-row">
  <aside class="w-full md:w-64">Sidebar</aside>
  <main class="flex-1">Content</main>
</div>`,
                    how_it_compiles: `/* Generated CSS */
.flex { display: flex; }
.flex-col { flex-direction: column; }

@media (min-width: 768px) {
  .md\\:flex-row { flex-direction: row; }
  .md\\:w-64 { width: 16rem; }
}`,
                    reading_tip: 'Read `md:flex-row` as: "at medium screens and up, flex-direction: row". Each prefix adds a media query wrapper.',
                  },
                  sort_order: 40,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'Building a Reusable Component with @apply',
                  subtitle: 'When to extract classes — and when not to',
                  content_json: {
                    the_duplication_problem: `<!-- Repeating the same 8 classes on every button is real maintenance pain -->
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Save</button>
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Submit</button>`,
                    solution_1_component: `// Preferred: Extract to a React/Vue component
function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </button>
  );
}`,
                    solution_2_apply: `/* In CSS file — use sparingly */
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg font-medium;
  @apply hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500;
}`,
                    when_to_use_apply: [
                      'USE @apply: When you need to style elements you can\'t control (markdown-rendered HTML, third-party library output)',
                      'USE @apply: Traditional multi-page apps without components',
                      'AVOID @apply: React/Vue/Angular projects — extract a component instead',
                      'AVOID @apply: It defeats the utility-first model and recreates the CSS maintenance problem',
                    ],
                    tailwind_creator_stance: 'Adam Wathan has repeatedly said: "If you\'re using @apply a lot, you\'re probably not using Tailwind the way it\'s meant to be used."',
                  },
                  sort_order: 50,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Common Tailwind Mistakes',
                  subtitle: 'Patterns that create unmaintainable Tailwind code',
                  content_json: {
                    mistakes: [
                      {
                        mistake: 'Dynamic class construction',
                        bad_code: `// BROKEN — Tailwind cannot detect these at build time
const variant = 'danger';
<div className={\`bg-\${variant}-500 text-\${variant}-700\`} />`,
                        fix: `// WORKS — full class names as string literals
const variants = {
  danger: 'bg-red-500 text-red-700',
  success: 'bg-green-500 text-green-700',
};
<div className={variants[variant]} />`,
                        why: 'JIT scanner looks for complete class name strings. Concatenated strings are invisible to the scanner.',
                      },
                      {
                        mistake: 'Using arbitrary values when a scale value exists',
                        bad_code: `<div class="mt-[13px]">  <!-- Arbitrary value -->`,
                        fix: `<div class="mt-3">  <!-- = 0.75rem = 12px, or mt-3.5 = 14px -->`,
                        why: 'Arbitrary values bypass the design system. Accumulate enough of them and you\'ve recreated inline styles with extra steps.',
                      },
                      {
                        mistake: 'Not configuring the theme for brand colors',
                        bad_code: `<!-- Hard-coding arbitrary brand color everywhere -->
<div class="bg-[#2563EB] hover:bg-[#1D4ED8]">`,
                        fix: `// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: { DEFAULT: '#2563EB', hover: '#1D4ED8' }
    }
  }
}
// Usage:
<div class="bg-brand hover:bg-brand-hover">`,
                        why: 'Brand colors change. Configuring them once means one update cascades everywhere.',
                      },
                    ],
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: Utility-First vs Component CSS',
                  subtitle: 'The architecture question every Tailwind developer gets asked',
                  content_json: {
                    question: 'What are the trade-offs between utility-first CSS (Tailwind) and component-scoped CSS (CSS Modules / styled-components)?',
                    answer: `Utility-first (Tailwind):
+ No context-switching between files — styling is co-located with markup
+ No naming cognitive load — classes describe visual properties, not component semantics
+ CSS doesn't grow — the utility set is fixed; you compose, not accumulate
+ Enforces design system — spacing/color scale prevents "just add a few pixels" drift
- Long class lists can be visually noisy
- Learning curve: must know Tailwind's vocabulary
- Less suitable for deeply dynamic styles (gradients based on runtime data)

Component-scoped CSS (Modules/styled-components):
+ Scoped by default — no global style pollution
+ Better for complex, state-driven styles (keyframes, computed values)
+ Semantic class names read naturally
- CSS files grow indefinitely; harder to delete safely
- Runtime overhead (styled-components generates CSS at runtime)

Best choice: Tailwind for design-system-driven UIs (dashboards, marketing sites, SaaS products). Component CSS when you need complex runtime styling or are working in a design system that predates utility-first.`,
                    follow_up: 'Can you use Tailwind with component libraries like shadcn/ui? — Yes. shadcn/ui is built on Tailwind + Radix UI. You own the component files, style them with Tailwind classes, and extend via tailwind.config.js. This is the dominant pattern for React+Tailwind apps in 2024-2025.',
                  },
                  sort_order: 70,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Tailwind CSS: Core Principles',
                  subtitle: 'The mental model for utility-first styling',
                  content_json: {
                    bullets: [
                      'Utility-first: every class does one thing. Compose them in HTML instead of writing custom CSS',
                      'JIT compiler scans your source files and generates ONLY the CSS you actually use',
                      'Never dynamically construct class names — the JIT scanner needs full string literals',
                      'Responsive: unprefixed = all sizes, `md:` = 768px+. Mobile-first by default',
                      '@apply exists but use it sparingly — prefer extracting React/Vue components instead',
                      'Configure brand colors/spacing in tailwind.config.js to maintain a coherent design system',
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
              title: 'Why Dynamic Class Names Fail',
              question_text: 'A developer writes `className={\`text-${color}-500\`}` in React. The class renders in the browser but the text color doesn\'t change. Why?',
              options_json: {
                options: [
                  { id: 'a', text: 'Template literals don\'t work in React className' },
                  { id: 'b', text: 'Tailwind\'s JIT scanner never saw the full class name "text-red-500" as a literal string, so it was never generated in the CSS bundle' },
                  { id: 'c', text: 'text-${color}-500 is not a valid Tailwind class pattern' },
                  { id: 'd', text: 'Dynamic classes require @apply in CSS to work' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'JIT scanner finds full class strings. Concatenated strings produce valid HTML class attributes but the CSS was never generated.',
              explanation: 'Tailwind\'s JIT compiler scans source files for complete class name strings before build. `text-${color}-500` evaluates to "text-red-500" at runtime in the browser — but at build time, the scanner only sees the template literal, not the resolved value. Since "text-red-500" never appears as a literal string, no CSS rule is generated. The class attribute is set correctly in the DOM but there is no CSS for it to apply.',
              complexity_score: 2,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Breakpoint Not Working',
              question_text: 'A developer expects a sidebar to be hidden on mobile and visible on desktop, but it\'s hidden on all screen sizes. Find the bug.',
              scenario_context: `<aside class="hidden lg:hidden">
  Sidebar content
</aside>`,
              correct_answer: '`lg:hidden` overrides the default by applying `display: none` at lg and above. Should be `lg:block` to show it on desktop.',
              expected_reasoning: 'Tailwind is mobile-first. `hidden` = display:none for all. `lg:block` would override it at lg+. `lg:hidden` adds another hidden at lg+, which is redundant and the bug.',
              explanation: `Fix:
<aside class="hidden lg:block">

Breakdown:
- \`hidden\` = display: none (all sizes)
- \`lg:block\` = display: block at 1024px and above (overrides the default hidden)

The original code: \`hidden lg:hidden\` means:
- All sizes: display: none
- lg+: also display: none (redundant, makes it worse)

Mobile-first means unprefixed classes are the base/mobile style, and prefixed classes override at larger sizes.`,
              complexity_score: 2,
              estimated_time: 90,
            },
            {
              question_type: 'SCENARIO_ANALYSIS',
              thinking_type: 'ARCHITECTURE',
              difficulty_level: 'ADVANCED',
              title: 'Design System Configuration',
              question_text: 'A design system requires: brand primary color #7C3AED, spacing scale in multiples of 4px up to 80px, and a custom font "Inter". How do you configure Tailwind to enforce this system-wide?',
              scenario_context: 'New project, Tailwind v3, React. Team of 5 developers. Goal: prevent "just one-off" spacing/color decisions.',
              correct_answer: 'Extend the theme in tailwind.config.js with custom colors, spacing, and fontFamily. Use extend to preserve Tailwind defaults, not replace them.',
              expected_reasoning: 'theme.extend preserves defaults + adds custom. theme (without extend) replaces defaults. Font needs fontFamily config + @import in CSS.',
              explanation: `// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',  // primary
          700: '#6d28d9',
        },
      },
      spacing: {
        // Tailwind default spacing is already 4px-based (1 = 4px)
        // Add custom values only if needed beyond the default scale
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
};

// In global CSS:
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

// Usage:
<div class="bg-brand-600 font-sans p-6">`,
              complexity_score: 3,
              estimated_time: 240,
            },
          ],
        },
      ],
    },
  ],
};
