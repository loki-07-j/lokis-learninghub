import { CourseData } from './types';

export const htmlCourse: CourseData = {
  title: 'HTML: The Web\'s Foundation',
  slug: 'html-fundamentals',
  description: 'Understand why HTML exists, how browsers actually parse and render it, and why semantic structure is the single most impactful thing you can do for accessibility, SEO, and maintainability.',
  modules: [
    {
      title: 'Module 1: Document Structure & The DOM',
      slug: 'document-structure-dom',
      description: 'From CERN\'s original vision to the browser\'s parse pipeline — understand the full journey from raw HTML text to an interactive visual page.',
      sort_order: 10,
      topics: [
        {
          title: 'Why HTML Exists & How Browsers Parse It',
          slug: 'why-html-exists-browser-parsing',
          description: 'The historical problem HTML solved, and the full browser parsing pipeline from bytes to DOM.',
          sort_order: 10,
          lessons: [
            {
              title: 'From CERN to the Browser: The Full Story',
              slug: 'from-cern-to-browser',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why HTML Was Invented',
                  subtitle: 'The problem that created the web',
                  content_json: {
                    problem: 'In 1989, Tim Berners-Lee at CERN needed a way for scientists to share research documents across different computers, operating systems, and software. There was no universal format — you\'d send a document and it might be unreadable on the recipient\'s machine.',
                    solution: 'HTML was designed as a portable, platform-agnostic document format. The key insight: separate CONTENT (what the document says) from PRESENTATION (how it looks). A browser on any machine could read the same HTML and render it meaningfully.',
                    why_it_matters: 'This separation of content from presentation is why HTML is still fundamentally structured around meaning, not appearance. When you write <h1> instead of <div style="font-size:2em;font-weight:bold">, you\'re honoring the original vision: content should declare its semantic meaning, not its visual style.',
                    modern_relevance: 'This philosophy is now more important than ever. Screen readers, search engine crawlers, AI parsers, and voice assistants all read your HTML to understand content — none of them care about visual styling. The document structure IS the interface for these consumers.'
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'HTML Is a Markup Language, Not a Programming Language',
                  subtitle: 'What "markup" actually means and why it matters',
                  content_json: {
                    explanation: 'HTML (HyperText Markup Language) uses tags to annotate content with meaning. The word "markup" comes from manuscript editing — editors would physically "mark up" pages with notes about how text should be treated.',
                    key_ideas: [
                      '<p>This is a paragraph</p> — you\'re telling the browser this block of text is a paragraph',
                      '<h1>Main Title</h1> — this is the most important heading on the page',
                      '<nav>...</nav> — this region is navigation',
                      '<button>Click me</button> — this element is interactive'
                    ],
                    critical_insight: 'HTML tags carry semantic weight. A <button> is not just a styled div — it\'s keyboard focusable by default, announced to screen readers as "button", and responds to Enter/Space keys. When you use a <div> with an onclick, you throw away all that built-in behavior and must recreate it yourself.',
                    document_structure: {
                      doctype: 'Tells browsers: "parse this as modern HTML5"',
                      html: 'Root element, contains everything',
                      head: 'Metadata, scripts, stylesheets — not rendered content',
                      body: 'Everything visible to the user'
                    }
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'How the Browser Parses HTML',
                  subtitle: 'From raw bytes to rendered pixels — the full pipeline',
                  content_json: {
                    steps: [
                      { step: '1. Bytes → Characters', detail: 'Browser receives raw bytes from the network. It checks the Content-Type header and meta charset to determine encoding (usually UTF-8). Bytes become characters.' },
                      { step: '2. Characters → Tokens', detail: 'The HTML Tokenizer reads characters and produces tokens: StartTag, EndTag, Character, Comment, DOCTYPE. It handles malformed HTML through a state machine (this is why browsers can render broken HTML).' },
                      { step: '3. Tokens → Nodes', detail: 'Each token becomes a Node object in memory with properties. A StartTag token for <div class="box"> becomes a Node with tagName="DIV" and attributes.' },
                      { step: '4. Nodes → DOM Tree', detail: 'The Tree Construction phase takes nodes and builds the parent-child DOM tree, following nesting rules. This is where elements become related to each other.' },
                      { step: '5. DOM + CSSOM → Render Tree', detail: 'CSS Object Model is built from stylesheets. Render tree = DOM nodes that are visible (display:none excluded) combined with their computed styles.' },
                      { step: '6. Layout (Reflow)', detail: 'Browser calculates exact position and size of every element in the viewport. Expensive operation — triggered by size/position changes.' },
                      { step: '7. Paint → Composite', detail: 'Pixels are drawn to layers. GPU composites layers into the final frame.' }
                    ],
                    critical_insight: 'HTML parsing is INCREMENTAL and FAULT-TOLERANT by spec. The browser starts building the DOM as soon as it receives the first bytes — it doesn\'t wait for the full document. This is why scripts in <head> without async/defer block rendering: they pause the HTML parser.'
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'Real-World Impact of Bad HTML Structure',
                  subtitle: 'What actually breaks when developers ignore semantics',
                  content_json: {
                    examples: [
                      {
                        scenario: 'The Checkout Button That Screen Reader Users Can\'t Click',
                        bad_code: '<div class="btn" onclick="checkout()">Buy Now</div>',
                        problem: 'A div is not keyboard-focusable. Screen reader users navigating by Tab cannot reach it. It\'s invisible to assistive technology.',
                        good_code: '<button type="button" onclick="checkout()">Buy Now</button>',
                        impact: 'Accessibility lawsuits cost companies millions. Domino\'s Pizza lost a Supreme Court case partly over inaccessible website elements.'
                      },
                      {
                        scenario: 'The Google-Invisible Page',
                        bad_code: '<div class="hero-text">Welcome to Our Platform</div>\n<div class="content-area">All our articles...</div>',
                        problem: 'Googlebot cannot understand what is the main heading vs body content. No <h1> means no clear topic signal. SEO ranking suffers.',
                        good_code: '<h1>Welcome to Our Platform</h1>\n<main>All our articles...</main>',
                        impact: 'Proper heading hierarchy is a top-3 SEO on-page factor.'
                      },
                      {
                        scenario: 'The Mobile Form That Loses Keyboard Focus',
                        bad_code: '<input type="text" placeholder="Email address" />',
                        problem: 'No associated <label>. On iOS, tapping the text fails to focus the input. Screen readers announce it as "text field" with no context.',
                        good_code: '<label for="email">Email address</label>\n<input type="email" id="email" autocomplete="email" />',
                        impact: 'Missing labels cause 40% higher form abandonment rates on mobile devices.'
                      }
                    ]
                  },
                  sort_order: 40,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'The Div Soup Epidemic',
                  subtitle: 'Why developers reach for <div> by default and why that\'s wrong',
                  content_json: {
                    wrong_pattern: `<!-- Div soup — meaning is completely lost -->
<div class="wrapper">
  <div class="header">
    <div class="logo">MyApp</div>
    <div class="nav">
      <div class="nav-item">Home</div>
      <div class="nav-item">About</div>
    </div>
  </div>
  <div class="main">
    <div class="article">
      <div class="title">Why HTML Matters</div>
      <div class="text">Content here...</div>
    </div>
  </div>
</div>`,
                    correct_pattern: `<!-- Semantic structure — robots, screen readers, developers all understand this -->
<body>
  <header>
    <a href="/" aria-label="MyApp home"><strong>MyApp</strong></a>
    <nav aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <article>
      <h1>Why HTML Matters</h1>
      <p>Content here...</p>
    </article>
  </main>
</body>`,
                    why_divs_exist: 'Divs are layout containers — they carry NO semantic meaning by design. Use them for styling hooks and layout wrappers ONLY, never as a replacement for semantic elements.'
                  },
                  sort_order: 50,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'DEBUGGING',
                  title: 'Debugging HTML with Browser DevTools',
                  subtitle: 'Reading the DOM, finding accessibility violations, inspecting parse errors',
                  content_json: {
                    tools: [
                      { tool: 'Elements Panel', use: 'See the live DOM (may differ from source HTML). Shows computed ARIA roles. Use to verify semantic structure.' },
                      { tool: 'Accessibility Tree', use: 'In DevTools → Accessibility tab. Shows what screen readers see. If your button is announced as "group" instead of "button", your markup is wrong.' },
                      { tool: 'Lighthouse Audit', use: 'DevTools → Lighthouse → run Accessibility audit. Catches missing labels, empty alt text, poor contrast.' },
                      { tool: 'View Source vs Elements', use: 'View Source shows original HTML. Elements Panel shows the parsed+corrected DOM. If they differ, the browser was fixing your broken markup.' }
                    ],
                    debugging_scenario: {
                      problem: 'Navigation links not reachable via Tab key',
                      step1: 'Open DevTools → Elements → find the nav elements',
                      step2: 'Check if they use <a href="..."> or <div onclick="...">',
                      step3: 'Open Accessibility tree — links should show as role="link"',
                      step4: 'If role shows as "generic" (div), replace with <a> or add role="link" tabindex="0"',
                      best_fix: 'Always use <a href> for navigation — it\'s focusable, keyboard-operable, and semantically correct by default'
                    }
                  },
                  sort_order: 60,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: Why Semantic HTML Over Divs?',
                  subtitle: 'The answer that separates good developers from great ones',
                  content_json: {
                    question: 'Why should you use <button> instead of <div> for clickable elements? What are the practical differences?',
                    thinking_strategy: 'Go beyond "it\'s semantic" — talk about what the browser gives you for free with native elements',
                    answer: `A native <button> element gives you:
1. Keyboard focus by default (Tab navigable)
2. Enter and Space key activation built-in
3. ARIA role of "button" announced to screen readers
4. :focus, :active, :hover states without extra work
5. Disabled state via the disabled attribute
6. Works with form elements (type="submit" triggers form)

A <div onclick="..."> gives you none of this. You'd need to add: tabindex="0", role="button", onkeydown handler for Enter/Space, manage disabled state manually, and test across screen readers.

The real answer: native HTML elements are the accessibility layer. Breaking it means you're responsible for recreating everything the browser gives for free — and you'll likely miss edge cases.`,
                    follow_up: 'What about custom components? — They need ARIA attributes (role, aria-label, aria-expanded etc.) to communicate state and purpose to assistive technology.'
                  },
                  sort_order: 70,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Key Takeaways: HTML Foundations',
                  subtitle: 'What to remember and repeat in any project',
                  content_json: {
                    bullets: [
                      'HTML is a semantic markup language — use tags for their meaning, not their default appearance',
                      'The browser parses HTML incrementally and fault-tolerantly; this affects script loading behavior',
                      'Native HTML elements (<button>, <a>, <input>, etc.) carry built-in accessibility, keyboard handling, and ARIA roles',
                      'Every div where a semantic element should be is a hidden accessibility and SEO bug',
                      'The DOM shown in DevTools Elements panel is the browser\'s corrected version — not necessarily your source'
                    ],
                    rule_of_thumb: 'Ask yourself: "If a blind user is navigating this page with a screen reader, can they understand and use every interactive element?" If not, your HTML structure needs work.'
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
              title: 'Why Browser Parses Incrementally',
              question_text: 'A browser starts rendering a webpage before receiving the complete HTML file. What is the primary architectural reason for this behavior?',
              options_json: {
                options: [
                  { id: 'a', text: 'Browsers cache partial HTML for offline use' },
                  { id: 'b', text: 'HTML parsing is designed to be incremental and streaming to reduce time-to-first-render on slow networks' },
                  { id: 'c', text: 'The HTTP/1.1 protocol sends HTML in multiple TCP packets' },
                  { id: 'd', text: 'JavaScript must execute before HTML rendering can complete' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'HTML parsing was specifically designed as a streaming process — the browser builds the DOM progressively as bytes arrive, not after the full document loads.',
              explanation: 'The HTML parser is deliberately incremental. As each chunk of HTML arrives over the network, it is immediately tokenized, parsed into DOM nodes, and rendered. This is why users see content appear progressively on slow connections rather than waiting for the full document. This behavior is WHY render-blocking scripts in <head> are harmful — they pause the parser.',
              complexity_score: 2,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'BEGINNER',
              title: 'Debug: Inaccessible Form',
              question_text: 'Screen reader users report they cannot understand what to type in the login form. Identify all accessibility problems and provide the fix.',
              scenario_context: `<!-- Current broken form -->
<form>
  <div>
    <input type="text" placeholder="Type your email..." />
  </div>
  <div>
    <input type="text" placeholder="Type your password..." />
  </div>
  <div class="btn" onclick="submitForm()">Login</div>
</form>`,
              correct_answer: 'Problems: (1) Missing <label> elements — screen readers only announce placeholder text which vanishes on focus. (2) Password field uses type="text" not type="password". (3) Login is a <div> not <button>. Fix: Add <label for="email">, change types, use <button type="submit">.',
              expected_reasoning: 'Three separate issues: missing labels (most critical — placeholder is not a label replacement), wrong input type (security/keyboard issue), non-semantic interactive element.',
              explanation: `Fixed form:
<form>
  <label for="email">Email address</label>
  <input type="email" id="email" autocomplete="email" />

  <label for="password">Password</label>
  <input type="password" id="password" autocomplete="current-password" />

  <button type="submit">Login</button>
</form>

Changes: (1) <label for="..."> + id on input — screen reader announces "Email address, text field" when focused. (2) type="email" enables email keyboard on mobile + validation. (3) type="password" masks characters. (4) <button type="submit"> is keyboard-focusable and submits the form on Enter.`,
              complexity_score: 2,
              estimated_time: 120,
            },
            {
              question_type: 'SCENARIO_ANALYSIS',
              thinking_type: 'REAL_WORLD',
              difficulty_level: 'INTERMEDIATE',
              title: 'SEO Structure Audit',
              question_text: 'A marketing team says their blog posts rank poorly despite high-quality writing. After reviewing the HTML structure below, identify why and propose a fix.',
              scenario_context: `<!-- Current blog post structure -->
<div class="page-header">
  <div class="logo">TechBlog</div>
  <div class="nav-links">...</div>
</div>
<div class="content">
  <div class="post-title" style="font-size:28px;font-weight:bold">
    Why PostgreSQL Beats MySQL for Complex Queries
  </div>
  <div class="author-info">By Loki J</div>
  <div class="post-body">
    <div class="section-title" style="font-size:20px;font-weight:600">
      Query Planner Differences
    </div>
    <div class="text">Content about query planners...</div>
  </div>
</div>`,
              correct_answer: 'Missing semantic structure: no <h1> for post title (Google cannot identify main topic), no heading hierarchy (section titles are styled divs not <h2>/<h3>), no <article> wrapper (no machine-readable article scope), no <header>/<nav> (crawlers cannot find navigation). Fix: Replace all styled divs with appropriate semantic elements.',
              expected_reasoning: 'Google\'s crawler reads semantic structure, not CSS styles. font-size:28px;font-weight:bold has zero meaning to a crawler — <h1> has the meaning.',
              explanation: `Fixed structure:
<header>
  <a href="/" aria-label="TechBlog Home"><strong>TechBlog</strong></a>
  <nav>...</nav>
</header>
<main>
  <article>
    <h1>Why PostgreSQL Beats MySQL for Complex Queries</h1>
    <p>By <span class="author">Loki J</span></p>
    <section>
      <h2>Query Planner Differences</h2>
      <p>Content about query planners...</p>
    </section>
  </article>
</main>

Google uses <h1> as the primary topic signal. Heading hierarchy (h1→h2→h3) tells crawlers how content is organized. <article> signals a standalone piece of content worth indexing.`,
              complexity_score: 3,
              estimated_time: 180,
            },
            {
              question_type: 'MCQ',
              thinking_type: 'INTERVIEW',
              difficulty_level: 'INTERMEDIATE',
              title: 'defer vs async Script Loading',
              question_text: 'You have a non-critical analytics script that should not block page rendering. Which attribute should you use and why?',
              options_json: {
                options: [
                  { id: 'a', text: 'async — downloads and executes immediately when downloaded, regardless of DOM state' },
                  { id: 'b', text: 'defer — downloads in parallel with HTML parsing, executes after DOM is complete, in order' },
                  { id: 'c', text: 'No attribute needed — just put the script at the bottom of <body>' },
                  { id: 'd', text: 'type="module" — prevents all script execution until interaction' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'defer preserves script execution order and waits for DOM completion — safer for analytics that need DOM access. async can execute mid-parse and fire out-of-order.',
              explanation: 'Use defer for scripts that: (1) need the DOM to be complete, (2) depend on other scripts (order matters), (3) should not interrupt HTML parsing. Use async for completely independent scripts where execution order doesn\'t matter (e.g. ads, tracking pixels). Type="module" scripts are deferred by default. Placing scripts before </body> is the old approach — defer in <head> is preferred as it starts downloading earlier.',
              complexity_score: 3,
              estimated_time: 90,
            },
            {
              question_type: 'MULTI_SELECT',
              thinking_type: 'LOGIC',
              difficulty_level: 'BEGINNER',
              title: 'Correct Uses of Semantic HTML',
              question_text: 'Which of the following are correct uses of semantic HTML elements? Select all that apply.',
              options_json: {
                options: [
                  { id: 'a', text: 'Using <strong> to mark text as bold for emphasis' },
                  { id: 'b', text: 'Using <b> as a visual styling-only tag with no semantic meaning' },
                  { id: 'c', text: 'Using <figure> and <figcaption> to associate an image with its description' },
                  { id: 'd', text: 'Using <time datetime="2025-01-15"> to mark dates machine-readably' },
                  { id: 'e', text: 'Using <i> to render text in italic without any semantic meaning' },
                ],
              },
              correct_answer: ['a', 'c', 'd'],
              expected_reasoning: '<strong> signals important content (semantic), <b> is purely visual, <figure>/<figcaption> associates content, <time datetime> provides machine-readable dates.',
              explanation: '<strong> = semantically important (screen readers may stress this). <b> = visual bold only, no semantic weight. <figure>+<figcaption> = correctly ties media to its caption for both visual and programmatic association. <time datetime="..."> = machine-readable date understood by search engines and event parsers. <i> is purely visual italic — use <em> for semantic emphasis instead.',
              complexity_score: 2,
              estimated_time: 90,
            },
          ],
        },
        {
          title: 'Semantic HTML5 Elements & Accessibility',
          slug: 'semantic-html5-accessibility',
          description: 'Master the semantic HTML5 elements that give meaning to document structure and make pages accessible to all users.',
          sort_order: 20,
          lessons: [
            {
              title: 'Semantic Structure: Beyond Divs',
              slug: 'semantic-structure-beyond-divs',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Semantic HTML5 Was Created',
                  subtitle: 'The problem that pre-HTML5 "div soup" caused',
                  content_json: {
                    problem: 'Before HTML5 (pre-2008), developers were forced to create navigation like <div id="nav">, headers like <div id="header">, and footers like <div id="footer">. Every site had different naming conventions. A screen reader or crawler had no reliable way to identify document regions.',
                    solution: 'HTML5 introduced native semantic elements: <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>. These create a standardized vocabulary for document structure that any browser, screen reader, or search engine can understand.',
                    real_impact: 'The JAWS screen reader now automatically announces "navigation landmark" when it enters a <nav>. Google can identify the primary content region from <main>. Developer tools can show document outline from heading hierarchy. None of this requires extra configuration — semantic HTML provides it for free.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 3,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'The HTML5 Semantic Element Vocabulary',
                  subtitle: 'What each element means and when to use it',
                  content_json: {
                    elements: [
                      { tag: '<header>', meaning: 'Introductory content for its parent section or the page. Contains logos, navigation, headings. NOT the same as <head>.' },
                      { tag: '<nav>', meaning: 'A set of navigation links. Use for major navigation blocks. A page can have multiple <nav> elements — use aria-label to differentiate.' },
                      { tag: '<main>', meaning: 'The dominant content of the document. ONE per page. Skip-to-main links target this. Search engines treat this as the primary content.' },
                      { tag: '<article>', meaning: 'A self-contained, independently distributable piece of content. Blog posts, news articles, forum threads, product cards. Could be syndicated elsewhere and still make sense.' },
                      { tag: '<section>', meaning: 'A thematic grouping of content, usually with a heading. Use when content is part of a larger whole. Don\'t use if there\'s no heading.' },
                      { tag: '<aside>', meaning: 'Content tangentially related to the surrounding content. Sidebars, pull quotes, ads, related articles.' },
                      { tag: '<footer>', meaning: 'Closing information for its parent section or page. Contact info, copyright, related links.' },
                    ],
                    key_distinction: '<article> vs <section>: article = standalone, could exist independently. section = part of a whole, requires its surrounding context. When in doubt: would this content make sense if copy-pasted somewhere else? If yes, use article.',
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'How Screen Readers Use Semantic Landmarks',
                  subtitle: 'What actually happens when NVDA/JAWS reads your page',
                  content_json: {
                    landmark_roles: 'HTML5 elements map to ARIA landmark roles automatically: <header> → banner, <nav> → navigation, <main> → main, <aside> → complementary, <footer> → contentinfo.',
                    navigation_modes: [
                      { mode: 'Virtual cursor mode', description: 'Screen reader reads content sequentially. Without landmarks, users hear everything from top to bottom.' },
                      { mode: 'Landmark navigation', description: 'Users can jump between landmarks (Nav, Main, Footer etc.) — like jumping between chapters. Requires correct semantic markup.' },
                      { mode: 'Heading navigation', description: 'Users navigate by H1/H2/H3 to find sections. This is how power users navigate long pages.' },
                    ],
                    example: 'With proper semantics, a JAWS user can press "R" to jump to all regions/landmarks, then hear "navigation landmark", "main landmark", "footer landmark". Without semantics, they must listen to the ENTIRE page from the top to find what they need.',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'How Airbnb Structures Its HTML',
                  subtitle: 'Production-grade semantic patterns from real applications',
                  content_json: {
                    pattern: 'Large-scale apps use semantic structure as the backbone for features like skip navigation, document search, and automated accessibility testing.',
                    skip_nav: 'The first element on most accessible sites is: <a href="#main-content" class="skip-link">Skip to main content</a>. This lets keyboard users bypass the navigation on every page. Only works if <main id="main-content"> exists.',
                    search_indexing: 'Google\'s documentation confirms that <article>, <section>, and heading hierarchy all contribute to content understanding. A well-structured article with H1 → H2 → H3 hierarchy has significantly better topic coverage signals.',
                    e2e_testing: 'Playwright and Cypress recommend using semantic roles in selectors: getByRole("button", {name: "Submit"}) instead of CSS class selectors. This makes tests resilient to styling changes and self-documenting.',
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Semantic HTML Anti-Patterns',
                  subtitle: 'The most common structural mistakes developers make',
                  content_json: {
                    mistakes: [
                      {
                        mistake: 'Using <section> without a heading',
                        example: '<section>\n  <p>Some content without a heading...</p>\n</section>',
                        why_wrong: '<section> must have a heading (h1-h6 or aria-labelledby). Without it, it\'s identical to a <div> but misleading.',
                        fix: 'Use <div> for styling-only groupings. Use <section> only when you have a heading to associate.',
                      },
                      {
                        mistake: 'Multiple <h1> tags',
                        example: '<h1>My Blog</h1>\n...\n<h1>Article Title</h1>',
                        why_wrong: 'A page has one primary topic. Multiple <h1> confuses search engines about the main topic and violates heading hierarchy.',
                        fix: 'One <h1> per page for the page\'s primary topic. Article titles should be <h2> or lower if the site title is <h1>.',
                      },
                      {
                        mistake: 'Skipping heading levels',
                        example: '<h1>Page Title</h1>\n<h4>Section Heading</h4>',
                        why_wrong: 'Screen reader users navigating by headings expect sequential hierarchy. Jumping from H1 to H4 is confusing.',
                        fix: 'H1 → H2 → H3 in order. You can skip back up levels but never jump forward (H1 → H4).',
                      },
                    ],
                  },
                  sort_order: 50,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: article vs section vs div',
                  subtitle: 'Explaining the semantic distinction that many senior developers get wrong',
                  content_json: {
                    question: 'What is the difference between <article>, <section>, and <div>? When would you use each?',
                    thinking_strategy: 'Think about standalone-ness and the presence of a heading',
                    answer: `<article>: Self-contained content that could be distributed elsewhere. Think: "Could this be syndicated as an RSS item, or shared independently?" Blog posts, news stories, comments, product listings. Should contain a heading.

<section>: A thematic grouping WITHIN a document. "Introduction", "Features", "Pricing" sections of a landing page. Always has a heading. Not independently meaningful.

<div>: A generic, ZERO-semantic container. Use for: styling groups, JavaScript hooks, layout wrappers. No meaning — it's invisible to screen readers and crawlers.

Rule of thumb:
- Would it be weird in an RSS feed? → section or div
- Does it have a heading? → article or section
- Is it just for styling? → div`,
                    bonus: 'A comment on a blog post should be <article> (it\'s independently meaningful). The section of comments as a whole could be <section aria-labelledby="comments-heading">.',
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Semantic HTML5: Key Principles',
                  subtitle: 'The rules that apply to every project',
                  content_json: {
                    bullets: [
                      'Use landmark elements (<header>, <nav>, <main>, <aside>, <footer>) to define page regions',
                      '<main> should appear exactly once, containing the primary content',
                      '<article> = independently distributable content with its own heading',
                      '<section> = thematic grouping, always with a heading',
                      '<div> = styling/layout only, zero semantic weight',
                      'Heading hierarchy (H1→H2→H3) is both an SEO signal and a screen reader navigation aid',
                    ],
                    quick_audit: 'Open any page and run: document.querySelectorAll("h1,h2,h3,h4,h5,h6") in console. The result should read like a table of contents. If it\'s empty or chaotic, the page has structural problems.',
                  },
                  sort_order: 70,
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
              title: 'article vs section',
              question_text: 'A blog page has a list of 10 post previews (title, excerpt, read more link). What is the correct semantic element to wrap each individual preview?',
              options_json: {
                options: [
                  { id: 'a', text: '<section> — it groups related content' },
                  { id: 'b', text: '<article> — each preview is independently meaningful content' },
                  { id: 'c', text: '<div> — previews are just layout components' },
                  { id: 'd', text: '<aside> — post previews are supplementary content' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'Each post preview is a standalone piece of content that could be syndicated as an RSS item — exactly what <article> is designed for.',
              explanation: '<article> wraps independently distributable, self-contained content. A blog post preview could be syndicated in an RSS feed, shared via social card, or displayed in search results. <section> would be for groupings within a document that have headings. The outer list container could be <section aria-labelledby="recent-posts-heading"> wrapping multiple <article> elements.',
              complexity_score: 1,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Fix the Document Outline',
              question_text: 'The accessibility audit reports "Heading levels skip from H1 to H4" and the screen reader misreads the page structure. Find and fix all heading hierarchy issues.',
              scenario_context: `<body>
  <header>
    <h1>TechBlog — Engineering for Humans</h1>
  </header>
  <main>
    <h4>Featured Article</h4>
    <article>
      <h4>How PostgreSQL MVCC Works</h4>
      <p>Content...</p>
      <h5>Transaction Isolation</h5>
      <h5>Snapshot Reading</h5>
    </article>
    <aside>
      <h4>Related Posts</h4>
    </aside>
  </main>
</body>`,
              correct_answer: 'The H1 is for the site, so articles need H2 for titles and H3 for sub-sections. "Featured Article" label should be H2. Article title H2, sub-sections H3.',
              expected_reasoning: 'H1 is used. Next level must be H2. H4 skips H2 and H3 entirely. Repair: H2 for section/article titles, H3 for sub-sections within articles.',
              explanation: `Fixed hierarchy:
<h1>TechBlog — Engineering for Humans</h1>  (site title - H1 ✓)
  <h2>Featured Article</h2>                  (section label - H2)
    <h2>How PostgreSQL MVCC Works</h2>        (article title - H2)
      <h3>Transaction Isolation</h3>          (sub-section - H3)
      <h3>Snapshot Reading</h3>               (sub-section - H3)
  <h2>Related Posts</h2>                      (aside heading - H2)

Rule: heading numbers represent nesting depth, not visual size. Use CSS to control appearance. Never skip levels.`,
              complexity_score: 2,
              estimated_time: 120,
            },
            {
              question_type: 'MCQ',
              thinking_type: 'INTERVIEW',
              difficulty_level: 'INTERMEDIATE',
              title: 'ARIA Roles vs Native Semantics',
              question_text: 'When should you add role="button" to a non-button element like a <div>?',
              options_json: {
                options: [
                  { id: 'a', text: 'Always — explicit ARIA roles override implicit ones and are more reliable' },
                  { id: 'b', text: 'Only when you cannot use a native <button> element for technical reasons' },
                  { id: 'c', text: 'Never — ARIA roles are deprecated in HTML5' },
                  { id: 'd', text: 'When you need custom styling that <button> elements don\'t support' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'ARIA first rule: use native HTML elements when possible. role="button" on a div still requires manual keyboard handling and focus management.',
              explanation: 'The First Rule of ARIA: "If you can use a native HTML element with the semantics and behaviour you require already built in, then do so instead of repurposing an element and adding an ARIA role." role="button" on a <div> gives screen readers the correct announcement but you still must manually: add tabindex="0" for keyboard focus, add onkeydown to handle Enter and Space, style :focus properly, and handle disabled state. Use <button> — it does all of this for free.',
              complexity_score: 3,
              estimated_time: 90,
            },
            {
              question_type: 'SCENARIO_ANALYSIS',
              thinking_type: 'REAL_WORLD',
              difficulty_level: 'ADVANCED',
              title: 'Accessible Modal Dialog Design',
              question_text: 'You need to build a modal dialog that is fully accessible. What HTML structure and ARIA attributes are required?',
              scenario_context: 'Requirements: (1) Opens on button click. (2) Focus moves into the modal when opened. (3) Focus is "trapped" inside while open — Tab key cycles through modal elements only. (4) Pressing Escape closes it. (5) Screen readers announce it as a dialog. (6) Background content is not accessible while modal is open.',
              correct_answer: 'Use <dialog> element (native HTML5), or div with role="dialog", aria-modal="true", aria-labelledby pointing to heading. Manage focus on open, return focus on close. Use inert attribute on background. Handle Escape key.',
              expected_reasoning: 'Accessible modal needs: semantic role (dialog), title association (aria-labelledby), focus management (trap + return), background isolation (inert or aria-hidden), keyboard close (Escape).',
              explanation: `Best approach — use native <dialog>:
<dialog id="confirm-modal" aria-labelledby="modal-title">
  <h2 id="modal-title">Confirm Delete</h2>
  <p>Are you sure you want to delete this item?</p>
  <button id="cancel-btn">Cancel</button>
  <button id="confirm-btn">Delete</button>
</dialog>

// JavaScript:
dialog.showModal(); // Native API: traps focus, adds backdrop, handles Escape
// On close: previous focused element automatically regains focus

Why native <dialog>: Built-in focus trap, Escape key handling, ::backdrop pseudo-element, returns focus automatically. For older browser support: add aria-modal="true", manually trap focus with focusable elements query, add inert attribute to main content.`,
              complexity_score: 4,
              estimated_time: 240,
            },
          ],
        },
      ],
    },
    {
      title: 'Module 2: HTML Forms & Performance',
      slug: 'html-forms-performance',
      description: 'Master HTML forms — the primary data entry mechanism of the web — and understand how HTML decisions impact browser performance.',
      sort_order: 20,
      topics: [
        {
          title: 'HTML Forms: The Complete Guide',
          slug: 'html-forms-complete-guide',
          description: 'From basic inputs to accessible, performant forms — how forms actually work, what the browser does for free, and how to not break it.',
          sort_order: 10,
          lessons: [
            {
              title: 'How HTML Forms Actually Work',
              slug: 'how-html-forms-work',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why HTML Has 30+ Input Types',
                  subtitle: 'The browser knows things about your device that CSS cannot',
                  content_json: {
                    problem: 'A phone keyboard for typing email addresses should show the @ symbol prominently. A date picker on mobile should use the native date wheel. A number input should show a numeric keypad. None of this requires JavaScript.',
                    solution: 'HTML input types tell the browser what kind of data is expected. The browser uses this to: show the right virtual keyboard, trigger native pickers, validate format before sending to your server, and use OS-level UX patterns.',
                    why_developers_ignore_this: 'Most developers use type="text" for everything. This means mobile users get a full QWERTY keyboard for entering a phone number, no format validation for emails, no native date pickers. Each of these causes measurable drop-off in conversion rates.',
                    numbers: 'Studies show properly typed inputs reduce form abandonment by 18% on mobile. Native date pickers reduce errors by 33% vs manually typed dates.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 3,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Input Types, Attributes & Native Validation',
                  subtitle: 'The full vocabulary of HTML form controls',
                  content_json: {
                    key_types: [
                      { type: 'email', behavior: 'Validates email format before submit. Shows email keyboard on mobile (@ key prominent).' },
                      { type: 'tel', behavior: 'Shows numeric dialpad keyboard on mobile. Does NOT validate format (phone formats vary by country).' },
                      { type: 'number', behavior: 'Shows numeric keyboard. Allows min/max/step constraints. Scroll wheel changes value.' },
                      { type: 'date', behavior: 'Native OS date picker. Value is always ISO format (YYYY-MM-DD) regardless of display locale.' },
                      { type: 'password', behavior: 'Masks characters. Prevents OS clipboard from logging. Triggers password manager UI.' },
                      { type: 'search', behavior: 'Shows X clear button. May show search history. Semantically a search input for accessibility.' },
                      { type: 'url', behavior: 'Validates URL format. Shows URL keyboard on mobile.' },
                      { type: 'file', behavior: 'OS file picker. accept attribute filters by MIME type.' },
                    ],
                    important_attributes: [
                      'required — field must have a value before submit (native validation)',
                      'pattern="[regex]" — value must match regex (with title for error message)',
                      'minlength/maxlength — character count constraints',
                      'autocomplete="email|name|tel|..." — browser autofill hint',
                      'inputmode="numeric|decimal|email|..." — keyboard hint independent of type',
                      'aria-describedby="hint-id" — associate hint text with input',
                    ],
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'How Form Submission Works',
                  subtitle: 'From button click to HTTP request — the mechanics',
                  content_json: {
                    submit_flow: [
                      '1. User clicks submit button (or presses Enter in single-input form)',
                      '2. Browser fires "submit" event on the <form> element (cancellable with preventDefault())',
                      '3. Browser runs constraint validation on all form fields (required, pattern, min, max, etc.)',
                      '4. If any field fails validation: show native error UI, cancel submission',
                      '5. Browser serializes form data into the specified enctype format',
                      '6. Browser sends HTTP request: GET appends to URL as query string, POST sends as request body',
                    ],
                    enctype_matters: {
                      'application/x-www-form-urlencoded': 'Default. Key-value pairs URL-encoded. Good for text data.',
                      'multipart/form-data': 'Required for file uploads. Sends each field as a separate MIME part with boundaries.',
                      'text/plain': 'Rarely used. No encoding. For debugging only.',
                    },
                    method_get_vs_post: 'GET: data in URL (bookmarkable, cached, logged in server logs). POST: data in body (not cached, not bookmarked, appropriate for mutations). NEVER use GET for sensitive data — it appears in logs, history, and referrer headers.',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Common Form Mistakes That Silently Break UX',
                  subtitle: 'Anti-patterns that developers repeat constantly',
                  content_json: {
                    mistakes: [
                      {
                        mistake: 'Using placeholder as label',
                        example: '<input type="text" placeholder="Enter your email" />',
                        problem: 'Placeholder disappears when user types. Screen readers may not announce it. Fails WCAG 1.3.1. Users forget what field they\'re in mid-input.',
                        fix: '<label for="email">Email</label>\n<input type="email" id="email" placeholder="you@example.com" />\n<!-- label stays visible, placeholder is just a hint -->',
                      },
                      {
                        mistake: 'Preventing autocomplete on non-sensitive fields',
                        example: '<form autocomplete="off">',
                        problem: 'Disabling autocomplete on name/email/address fields forces users to manually type everything. No legitimate security benefit for non-password fields.',
                        fix: 'Only disable autocomplete for genuinely sensitive fields. Use autocomplete="new-password" for password creation (to prevent fill with existing password).',
                      },
                      {
                        mistake: 'Button outside form without explicit form attribute',
                        example: '<form id="signup-form">...</form>\n<button type="submit">Register</button>',
                        problem: 'A submit button outside the <form> element has no association — clicking it does nothing.',
                        fix: 'Either move button inside <form>, or add form="signup-form" attribute: <button type="submit" form="signup-form">Register</button>',
                      },
                    ],
                  },
                  sort_order: 40,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: How Would You Handle Form Validation?',
                  subtitle: 'Client-side, server-side, and the security implications',
                  content_json: {
                    question: 'Where should form validation happen — client-side or server-side? Can you rely on HTML5 native validation?',
                    thinking_strategy: 'Security vs UX — they need each other',
                    answer: `Both are required for different reasons:

CLIENT-SIDE VALIDATION (HTML5 native + JS):
- Purpose: UX feedback before network round-trip
- HTML5: required, pattern, min, max, type validation
- JavaScript: complex rules (password match, async username availability)
- Can always be bypassed — curl -X POST directly to your API

SERVER-SIDE VALIDATION (non-negotiable):
- Purpose: Security — MUST validate everything again
- Client can be manipulated, bypassed, or removed
- SQL injection, XSS, business rule violations must be caught here
- Return structured errors (400 with error details)

Strategy:
1. HTML5 attributes for instant, zero-JS feedback
2. JS for complex/cross-field validation
3. Server validates everything as if client validation didn't exist
4. Match error messages between client and server`,
                    follow_up: 'How do you handle validation errors from the server in a form? — Return 422 with a field→errors map, map each error back to the field, use aria-describedby to associate errors with inputs.',
                  },
                  sort_order: 50,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'HTML Forms: Key Principles',
                  subtitle: 'The rules every form should follow',
                  content_json: {
                    bullets: [
                      'Always use <label for="id"> + matching id — not placeholder-as-label',
                      'Use the right input type — type="email" gives free validation + right mobile keyboard',
                      'autocomplete attributes help password managers and speed up UX',
                      'Client validation is UX; server validation is security — both are required',
                      'POST for mutations, GET for queries — never reverse this for security reasons',
                      'enctype="multipart/form-data" is required for file uploads',
                    ],
                  },
                  sort_order: 60,
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
              title: 'Form Submission Method Security',
              question_text: 'A login form sends username and password. Which HTTP method must be used and why?',
              options_json: {
                options: [
                  { id: 'a', text: 'GET — it\'s simpler and the data appears in the URL' },
                  { id: 'b', text: 'POST — credentials must not appear in URLs, history, or server access logs' },
                  { id: 'c', text: 'PUT — login replaces the session resource' },
                  { id: 'd', text: 'GET with HTTPS — encryption protects the URL parameters' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'GET appends data to the URL which is logged in server access logs, browser history, and referrer headers — exposing passwords even over HTTPS.',
              explanation: 'POST must be used for credentials. Even with HTTPS, GET parameters appear in: server access logs, browser history, OS history, referrer headers to third-party resources on the destination page, and proxy logs. POST sends data in the request body which is encrypted and not logged by default. HTTPS only encrypts the transport — it doesn\'t control where URLs get logged.',
              complexity_score: 2,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Debug: File Upload Not Working',
              question_text: 'A file upload form sends data but the server receives an empty file. Find the bug.',
              scenario_context: `<!-- Frontend form -->
<form method="POST" action="/upload">
  <label for="profile-photo">Profile Photo</label>
  <input type="file" id="profile-photo" name="photo" accept="image/*" />
  <button type="submit">Upload</button>
</form>

<!-- Server logs show: -->
<!-- req.files is undefined -->
<!-- req.body.photo is "" -->`,
              correct_answer: 'Missing enctype="multipart/form-data" on the form. Without it, the file field is URL-encoded as an empty string instead of sending the binary file data.',
              expected_reasoning: 'Default enctype (application/x-www-form-urlencoded) cannot transmit binary file data. Files require multipart/form-data encoding.',
              explanation: 'The form is missing enctype="multipart/form-data". Without it: (1) Default encoding is application/x-www-form-urlencoded which cannot represent binary data. (2) File input is sent as an empty string (just the filename, not contents). Fix: <form method="POST" action="/upload" enctype="multipart/form-data">. Server also needs file-parsing middleware (multer for Express, form-data for native Node).',
              complexity_score: 2,
              estimated_time: 90,
            },
            {
              question_type: 'MCQ',
              thinking_type: 'INTERVIEW',
              difficulty_level: 'INTERMEDIATE',
              title: 'HTML5 Native Validation Limitation',
              question_text: 'Your form has required field validation via the required attribute. A user opens browser DevTools and removes the "required" attribute from the HTML, then submits an empty form. What happens?',
              options_json: {
                options: [
                  { id: 'a', text: 'The form still cannot submit — required is enforced by the HTTP standard' },
                  { id: 'b', text: 'The form submits successfully — client-side validation is bypassed, server must validate' },
                  { id: 'c', text: 'The browser blocks this — DOM manipulation does not affect validation' },
                  { id: 'd', text: 'The form submits but the POST body is empty' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'Client-side validation (HTML attributes, JS) runs in the browser which the user controls. Any client-side validation can be bypassed.',
              explanation: 'HTML required, pattern, type validation all run in the browser which the user controls. An attacker (or curious developer) can remove attributes, disable JavaScript, or send raw HTTP requests to bypass all client-side validation. Server-side validation is not optional — it\'s the security layer. Client-side is only UX convenience. Always validate on the server as if no client validation exists.',
              complexity_score: 2,
              estimated_time: 60,
            },
          ],
        },
      ],
    },
  ],
};
