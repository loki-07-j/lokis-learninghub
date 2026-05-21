import { CourseData } from './types';

export const cssCourse: CourseData = {
  title: 'CSS: From Cascade to Layout Mastery',
  slug: 'css-mastery',
  description: 'Understand why CSS works the way it does — the cascade, specificity, box model, and modern layout systems. Build the mental models that make CSS predictable instead of mysterious.',
  modules: [
    {
      title: 'Module 1: The Cascade, Specificity & Box Model',
      slug: 'cascade-specificity-box-model',
      description: 'CSS is not random — it follows deterministic rules. Learn why styles apply (or don\'t) and why every element is fundamentally a box.',
      sort_order: 10,
      topics: [
        {
          title: 'How CSS Actually Works: Cascade & Specificity',
          slug: 'css-cascade-specificity',
          description: 'The deterministic rules that decide which styles win when multiple rules target the same element.',
          sort_order: 10,
          lessons: [
            {
              title: 'Why CSS Looks Unpredictable (And Why It Isn\'t)',
              slug: 'why-css-cascade-works',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why CSS Was Separated From HTML',
                  subtitle: 'The document vs presentation separation that changed the web',
                  content_json: {
                    history: 'In 1994, HTML documents were getting bloated with presentation tags like <font color="red">, <center>, and <b>. Every page had to repeat styling inline. Changing the font of a 1,000-page site meant editing every file.',
                    solution: 'CSS (Cascading Style Sheets, 1996) separated presentation from content. One stylesheet file controls the visual design of thousands of pages. Change one rule — update the entire site.',
                    cascade_origin: 'The "Cascading" in CSS describes how multiple stylesheets can apply to a document and how conflicts are resolved through a priority system. This was radical in 1996: browsers, user preferences, AND page authors could all contribute styles, with a defined hierarchy.',
                    modern_meaning: 'Today: CSS controls not just color and font, but complex 2D/3D animations, responsive layout, dark mode, print formatting, and accessibility contrast. The fundamental cascade is unchanged from 1996 — understanding it is the key to CSS mastery.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 3,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'The Cascade: 4 Layers of Style Resolution',
                  subtitle: 'How the browser decides which CSS rule wins',
                  content_json: {
                    cascade_layers: [
                      { layer: '1. Origin & Importance', explanation: 'Styles come from: browser default (user-agent), user preferences, author (your CSS), and author !important overrides. Author wins over browser defaults. !important reverses the cascade.' },
                      { layer: '2. Specificity', explanation: 'When same-origin rules conflict, the more specific selector wins. Inline styles > IDs > Classes > Elements.' },
                      { layer: '3. Source Order', explanation: 'When specificity is equal, the rule that appears LAST in the CSS wins. This is why class order in a stylesheet matters more than class order in HTML.' },
                      { layer: '4. Inheritance', explanation: 'Some properties (color, font-size, font-family) inherit from parent elements. Others (width, margin, padding) do not. You can force inheritance with inherit value.' },
                    ],
                    specificity_calculation: {
                      rule: 'Specificity is a 3-part score: (ID count, Class/Attribute/Pseudo-class count, Element/Pseudo-element count)',
                      examples: [
                        { selector: 'p', score: '(0,0,1)' },
                        { selector: '.warning', score: '(0,1,0)' },
                        { selector: '#header', score: '(1,0,0)' },
                        { selector: '#header .nav a', score: '(1,1,1)' },
                        { selector: 'style="color:red"', score: '(1,0,0,0) — always beats class/ID' },
                      ],
                      important_note: '!important bypasses all specificity — it creates a new cascade layer that almost nothing can override. Treat it as a last resort, not a problem-solver.',
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
                  title: 'How the Browser Builds the CSSOM',
                  subtitle: 'From stylesheet bytes to computed style values',
                  content_json: {
                    steps: [
                      { step: 'Parse CSS bytes', detail: 'Browser tokenizes CSS text into tokens (selectors, properties, values). Handles invalid declarations gracefully by ignoring them (forward compatibility).' },
                      { step: 'Build CSSOM tree', detail: 'CSS rules are organized into a tree structure matching the DOM hierarchy. Each node has matching CSS rules attached.' },
                      { step: 'Compute styles', detail: 'For each DOM element, the browser collects ALL matching CSS rules, sorts them by cascade order, and computes the final "computed style" value for every CSS property.' },
                      { step: 'Inherit values', detail: 'Properties marked as inherited (like color, font-size) bubble down from parent if not explicitly set on the child.' },
                      { step: 'Resolve relative units', detail: 'em, %, rem, vh/vw are converted to absolute pixel values based on context (parent font-size, root font-size, viewport dimensions).' },
                    ],
                    performance_note: 'The CSSOM blocks rendering — the browser cannot build the Render Tree until it has a complete CSSOM. This is why render-blocking CSS (link stylesheet in head without media queries) delays first paint. CSS in head = blocking by design to prevent FOUC (Flash of Unstyled Content).',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Specificity Wars & the !important Trap',
                  subtitle: 'How codebases become unmaintainable one specificity hack at a time',
                  content_json: {
                    problem_pattern: `/* Starts simple */
.button { color: blue; }

/* Developer needs override, adds ID */
#header .button { color: green; }

/* Another developer needs override */
#header .nav .button { color: red; }

/* Next developer gives up on selectors */
.button { color: purple !important; }

/* Now nothing can override the important */
/* The codebase is unmaintainable */`,
                    root_cause: 'Each override escalates specificity. Eventually someone uses !important. After that, the only escape is more !important or inline styles. This is specificity war.',
                    solution: `/* Use BEM or flat class approach */
.nav-button { color: blue; }
.nav-button--active { color: green; }  /* modification */
.nav-button--primary { color: red; }   /* modification */

/* Or use CSS Custom Properties for theming */
.button { color: var(--button-color, blue); }
.header .button { --button-color: green; }`,
                    best_practice: 'Target elements with classes. One level of selector specificity. Never use IDs in CSS for styling (use classes). Reserve !important for utility overrides or accessibility (forced-colors media query).',
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'DEBUGGING',
                  title: 'Debugging "Why Is My Style Not Applied?"',
                  subtitle: 'The systematic approach to CSS debugging',
                  content_json: {
                    devtools_workflow: [
                      '1. Inspect the element — DevTools → Styles panel',
                      '2. Look for strikethrough properties — these are overridden by higher-specificity rules',
                      '3. Check "Computed" tab — shows the final resolved value for every property',
                      '4. Hover over the selector — DevTools shows the specificity score (1,0,0) etc.',
                      '5. Check inheritance chain — expand parent elements to see what properties cascade down',
                    ],
                    common_reasons_style_doesnt_apply: [
                      { reason: 'Lower specificity', diagnostic: 'Strikethrough in Styles panel, another rule shown below it wins' },
                      { reason: '!important override', diagnostic: 'Target rule has "!important" badge in DevTools' },
                      { reason: 'Wrong selector', diagnostic: 'Hover selector in DevTools → see if it matches your element' },
                      { reason: 'Source order', diagnostic: 'Your rule appears earlier in the CSS — a later rule with same specificity wins' },
                      { reason: 'Property not inherited', diagnostic: 'Parent has the value but child does not inherit it — check if property inherits' },
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
                  title: 'Interview: Explain CSS Specificity',
                  subtitle: 'The answer that shows you understand CSS deeply',
                  content_json: {
                    question: 'If both .nav a and a:hover have conflicting styles, which wins? How do you calculate CSS specificity?',
                    thinking_strategy: 'Walk through the (ID, Class, Element) scoring system, then apply it',
                    answer: `Specificity is calculated as 3 numbers: (ID, Class/Attribute/Pseudo-class, Element/Pseudo-element).

.nav a = (0, 1, 1) — one class (.nav), one element (a)
a:hover = (0, 1, 1) — one element (a), one pseudo-class (:hover)

They're EQUAL! Source order decides: the rule defined LATER in the stylesheet wins.

Specificity table (high to low):
!important → Inline styles (1,0,0,0) → ID #header (1,0,0) → .class / [attr] / :hover (0,1,0) → element / ::before (0,0,1) → * / combinators (0,0,0)

Key insight: .class beats any number of element selectors (1,0) > (0,100). This is why .nav a is NOT more specific than #main — the ID wins regardless of class count.`,
                    follow_up: 'How would you override a rule with high specificity without using !important? — Use the same or higher specificity selector, or use cascade layers (@layer) to control ordering without specificity fighting.',
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'CSS Cascade: Core Principles',
                  subtitle: 'What to internalize for predictable CSS',
                  content_json: {
                    bullets: [
                      'Cascade resolves conflicts through: origin, specificity, source order',
                      'Specificity = (ID count, Class/Pseudo-class/Attribute count, Element count)',
                      'Classes beat elements regardless of how many elements are stacked',
                      'IDs beat all classes regardless of class count',
                      'Inline styles beat all selectors — use sparingly',
                      '!important creates a new cascade layer — avoid except for accessibility overrides',
                      'Source order matters when specificity is tied — later wins',
                    ],
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
              title: 'Specificity Calculation',
              question_text: 'Given these two CSS rules targeting the same element, which color will be applied?\n\n.container .btn { color: red; }\n#main button { color: blue; }',
              options_json: {
                options: [
                  { id: 'a', text: 'red — .container .btn has two selectors vs one ID selector' },
                  { id: 'b', text: 'blue — the ID selector #main has higher specificity (1,0,0) vs (0,2,0)' },
                  { id: 'c', text: 'red — classes are more "powerful" than IDs' },
                  { id: 'd', text: 'Depends on which appears later in the CSS file' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: '#main button = (1,0,1). .container .btn = (0,2,1). One ID (1,0,0) always beats any number of classes.',
              explanation: 'Specificity scores: #main button = (1,0,1) — one ID, zero classes, one element. .container .btn = (0,2,0) — zero IDs, two classes. Since #main button has an ID (score=1 in first position), it beats the class-based selector regardless of how many classes are stacked. This is why IDs in CSS are problematic — they create a specificity cliff that\'s hard to override.',
              complexity_score: 2,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Debug: !important War',
              question_text: 'A developer reports that none of their CSS overrides are working. Review the CSS and explain the root cause and correct fix.',
              scenario_context: `/* base.css (loaded first) */
.card {
  background: white !important;
  color: #333 !important;
  padding: 16px !important;
}

/* theme.css (loaded second) */
.card {
  background: #1e293b;  /* supposed to be dark theme */
  color: #f1f5f9;
  padding: 24px;
}

/* developer is now adding: */
.dark-mode .card {
  background: #0f172a !important;  /* still not working... */
}`,
              correct_answer: 'The base.css uses !important on all properties. Theme overrides without !important cannot override them. The dark-mode override with !important might work but the !important war escalates. Fix: Remove all !important from base.css, use cascade layers or specificity instead.',
              expected_reasoning: '!important overrides all non-!important rules regardless of specificity or source order. The only way to override an !important is with another !important + equal/higher specificity.',
              explanation: 'Root cause: base.css uses !important defensively, creating a cascade problem. theme.css rules (no !important) are overridden by base.css !important rules regardless of load order. Fix approach: (1) Remove !important from base.css. (2) Use @layer to control priority: @layer base, theme { .card { ... } } — theme layer wins over base layer. Or (3) Use higher specificity in theme: body .card { ... }. Never use !important for general styling.',
              complexity_score: 3,
              estimated_time: 150,
            },
            {
              question_type: 'MCQ',
              thinking_type: 'INTERVIEW',
              difficulty_level: 'INTERMEDIATE',
              title: 'Why CSS Render Blocks',
              question_text: 'You have a large stylesheet linked in <head>. Why does this block the first paint of the page?',
              options_json: {
                options: [
                  { id: 'a', text: 'CSS files are downloaded synchronously before HTML parsing can continue' },
                  { id: 'b', text: 'The browser cannot render any content until the CSSOM is complete — unstyled content would flash then re-render (FOUC)' },
                  { id: 'c', text: 'CSS in <head> blocks JavaScript execution which blocks HTML parsing' },
                  { id: 'd', text: 'External CSS always requires a DNS lookup that delays rendering' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'Render Tree requires both DOM + CSSOM. Rendering without CSSOM would show unstyled content then cause a jarring re-render. The browser deliberately waits.',
              explanation: 'The Render Tree = DOM + CSSOM. If the browser rendered without the CSSOM, users would see a Flash of Unstyled Content (FOUC) — text in browser default font/size, then a jarring repaint when CSS loads. To prevent this, render-blocking stylesheets are a deliberate design choice. Optimization: (1) Inline critical CSS in <style>, (2) Use media="print" for print stylesheets (non-blocking), (3) Reduce stylesheet size, (4) Use link rel="preload" as="style" for fonts.',
              complexity_score: 3,
              estimated_time: 90,
            },
          ],
        },
        {
          title: 'The CSS Box Model',
          slug: 'css-box-model',
          description: 'Every element in CSS is a box. Understanding content, padding, border, margin, and box-sizing is the foundation of every layout decision.',
          sort_order: 20,
          lessons: [
            {
              title: 'Every Element Is a Box',
              slug: 'every-element-is-a-box',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why the Box Model Exists',
                  subtitle: 'The geometric abstraction that makes CSS layout possible',
                  content_json: {
                    insight: 'A computer screen is a 2D grid of pixels. To position text, images, and shapes, there must be a geometric model. CSS chose the "box" model: every element occupies a rectangular area defined by its content, padding, border, and margin.',
                    historical_context: 'The box model defined the relationship between declared width/height and the actual space an element takes. The original CSS1 specification (1996) defined width as CONTENT width only — setting width:200px gave you 200px of content, plus whatever padding and border you added on top.',
                    the_problem: 'This meant: if you set width:100%, then added padding:20px and border:2px, your element was actually 100% + 44px wide — overflowing its container. This caused enormous frustration for decades.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 3,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Content, Padding, Border, Margin — The Four Layers',
                  subtitle: 'What each layer is, what it does, and how they interact',
                  content_json: {
                    layers: [
                      {
                        name: 'Content',
                        description: 'The actual content area — where text renders, images display. Width and height apply here (in content-box model).',
                        key_note: 'Background color/image extends into the padding area, not just content.',
                      },
                      {
                        name: 'Padding',
                        description: 'Space BETWEEN content and border. Transparent area inside the border. Padding inherits background color.',
                        key_note: 'padding-top, padding-right, padding-bottom, padding-left. Shorthand: padding: 10px 20px (vertical horizontal).',
                      },
                      {
                        name: 'Border',
                        description: 'A visible line around the padding area. Has width, style (solid/dashed/dotted), and color.',
                        key_note: 'border-radius applies to border corners (not content). outline is similar but doesn\'t affect layout.',
                      },
                      {
                        name: 'Margin',
                        description: 'Space OUTSIDE the border — between this element and its neighbors. Margin is always transparent.',
                        key_note: 'Margins collapse: adjacent vertical margins merge into one (the larger value). This surprises most developers.',
                      },
                    ],
                    box_sizing: {
                      content_box: 'width = content only. Total = width + padding + border. (CSS1 default — confusing)',
                      border_box: 'width = content + padding + border. Total = width. (Intuitive behavior — industry standard)',
                      industry_standard: '*, *::before, *::after { box-sizing: border-box; } — applied globally in virtually every modern CSS framework.',
                    },
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'Margin Collapse: Why Adjacent Margins Merge',
                  subtitle: 'The counterintuitive behavior that confuses developers daily',
                  content_json: {
                    what_is_it: 'When two block elements are vertically adjacent and both have margins, their margins do not add — they collapse into one, taking the value of the LARGER margin.',
                    examples: [
                      {
                        case: 'Adjacent siblings',
                        code: 'p { margin-bottom: 20px; }\nh2 { margin-top: 30px; }',
                        result: 'Gap between p and h2 is 30px (not 50px)',
                      },
                      {
                        case: 'Parent-child collapse',
                        code: '.parent { margin-top: 30px; }\n.child { margin-top: 20px; }',
                        result: 'If parent has no padding/border/height between the margins, child margin "bleeds through" parent',
                      },
                    ],
                    when_collapse_does_NOT_happen: [
                      'Elements in a flex or grid container',
                      'Elements with overflow:hidden, overflow:auto on parent',
                      'Parent has padding or border',
                      'Horizontal margins never collapse',
                    ],
                    why_it_exists: 'Margin collapse was designed for typography — paragraphs have default margins to create vertical rhythm. Without collapsing, a heading after a paragraph would have DOUBLE spacing (p\'s bottom + h\'s top). Collapse creates consistent prose rhythm.',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'The box-sizing: content-box Trap',
                  subtitle: 'Why your percentage widths overflow',
                  content_json: {
                    problem: `/* This seems like it should work */
.sidebar { width: 30%; }
.main { width: 70%; }

/* Both are in a flex row, should fill 100% */
/* But add padding: */
.sidebar { padding: 20px; }
.main { padding: 40px; }
/* Now: 30% + 40px + 70% + 80px = 100% + 120px = OVERFLOW */`,
                    root_cause: 'Default box-sizing: content-box means padding is ADDED to the declared width. 30% wide + 40px padding = wider than 30%.',
                    fix: `/* Apply globally — almost every project should have this */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Now: width INCLUDES padding and border */
/* 30% sidebar with padding 20px = still 30% total */`,
                    also_common: 'input, textarea, select have box-sizing: content-box by default even in modern browsers — they will overflow their container without the global reset.',
                  },
                  sort_order: 40,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: box-sizing: border-box Explanation',
                  subtitle: 'Explaining the most impactful 3-line CSS snippet',
                  content_json: {
                    question: 'What is box-sizing: border-box and why is it in virtually every CSS framework?',
                    answer: `box-sizing controls what the width/height properties include.

content-box (default):
width = content area ONLY
Total size = width + padding-left + padding-right + border-left + border-right

border-box:
width = content + padding + border COMBINED
Total size = exactly the declared width

Why border-box is the industry standard:
1. Intuitive: "I set width:200px, it takes up 200px" — what humans expect
2. Predictable: Adding padding doesn't change the element's outer dimensions
3. Percentage layouts work: width:50% + padding:20px = still exactly 50% wide
4. Every major CSS framework (Tailwind, Bootstrap, Material UI) applies it globally

The 3-line CSS reset that should be in every project:
*, *::before, *::after { box-sizing: border-box; }`,
                    follow_up: 'Does border-box affect margin? No — margin is always outside the box and is never included in width/height calculations.',
                  },
                  sort_order: 50,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'CSS Box Model: Core Principles',
                  subtitle: 'The geometric rules behind every layout',
                  content_json: {
                    bullets: [
                      'Every element = content + padding + border + margin',
                      'border-box: width includes padding + border (use globally)',
                      'content-box: width = content only, padding/border added on top (confusing default)',
                      'Margin collapse: vertical adjacent margins merge into one (the larger value)',
                      'Background extends into padding but NOT margin',
                      'outline does NOT affect layout — it\'s drawn on top without pushing neighbors',
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
              question_type: 'OUTPUT_PREDICTION',
              thinking_type: 'LOGIC',
              difficulty_level: 'BEGINNER',
              title: 'Box Model Width Calculation',
              question_text: 'An element has these styles. What is its TOTAL rendered width in pixels? (Assume no box-sizing reset)\n\n.box { width: 200px; padding: 20px; border: 2px solid black; margin: 10px; }',
              options_json: {
                hint: 'Without box-sizing:border-box, width = content only. Total = width + left padding + right padding + left border + right border',
              },
              correct_answer: '244',
              expected_reasoning: 'content-box: 200 (content) + 20 + 20 (padding) + 2 + 2 (border) = 244. Margin is NOT included in element width.',
              explanation: 'Default box-sizing is content-box. Total visible width = 200 (content) + 20 (padding-left) + 20 (padding-right) + 2 (border-left) + 2 (border-right) = 244px. Margin (10px each side) creates space OUTSIDE the element but is not part of the element\'s width. With box-sizing:border-box, the total would be exactly 200px.',
              complexity_score: 1,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Debug: Unexpected Space Above Element',
              question_text: 'There\'s an unexpected 30px gap above a section even though the developer set margin-top: 0 on it. Find the cause.',
              scenario_context: `<div class="container">
  <section class="hero">
    <h1>Welcome</h1>
  </section>
</div>

<style>
.container { background: navy; padding: 0; }
.hero { margin-top: 0; background: gold; }
h1 { margin-top: 30px; font-size: 2rem; }
</style>

/* There is a 30px gap of navy showing above the gold section */`,
              correct_answer: 'Margin collapse: the h1\'s margin-top (30px) collapses through .hero (no padding/border to stop it) and appears as a gap above .hero. Fix: add padding-top: 1px to .hero, or overflow:hidden, or use padding instead of margin on h1.',
              expected_reasoning: 'When a parent has no padding/border/height between its top edge and a child\'s top margin, the child\'s margin collapses through the parent.',
              explanation: 'This is parent-child margin collapse. The h1 has margin-top:30px. The .hero parent has no padding-top or border-top to "stop" that margin. So h1\'s margin bleeds through the parent and appears as space ABOVE the parent. Fix options: (1) Add padding-top: 1px or 0.1px to .hero (any padding stops collapse). (2) Add border-top: 1px solid transparent. (3) Add overflow: hidden or overflow: auto to .hero. (4) Change h1 to use padding-top instead of margin-top.',
              complexity_score: 3,
              estimated_time: 150,
            },
            {
              question_type: 'MCQ',
              thinking_type: 'INTERVIEW',
              difficulty_level: 'BEGINNER',
              title: 'outline vs border',
              question_text: 'What is the key difference between CSS outline and border that makes outline ideal for focus styles?',
              options_json: {
                options: [
                  { id: 'a', text: 'outline supports more color values than border' },
                  { id: 'b', text: 'outline does NOT affect layout — it draws outside the element without shifting neighbors or changing box dimensions' },
                  { id: 'c', text: 'outline is always visible while border only shows when a color is specified' },
                  { id: 'd', text: 'outline respects border-radius while border does not' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'outline is drawn OUTSIDE the border, does not take up space in layout, and adding/removing it does not cause reflow.',
              explanation: 'outline does not participate in the box model — it draws on top of surrounding content without pushing or pulling neighbors. This makes it perfect for focus indicators: showing a focus ring does not shift layout or change element dimensions. border, by contrast, IS part of the box model — adding a border changes the element\'s size (in content-box) or compresses content (in border-box), potentially causing layout shift.',
              complexity_score: 2,
              estimated_time: 60,
            },
          ],
        },
      ],
    },
    {
      title: 'Module 2: Modern CSS Layout',
      slug: 'modern-css-layout',
      description: 'Flexbox and Grid are the two layout systems that replaced decades of float hacks and table layouts. Understand the mental model behind each and when to use which.',
      sort_order: 20,
      topics: [
        {
          title: 'Flexbox: One-Dimensional Layout',
          slug: 'flexbox-layout',
          description: 'Flexbox solves one-dimensional layout (row OR column). Understanding the flex model makes layout predictable instead of trial and error.',
          sort_order: 10,
          lessons: [
            {
              title: 'The Flexbox Mental Model',
              slug: 'flexbox-mental-model',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'What Problem Flexbox Solved',
                  subtitle: 'Centering used to be CSS\'s hardest problem',
                  content_json: {
                    pre_flexbox: 'Before Flexbox (2009+), centering an element in CSS required hacks: position:absolute + margin:auto, table-cell + vertical-align, negative margins, or calculated percentages. None of them worked reliably across all scenarios.',
                    actual_problem: 'Float-based layouts could not distribute space between items, could not align items vertically, and required clearfix hacks. Building a navigation bar with items evenly spaced required complex math.',
                    flexbox_solution: 'Flexbox provides a set of properties to: distribute space among items, align items along the main and cross axes, control item order, and allow items to grow/shrink to fill available space.',
                    one_line_centering: 'The dream: .container { display: flex; justify-content: center; align-items: center; } — this perfectly centers one or many items both horizontally and vertically. That\'s it.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 3,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'The Flexbox Model: Container vs Items',
                  subtitle: 'Two roles, two sets of properties',
                  content_json: {
                    two_roles: 'Flexbox operates at two levels: the CONTAINER (parent with display:flex) and the ITEMS (direct children).',
                    container_properties: [
                      { property: 'flex-direction', values: 'row (default) | column | row-reverse | column-reverse', effect: 'Defines the MAIN axis direction' },
                      { property: 'justify-content', values: 'flex-start | center | flex-end | space-between | space-around | space-evenly', effect: 'Aligns items along the MAIN axis' },
                      { property: 'align-items', values: 'stretch (default) | flex-start | center | flex-end | baseline', effect: 'Aligns items along the CROSS axis' },
                      { property: 'flex-wrap', values: 'nowrap (default) | wrap | wrap-reverse', effect: 'Whether items wrap to next line when space runs out' },
                      { property: 'gap', values: '<length>', effect: 'Space between flex items (replaces margin hacks)' },
                    ],
                    item_properties: [
                      { property: 'flex-grow', values: '<number>', effect: 'How much item grows to fill extra space (0 = no grow)' },
                      { property: 'flex-shrink', values: '<number>', effect: 'How much item shrinks when not enough space (1 = shrinks equally)' },
                      { property: 'flex-basis', values: '<length> | auto | content', effect: 'Initial size before grow/shrink applied' },
                      { property: 'flex', values: 'shorthand: grow shrink basis', effect: 'flex: 1 = flex: 1 1 0% (grow equally, shrink, start at 0)' },
                      { property: 'align-self', values: 'Same as align-items', effect: 'Override container alignment for this specific item' },
                      { property: 'order', values: '<integer>', effect: 'Reorder visually (not DOM order — accessibility concern)' },
                    ],
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'How the Browser Calculates Flex Item Sizes',
                  subtitle: 'The flex algorithm: hypothetical main size → available space → grow/shrink',
                  content_json: {
                    algorithm: [
                      { step: '1. Determine flex-basis', detail: 'Each item\'s initial size is its flex-basis (auto = use the item\'s width/height; 0% = start from zero).' },
                      { step: '2. Calculate available space', detail: 'Container width minus sum of all flex-basis values = free space (positive = extra room, negative = overflow).' },
                      { step: '3. Apply flex-grow / flex-shrink', detail: 'If free space is positive: distribute it among items with flex-grow > 0, proportional to their flex-grow values. If negative: shrink items with flex-shrink > 0.' },
                      { step: '4. Apply min/max constraints', detail: 'If an item hits min-content or min-width/max-width, the algorithm redistributes space without that item\'s constraint.' },
                    ],
                    flex_1_explained: 'flex: 1 is shorthand for flex: 1 1 0%. flex-basis:0% means start from zero. flex-grow:1 means grow to fill space. Result: all items with flex:1 are equal width. This is different from flex: 1 1 auto which starts from content size then grows.',
                    space_between_vs_gap: 'justify-content: space-between puts space BETWEEN items. gap: 20px puts space between items. Key difference: space-between has no outer margin; gap creates consistent gutters including with flex-wrap.',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'Flexbox Patterns Every Project Uses',
                  subtitle: 'The 5 most common flex layouts in production UI',
                  content_json: {
                    patterns: [
                      {
                        name: 'Navigation Bar',
                        code: `.nav { display: flex; align-items: center; justify-content: space-between; }
.nav-logo { /* stays left */ }
.nav-links { display: flex; gap: 24px; }
.nav-cta { margin-left: auto; /* pushes to right */ }`,
                        why: 'flex + space-between separates logo from links. align-items: center vertically centers everything regardless of different heights.',
                      },
                      {
                        name: 'Card Grid',
                        code: `.cards { display: flex; flex-wrap: wrap; gap: 16px; }
.card { flex: 1 1 300px; /* minimum 300px, grows to fill */ }`,
                        why: 'flex-wrap: wrap + flex: 1 1 300px creates responsive cards that fill the row and wrap when they can\'t fit the minimum width.',
                      },
                      {
                        name: 'Vertically Centered Content',
                        code: `.hero { display: flex; justify-content: center; align-items: center; min-height: 100vh; }`,
                        why: 'The classic perfect-center solution. justify-content centers on main axis (horizontal in row direction), align-items on cross axis (vertical).',
                      },
                    ],
                  },
                  sort_order: 40,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: flex:1 — What Does It Actually Mean?',
                  subtitle: 'A question that reveals whether you understand the flex algorithm',
                  content_json: {
                    question: 'Explain what flex: 1 does. Why do flex: 1 and flex: 1 1 auto behave differently?',
                    answer: `flex is shorthand for: flex-grow flex-shrink flex-basis

flex: 1 = flex: 1 1 0%
- flex-grow: 1 (items grow to fill available space equally)
- flex-shrink: 1 (items shrink equally when space is tight)
- flex-basis: 0% (start size = zero, ignore content width)
Result: ALL items with flex:1 are exactly equal width

flex: 1 1 auto (NOT what flex:1 means)
- flex-basis: auto (start size = content width)
- flex-grow: 1 (grow proportionally from content size)
Result: items grow UNEQUALLY — wider content = wider final item

Example:
Item A has 50px of text, Item B has 200px of text
- With flex: 1 → both end up identical width
- With flex: 1 1 auto → B is wider than A (gets more of the extra space)

Common use case: flex:1 for equal columns. flex: 1 1 auto for sidebar (fixed content) + main (fills remaining space).`,
                    follow_up: 'What is flex: 0 0 auto? — No grow (0), no shrink (0), size = content. An item that stays its natural size and never flexes.',
                  },
                  sort_order: 50,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Flexbox: Core Principles',
                  subtitle: 'The mental models that make flex predictable',
                  content_json: {
                    bullets: [
                      'Flex is one-dimensional: row OR column (not both — that\'s Grid)',
                      'Container properties control distribution; item properties control individual behavior',
                      'justify-content = main axis alignment; align-items = cross axis alignment',
                      'flex: 1 = equal-width items; flex: 0 0 auto = fixed-size item',
                      'flex-basis: 0% (flex:1) means equal size; flex-basis:auto means start from content',
                      'gap replaces margin hacks for spacing between items',
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
              title: 'justify-content vs align-items',
              question_text: 'A flex container has flex-direction: row (default). You want items to be centered horizontally AND vertically. Which CSS is correct?',
              options_json: {
                options: [
                  { id: 'a', text: 'justify-content: center; align-items: center;' },
                  { id: 'b', text: 'align-content: center; justify-items: center;' },
                  { id: 'c', text: 'align-self: center; justify-self: center;' },
                  { id: 'd', text: 'text-align: center; vertical-align: middle;' },
                ],
              },
              correct_answer: 'a',
              expected_reasoning: 'justify-content controls main axis (horizontal in row direction). align-items controls cross axis (vertical in row direction). Both center = both axes centered.',
              explanation: 'In a flex row: main axis = horizontal → justify-content controls horizontal alignment. Cross axis = vertical → align-items controls vertical alignment. justify-content: center + align-items: center = perfect centering in both directions. Remember: justify = main axis, align = cross axis.',
              complexity_score: 1,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Debug: Flex Items Not Equal Width',
              question_text: 'Three flex items should be equal width but they\'re different widths based on content. Identify the CSS bug.',
              scenario_context: `<div class="toolbar">
  <button>Home</button>
  <button>Documentation</button>
  <button>Support Contact</button>
</div>

<style>
.toolbar {
  display: flex;
  gap: 8px;
}
.toolbar button {
  flex: 1;
}
</style>
/* Buttons are different widths — Home is smallest, Support Contact is largest */`,
              correct_answer: 'flex:1 shorthand defaults to flex: 1 1 0 in some browsers (treating 0 as 0px not 0%), or the buttons have default min-content size preventing equal distribution. Use flex: 1 1 0% explicitly or add min-width: 0 to allow shrinking below content size.',
              expected_reasoning: 'flex:1 should mean equal width (flex-basis:0%), but button elements have implicit min-width:min-content that prevents shrinking below content size.',
              explanation: 'Two possible issues: (1) Browser interprets flex:1 as flex:1 1 0 (px) not flex:1 1 0% — fix with explicit flex: 1 1 0%. (2) <button> elements have min-width:min-content by default — they won\'t shrink below their content width. Fix: add min-width: 0 to .toolbar button. Combined fix: .toolbar button { flex: 1 1 0%; min-width: 0; overflow: hidden; text-overflow: ellipsis; }',
              complexity_score: 3,
              estimated_time: 150,
            },
          ],
        },
        {
          title: 'CSS Grid: Two-Dimensional Layout',
          slug: 'css-grid-layout',
          description: 'CSS Grid is the first native CSS layout system designed for two dimensions simultaneously. Understand the grid model and when to choose Grid over Flexbox.',
          sort_order: 20,
          lessons: [
            {
              title: 'CSS Grid: The Layout System CSS Always Needed',
              slug: 'css-grid-layout-system',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why CSS Grid Was Created',
                  subtitle: 'Flexbox does one dimension well — Grid does two',
                  content_json: {
                    flexbox_limitation: 'Flexbox is excellent for one-dimensional layouts (a row of buttons, a column of list items). But when you need to control both rows AND columns simultaneously — like a magazine layout or a dashboard grid — Flexbox requires nested wrappers and becomes complex.',
                    what_grid_enables: [
                      'Lay items in two dimensions simultaneously (row and column)',
                      'Define the grid structure on the CONTAINER, not the items',
                      'Items can span multiple rows and columns',
                      'Overlap items using the same grid areas',
                      'Named areas make complex layouts readable: "header header" / "sidebar main"',
                    ],
                    real_example: 'A dashboard with a header, sidebar, main content, and footer — previously required 3 nested flex containers. With Grid: one container, named areas, done in 5 lines.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 3,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'CSS Grid Core Concepts',
                  subtitle: 'Tracks, cells, areas, lines — the vocabulary of the grid',
                  content_json: {
                    vocabulary: [
                      { term: 'Track', definition: 'A single row or column in the grid' },
                      { term: 'Cell', definition: 'The intersection of a row track and column track' },
                      { term: 'Area', definition: 'A named rectangular region spanning one or more cells' },
                      { term: 'Line', definition: 'The dividing lines between tracks, numbered from 1. Lines 1 to n+1 for n tracks.' },
                      { term: 'fr unit', definition: 'Fractional unit — represents a fraction of available space after fixed sizes are subtracted. 1fr 1fr = equal halves. 2fr 1fr = 2:1 ratio.' },
                    ],
                    key_properties: [
                      { property: 'grid-template-columns', example: 'repeat(3, 1fr) — 3 equal columns', effect: 'Defines column track sizes' },
                      { property: 'grid-template-rows', example: '80px 1fr 60px — fixed header, flexible main, fixed footer', effect: 'Defines row track sizes' },
                      { property: 'grid-template-areas', example: '"header header" "sidebar main" "footer footer"', effect: 'Named layout regions — items reference these by name' },
                      { property: 'gap', example: 'gap: 16px', effect: 'Space between rows and columns' },
                      { property: 'grid-column / grid-row', example: 'grid-column: 1 / 3 — spans columns 1 to 3', effect: 'Position item using line numbers' },
                      { property: 'grid-area', example: 'grid-area: header — places item in named area', effect: 'Place item in a named template area' },
                    ],
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'Building a Dashboard Layout with Grid',
                  subtitle: 'A complex layout in 10 lines of CSS',
                  content_json: {
                    example: {
                      html: `<div class="dashboard">
  <header class="header">Header</header>
  <nav class="sidebar">Sidebar</nav>
  <main class="main">Main Content</main>
  <footer class="footer">Footer</footer>
</div>`,
                      css: `.dashboard {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr 50px;
  min-height: 100vh;
  gap: 0;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }`,
                      what_this_achieves: 'Fixed-width sidebar, flexible main content, fixed header and footer. The entire layout structure is declared once on the container — no nested wrappers, no float hacks.',
                    },
                    responsive_trick: 'Make responsive by changing the template in a media query: @media (max-width: 768px) { .dashboard { grid-template-columns: 1fr; grid-template-areas: "header" "main" "footer"; } .sidebar { display: none; } }',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: Flexbox vs Grid — When to Use Which?',
                  subtitle: 'The answer every frontend developer should have ready',
                  content_json: {
                    question: 'When should you use CSS Grid vs Flexbox? Is one better than the other?',
                    answer: `Neither is "better" — they solve different problems:

FLEXBOX: One-dimensional, content-driven
- Use when layout should be driven by content size
- Use for: navbars, button groups, form rows, centering one item
- Items don't need to align with items in OTHER rows
- The number of items is dynamic (flex wraps automatically)

CSS GRID: Two-dimensional, layout-driven
- Use when you need explicit row AND column control simultaneously
- Use for: page layout, dashboard, card grids where rows must align, magazine layouts
- You define the grid THEN place items into it
- Items in different rows need to align with each other

Real rule of thumb:
"Is this a list of things in one direction?" → Flexbox
"Is this a 2D layout where rows and columns both matter?" → Grid

Common pattern: use Grid for page-level layout, Flexbox for component-level layout within each grid area.`,
                    follow_up: 'Can you nest Grid and Flexbox? Yes — and you should. A Grid area might contain a Flexbox navigation. A Flexbox item might be a Grid container.',
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'CSS Grid: Core Principles',
                  subtitle: 'What to remember about the 2D layout system',
                  content_json: {
                    bullets: [
                      'Grid is 2D: defines rows AND columns simultaneously on the container',
                      'fr units distribute remaining space after fixed sizes: 1fr 1fr = equal halves',
                      'Named areas make complex layouts self-documenting',
                      'grid-column: 1 / 3 spans from line 1 to line 3 (two columns)',
                      'auto-placement fills empty cells automatically',
                      'Grid for layout structure; Flexbox for component internals — use both',
                    ],
                  },
                  sort_order: 50,
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
              title: 'CSS Grid fr Unit',
              question_text: 'A grid has grid-template-columns: 1fr 2fr 1fr. The container is 800px wide with no gaps. What is the width of the middle column?',
              options_json: {
                options: [
                  { id: 'a', text: '200px — 800px / 4 columns' },
                  { id: 'b', text: '400px — 2fr out of 4fr total = 50% of 800px' },
                  { id: 'c', text: '266px — 800px / 3 columns' },
                  { id: 'd', text: '200px — each fr is worth 200px' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'Total fr = 1+2+1 = 4. Middle column = 2fr / 4fr = 50% of 800px = 400px.',
              explanation: 'fr units are fractions of the TOTAL fractional space. Total fractions = 1+2+1 = 4. Each fr = 800/4 = 200px. Middle column = 2fr = 2×200 = 400px. Side columns = 1fr = 200px each. Total = 200 + 400 + 200 = 800px ✓',
              complexity_score: 1,
              estimated_time: 60,
            },
            {
              question_type: 'SCENARIO_ANALYSIS',
              thinking_type: 'ARCHITECTURE',
              difficulty_level: 'INTERMEDIATE',
              title: 'Choose the Right Layout System',
              question_text: 'You are building a product card component that contains: (1) a product image, (2) a title, (3) a price, (4) an "Add to Cart" button. The image is on the left, all text/button stacked on the right. What layout system would you use and why?',
              options_json: {
                options: [
                  { id: 'a', text: 'CSS Grid — two-dimensional layout for image and content columns' },
                  { id: 'b', text: 'Flexbox on the card (row), with a nested flex column for the text content' },
                  { id: 'c', text: 'CSS Grid for the outer layout, Flexbox for the right column stack' },
                  { id: 'd', text: 'All Flexbox — it handles both horizontal and vertical layout' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'The card is one-dimensional (row: image left, content right). The content stack is one-dimensional (column: title, price, button). Two nested Flexbox containers.',
              explanation: 'Both Flexbox options (b, d) are correct, but b is more semantically precise. The card layout is: display:flex (row) — one flex item is the image, one is the content column. The content column is: display:flex; flex-direction:column — stacks title, price, button vertically. CSS Grid would work too but is overkill for a simple two-column card. Grid shines when you need row/column alignment ACROSS multiple cards simultaneously.',
              complexity_score: 2,
              estimated_time: 90,
            },
          ],
        },
      ],
    },
  ],
};
