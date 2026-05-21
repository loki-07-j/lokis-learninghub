import { CourseData } from './types';

export const javascriptCourse: CourseData = {
  title: 'JavaScript: The Deep Thinking Guide',
  slug: 'javascript-deep-dive',
  description: 'JavaScript is full of behaviour that surprises developers who only learned the syntax. This course explains why JavaScript works the way it does — the event loop, closures, prototypes, and async patterns — with the depth needed for senior-level interviews.',
  modules: [
    {
      title: 'Module 1: How JavaScript Actually Runs',
      slug: 'javascript-execution-model',
      description: 'The execution model, event loop, and scope system that make JavaScript behaviour predictable once you see inside the engine.',
      sort_order: 10,
      topics: [
        {
          title: 'The JavaScript Event Loop',
          slug: 'javascript-event-loop',
          description: 'JavaScript is single-threaded but handles thousands of concurrent operations. The event loop is why — and understanding it prevents a class of bugs.',
          sort_order: 10,
          lessons: [
            {
              title: 'Single Thread, Non-Blocking: The Event Loop',
              slug: 'single-thread-non-blocking-event-loop',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why JavaScript Is Single-Threaded',
                  subtitle: 'The design decision that shaped an entire ecosystem',
                  content_json: {
                    history: 'JavaScript was created in 10 days in 1995 by Brendan Eich for Netscape Navigator. It was designed for simple DOM interactions — showing/hiding elements, form validation. The threading model chosen was single-threaded.',
                    the_reason: 'Multithreaded DOM manipulation would create race conditions: Thread A sets element color to red, Thread B sets it to blue simultaneously — which wins? What if both are deleting the same node? The DOM is not thread-safe.',
                    the_insight: 'Instead of threads, JavaScript uses an EVENT LOOP — a mechanism that allows one thread to handle many concurrent operations by never blocking the thread waiting for I/O. This model turned out to be ideal for network-heavy browser interactions.',
                    consequence: 'This means: JS can never truly run in parallel (in one context). But it CAN initiate many async operations and handle their results when complete. Understanding this distinction is the key to writing efficient JavaScript.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'The Event Loop Architecture: 4 Components',
                  subtitle: 'Call stack, Web APIs, Microtask queue, Macrotask queue',
                  content_json: {
                    components: [
                      {
                        name: 'Call Stack',
                        description: 'A LIFO stack of execution contexts. When you call a function, it\'s pushed onto the stack. When it returns, it\'s popped. The engine is executing code when the stack is non-empty.',
                      },
                      {
                        name: 'Web APIs (Browser / Node.js APIs)',
                        description: 'setTimeout, fetch, addEventListener — these are NOT part of JavaScript. They\'re provided by the browser/Node environment. When you call setTimeout, JS hands the work to the browser API and continues. The browser handles the timer in a separate thread.',
                      },
                      {
                        name: 'Microtask Queue (Priority Queue)',
                        description: 'Promise .then/.catch/.finally callbacks and queueMicrotask(). CRITICAL: the event loop drains the ENTIRE microtask queue before moving to the next macrotask. Microtasks are high priority.',
                      },
                      {
                        name: 'Macrotask Queue (Task Queue)',
                        description: 'setTimeout, setInterval, I/O callbacks, UI rendering events. These are processed ONE PER EVENT LOOP ITERATION, with microtask queue drain between each.',
                      },
                    ],
                    event_loop_algorithm: [
                      '1. Execute all synchronous code (runs to completion)',
                      '2. Drain microtask queue completely (process ALL pending microtasks)',
                      '3. Render (browser may update the DOM)',
                      '4. Pick ONE macrotask from the queue, execute it',
                      '5. Return to step 2 (drain microtasks again)',
                    ],
                  },
                  sort_order: 20,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'Output Prediction: Reading the Event Loop',
                  subtitle: 'Walk through execution order with synchronous, microtasks, and macrotasks',
                  content_json: {
                    example: `console.log('1');               // sync

setTimeout(() => {
  console.log('2');             // macrotask
}, 0);

Promise.resolve().then(() => {
  console.log('3');             // microtask
});

console.log('4');               // sync`,
                    execution_trace: [
                      'Sync: console.log(\'1\') → prints 1',
                      'setTimeout callback pushed to macrotask queue (even though delay=0)',
                      'Promise.then callback pushed to microtask queue',
                      'Sync: console.log(\'4\') → prints 4',
                      'Call stack empty → drain microtask queue → prints 3',
                      'Next event loop iteration → pick macrotask → prints 2',
                    ],
                    output: '1, 4, 3, 2',
                    key_insight: 'setTimeout 0 does NOT mean "run next". It means "run after current synchronous code AND after all pending microtasks". Promises (microtasks) always run before setTimeout (macrotask).',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'Blocking the Event Loop: The Production Bug',
                  subtitle: 'Why CPU-intensive code freezes the UI and how to fix it',
                  content_json: {
                    scenario: 'A user clicks "Process File" on a web app. The app parses a 50MB JSON file synchronously. The entire page freezes for 3 seconds — no scrolling, no button responses, no animations.',
                    why_it_happens: 'JSON.parse on a large file is synchronous — it runs on the call stack until complete. The event loop cannot process ANY other events (mouse clicks, keystrokes, render frames) while the stack is occupied.',
                    bad_code: `// Blocks the event loop for seconds
button.onclick = () => {
  const data = JSON.parse(largeJsonString); // synchronous CPU work
  renderTable(data); // also synchronous
};`,
                    solutions: [
                      {
                        solution: 'Web Workers',
                        code: `const worker = new Worker('parser.js');
worker.postMessage(largeJsonString);
worker.onmessage = (e) => renderTable(e.data);
// Main thread is free while worker parses`,
                        when: 'CPU-intensive work — Web Workers run in a separate thread',
                      },
                      {
                        solution: 'Chunked processing',
                        code: `async function processChunks(items) {
  for (let i = 0; i < items.length; i += 1000) {
    const chunk = items.slice(i, i + 1000);
    processChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 0)); // yield to event loop
  }
}`,
                        when: 'Cannot use workers — break work into chunks and yield between chunks',
                      },
                    ],
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Common Event Loop Mistakes',
                  subtitle: 'Patterns that silently cause bugs or performance issues',
                  content_json: {
                    mistakes: [
                      {
                        mistake: 'Assuming setTimeout(fn, 0) runs "immediately next"',
                        code: `setTimeout(() => console.log('A'), 0);
Promise.resolve().then(() => console.log('B'));
// Output: B then A — microtask runs first!`,
                        fix: 'Use queueMicrotask() or Promise.resolve().then() when you need execution before the next macrotask.',
                      },
                      {
                        mistake: 'Infinite microtask recursion',
                        code: `// This will lock the browser!
function recursive() {
  Promise.resolve().then(recursive);
}
recursive();
// Microtask queue is never empty → render loop starved`,
                        fix: 'Use setTimeout for recurring work that should allow rendering between iterations.',
                      },
                      {
                        mistake: 'Not awaiting async functions in event handlers',
                        code: `// No await — errors silently swallowed
button.onclick = async () => {
  await saveData(); // if this throws, nothing handles it
};

// Fixed: handle the promise
button.onclick = () => {
  saveData().catch(err => showError(err));
};`,
                        fix: 'Always attach .catch() or wrap in try/catch when async operations might fail.',
                      },
                    ],
                  },
                  sort_order: 50,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: Explain the Event Loop',
                  subtitle: 'The answer that differentiates senior from junior candidates',
                  content_json: {
                    question: 'JavaScript is single-threaded. How can it handle thousands of concurrent network requests without blocking?',
                    answer: `JavaScript handles concurrency through the event loop + non-blocking I/O:

1. When you call fetch(), JavaScript registers the request with the browser/Node API and immediately continues to the next line. JS does NOT wait.

2. The browser/OS handles the actual TCP connection and HTTP request in its own threads (C++ code, not JS).

3. When the response arrives, the browser queues a callback in the microtask queue (for Promises) or macrotask queue (for older APIs).

4. The event loop picks up this callback when the call stack is empty and executes it.

So JavaScript is single-threaded but the ENVIRONMENT (browser, Node) handles I/O concurrently. JS orchestrates; the environment executes.

This is why Node.js can handle 10,000 concurrent HTTP requests with one thread — each request is just a few callbacks, not a blocked thread waiting for a database response.`,
                    follow_up: 'What\'s the difference between concurrency and parallelism? — Concurrency: multiple tasks in progress at the same time (but not necessarily simultaneously). Parallelism: multiple tasks literally executing simultaneously (multiple CPU cores). JavaScript is concurrent but not parallel in a single thread.',
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Event Loop: Key Mental Models',
                  subtitle: 'The understanding that prevents an entire class of JavaScript bugs',
                  content_json: {
                    bullets: [
                      'JavaScript is single-threaded: one call stack, one set of code running at any time',
                      'Call stack → Microtask queue (ALL) → Render → Macrotask (ONE) → repeat',
                      'Promise.then/catch callbacks are microtasks — run before setTimeout',
                      'setTimeout 0 does not mean "immediately" — macrotasks run after microtasks',
                      'Synchronous blocking code freezes the UI — use Workers or chunking for heavy work',
                      'Web APIs (fetch, setTimeout) run outside JS thread — they\'re the source of async',
                    ],
                  },
                  sort_order: 70,
                  difficulty_level: 'INTERMEDIATE',
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
              difficulty_level: 'INTERMEDIATE',
              title: 'Event Loop Output Prediction',
              question_text: 'What is the output order of this code?\n\nconsole.log("start");\nsetTimeout(() => console.log("timeout"), 0);\nPromise.resolve().then(() => console.log("promise"));\nconsole.log("end");',
              options_json: {
                hint: 'Track: sync code runs first, then microtasks, then macrotasks',
              },
              correct_answer: 'start, end, promise, timeout',
              expected_reasoning: 'Sync: start, end. Microtask queue: promise. Macrotask queue: timeout. Microtasks drain before macrotasks execute.',
              explanation: 'Execution order: (1) "start" — synchronous. (2) setTimeout queued in macrotask queue. (3) Promise.resolve().then queued in microtask queue. (4) "end" — synchronous. (5) Call stack empty → drain microtask queue → "promise". (6) Next event loop iteration → pick macrotask → "timeout". Output: start, end, promise, timeout.',
              complexity_score: 3,
              estimated_time: 90,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'ADVANCED',
              title: 'Debug: Event Loop Starvation',
              question_text: 'A React app\'s UI stops updating. Users report the page is "frozen" for 5 seconds after clicking "Analyze". Find and fix the bug.',
              scenario_context: `function analyzeData(dataset) {
  // dataset has 1,000,000 numbers
  let result = 0;
  for (let i = 0; i < dataset.length; i++) {
    result += Math.sqrt(dataset[i]) * Math.log(dataset[i] + 1);
  }
  return result;
}

// In React component:
function AnalyzeButton({ dataset }) {
  const [result, setResult] = useState(null);

  const handleClick = () => {
    const res = analyzeData(dataset); // This runs synchronously
    setResult(res);
  };

  return <button onClick={handleClick}>Analyze ({dataset.length} items)</button>;
}`,
              correct_answer: 'analyzeData runs a synchronous CPU-intensive loop of 1M iterations, blocking the JS call stack for ~5 seconds. Fix: move to Web Worker, or process in async chunks using setTimeout to yield between batches.',
              expected_reasoning: 'The for loop over 1M items never yields the event loop. React cannot re-render, user cannot interact, animations stop.',
              explanation: `Fix with Web Worker:
// worker.js
self.onmessage = (e) => {
  const result = e.data.reduce((acc, v) => acc + Math.sqrt(v) * Math.log(v+1), 0);
  self.postMessage(result);
};

// Component
const worker = new Worker('/worker.js');
const handleClick = () => {
  setLoading(true);
  worker.postMessage(dataset);
  worker.onmessage = (e) => { setResult(e.data); setLoading(false); };
};

The worker runs on a separate OS thread — the main thread and UI remain responsive during computation.`,
              complexity_score: 4,
              estimated_time: 240,
            },
            {
              question_type: 'MCQ',
              thinking_type: 'INTERVIEW',
              difficulty_level: 'INTERMEDIATE',
              title: 'Microtask vs Macrotask Priority',
              question_text: 'You use setInterval() to update a counter display every 100ms. You also have a loop that queues 10,000 microtasks. What happens to the counter updates?',
              options_json: {
                options: [
                  { id: 'a', text: 'Counter updates on schedule — setInterval is higher priority than microtasks' },
                  { id: 'b', text: 'Counter updates are delayed until all 10,000 microtasks complete — microtasks drain completely before any macrotask' },
                  { id: 'c', text: 'Both run in parallel since the browser can handle both queues simultaneously' },
                  { id: 'd', text: 'The browser intelligently interleaves setInterval and microtasks' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'The event loop drains the ENTIRE microtask queue before processing ANY macrotask (including setInterval callbacks).',
              explanation: 'Microtasks have strict priority over macrotasks. The event loop algorithm: run sync → drain ALL microtasks → render → run ONE macrotask → drain ALL microtasks again. If 10,000 microtasks are queued, setInterval callbacks (macrotasks) wait until ALL microtasks complete. This is why infinite microtask loops (recursive Promise.resolve().then()) completely starve macrotasks and freeze the UI.',
              complexity_score: 3,
              estimated_time: 90,
            },
          ],
        },
        {
          title: 'Closures & Lexical Scope',
          slug: 'closures-lexical-scope',
          description: 'Closures are how JavaScript implements private state. Understanding lexical scope is the key to React hooks, module patterns, and the classic loop bug.',
          sort_order: 20,
          lessons: [
            {
              title: 'Closures: Functions That Remember',
              slug: 'closures-functions-that-remember',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Closures Exist',
                  subtitle: 'Private state without classes — JavaScript\'s fundamental power',
                  content_json: {
                    problem: 'In many languages, private state requires classes or explicit access modifiers. JavaScript has neither (in the classical sense). Closures provide private state through scope.',
                    definition: 'A closure is a function that has access to its outer function\'s variables AFTER the outer function has returned. The inner function "closes over" the variables in its lexical scope.',
                    why_important: 'Closures power: module patterns, memoization, partial application, React hooks (useState, useEffect), event handlers with state, factory functions, and callback-based APIs.',
                    simple_example: `function createCounter() {
  let count = 0; // private to createCounter
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}
const c = createCounter();
c.increment(); c.increment();
console.log(c.value()); // 2
// count is not accessible from outside — it's a closure variable`,
                  },
                  sort_order: 10,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Lexical Scope: Variables Are Resolved at Definition Time',
                  subtitle: 'Where a function is DEFINED determines what variables it can access',
                  content_json: {
                    lexical_scope: 'JavaScript uses LEXICAL (static) scope — a function\'s scope is determined by WHERE it is written in the source code, not where it is called from.',
                    scope_chain: 'When a variable is accessed, JS looks up the scope chain: current function scope → outer function scope → ... → global scope. A closure captures a REFERENCE to the outer scope, not a copy of variable values.',
                    reference_vs_copy: `let x = 1;
const fn = () => console.log(x); // captures REFERENCE to x

x = 2;
fn(); // prints 2 — not 1! It reads the current value of x at call time`,
                    scope_types: [
                      { type: 'Global scope', description: 'Variables declared outside all functions. Available everywhere.' },
                      { type: 'Function scope', description: 'Variables declared with var, let, const inside a function. Only available within that function.' },
                      { type: 'Block scope', description: 'Variables declared with let/const inside {}, if, for, etc. Only available within that block.' },
                    ],
                  },
                  sort_order: 20,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'Variable Environments & The Closure Mechanism',
                  subtitle: 'What the JS engine actually stores when a closure is created',
                  content_json: {
                    variable_environment: 'Every function call creates a new Execution Context with a Variable Environment — a record of all variables in that scope. Normally, when a function returns, its execution context is garbage collected.',
                    closure_exception: 'When an inner function references variables from the outer function\'s scope, the outer function\'s Variable Environment is kept alive in memory — it cannot be garbage collected because the inner function still holds a reference to it.',
                    memory_implication: 'Closures can cause memory leaks if: a closure captures a large object, the closure is stored in a long-lived data structure, and the original reference to the outer scope is never released.',
                    practical_example: `function makeAdder(x) {
  // Execution context for makeAdder created
  // Variable environment: { x: 5 }

  return function add(y) {
    return x + y; // References x from outer VE
  };
  // makeAdder returns — but its VE is KEPT because add() references x
}

const add5 = makeAdder(5);
// The VE with x=5 stays in memory, referenced by add5
console.log(add5(3)); // 8
console.log(add5(10)); // 15`,
                  },
                  sort_order: 30,
                  difficulty_level: 'ADVANCED',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'The Classic Loop Closure Bug',
                  subtitle: 'The most famous JavaScript gotcha — and why it\'s a scope problem',
                  content_json: {
                    problem_code: `// Intended: click button 0 alerts "0", button 1 alerts "1", etc.
for (var i = 0; i < 3; i++) {
  buttons[i].onclick = function() {
    alert(i); // ALWAYS alerts 3!
  };
}`,
                    why_it_happens: 'var is function-scoped, not block-scoped. There is ONE i variable shared by ALL three closures. When any button is clicked, the loop has finished — i is 3. All three closures reference the SAME variable, which is now 3.',
                    fixes: [
                      {
                        method: 'Use let instead of var',
                        code: `for (let i = 0; i < 3; i++) {
  buttons[i].onclick = () => alert(i);
}
// let creates a new i for each iteration — each closure captures its own i`,
                      },
                      {
                        method: 'IIFE to create a new scope',
                        code: `for (var i = 0; i < 3; i++) {
  ((capturedI) => {
    buttons[capturedI].onclick = () => alert(capturedI);
  })(i);
}
// Each IIFE call creates a new scope with capturedI = current i value`,
                      },
                    ],
                    key_lesson: 'The bug is not about "closures" — it\'s about var being function-scoped. The fix (let) creates a new binding per iteration. This bug is so famous it\'s in virtually every JS interview.',
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'Closures in React: useState Explained',
                  subtitle: 'Why React hooks are just closures',
                  content_json: {
                    connection: 'React\'s useState hook is built on closures. Every render call creates a new closure that captures the current state values.',
                    stale_closure_problem: `function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // BUG: count is always 0 (stale closure)
    }, 1000);
    return () => clearInterval(id);
  }, []); // empty deps = created once with count=0

  return <div>{count}</div>;
}`,
                    explanation: 'The interval callback closes over count=0 (from the first render). It never sees updated count values because the effect only runs once. After 5 seconds: count is 1, not 5.',
                    fix: `useEffect(() => {
  const id = setInterval(() => {
    setCount(prev => prev + 1); // use updater function — reads current state
  }, 1000);
  return () => clearInterval(id);
}, []);
// Updater function (prev => prev+1) always receives the CURRENT state value`,
                    lesson: 'Stale closures in React happen when a useEffect/useCallback captures a value that later changes. Solutions: (1) Include it in dependencies array, (2) Use functional updates for setState, (3) Use useRef to always have current value.',
                  },
                  sort_order: 50,
                  difficulty_level: 'ADVANCED',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: Classic Closure Questions',
                  subtitle: 'The 3 closure questions that appear in every JS interview',
                  content_json: {
                    questions: [
                      {
                        q: 'What is a closure?',
                        a: 'A function that retains access to its lexical scope (outer variable environment) even after the outer function has returned. The inner function "closes over" the outer variables.',
                      },
                      {
                        q: 'What will this print? for(var i=0;i<3;i++) setTimeout(()=>console.log(i), 0)',
                        a: '3, 3, 3 — one var i shared by all three closures, loop finishes before any setTimeout fires.',
                      },
                      {
                        q: 'How would you implement a private counter with closures?',
                        a: 'IIFE returning an object with increment/decrement/get methods that close over a private count variable: const counter = (() => { let n=0; return { inc:()=>++n, get:()=>n } })()',
                      },
                    ],
                    deeper_question: 'What is a "stale closure" and how do you fix it in React? — A stale closure captures an outdated value from a previous render. Fix: include the value in useEffect dependencies, or use a ref to always read the current value.',
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Closures & Scope: Core Principles',
                  subtitle: 'The mental models for all closure-related code',
                  content_json: {
                    bullets: [
                      'A closure = inner function + reference to its outer lexical scope',
                      'Closures capture REFERENCES, not values — changes to outer vars are visible',
                      'var is function-scoped; let/const are block-scoped — this determines closure capture',
                      'The loop var bug: one shared var = all closures see the final value',
                      'React stale closures: effects/callbacks that capture initial values, not updates',
                      'Closures enable private state, memoization, partial application, module patterns',
                    ],
                  },
                  sort_order: 70,
                  difficulty_level: 'INTERMEDIATE',
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
              difficulty_level: 'INTERMEDIATE',
              title: 'Closure Value Capture',
              question_text: 'What does this code output?\n\nlet x = 10;\nconst fn = () => x * 2;\nx = 20;\nconsole.log(fn());',
              options_json: {
                hint: 'Closures capture REFERENCES, not values. What is x when fn() is called?',
              },
              correct_answer: '40',
              expected_reasoning: 'fn captures a reference to x, not the value 10. When fn() is called, x has been reassigned to 20. So fn() returns 20*2 = 40.',
              explanation: 'Closures in JavaScript capture REFERENCES to variables, not their values at the time the closure is created. fn closes over x — a reference. When fn() executes, it reads the CURRENT value of x which is 20. Result: 40. If closures captured values, the result would be 20. This reference behavior is important for understanding React\'s stale closure issue.',
              complexity_score: 2,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Fix the Loop Closure Bug',
              question_text: 'This code should log 0, 1, 2 after 1 second each, but logs 3, 3, 3 instead. Fix it without using let.',
              scenario_context: `for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // always logs 3
  }, i * 1000);
}`,
              correct_answer: 'Wrap in IIFE to capture each i: for(var i=0;i<3;i++){(function(j){setTimeout(()=>console.log(j),j*1000)})(i)}',
              expected_reasoning: 'var is function-scoped — one i shared by all closures. IIFE creates a new scope per iteration, capturing the current value as a parameter.',
              explanation: `Fix without let — use IIFE (Immediately Invoked Function Expression):
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j); // j is a new variable per iteration
    }, j * 1000);
  })(i); // pass current i as argument
}

Why: IIFE creates a new function scope per iteration. Parameter j = current i value. Each setTimeout closure captures its own j. Modern fix: use let (block-scoped per iteration). IIFE was the pre-ES6 solution.`,
              complexity_score: 3,
              estimated_time: 150,
            },
            {
              question_type: 'MCQ',
              thinking_type: 'INTERVIEW',
              difficulty_level: 'ADVANCED',
              title: 'React Stale Closure',
              question_text: 'In a React component, count is 0. A setTimeout callback captures count (no cleanup). Five seconds later, when the timeout fires, the user has clicked to increment count to 5. What does the timeout callback see for count?',
              options_json: {
                options: [
                  { id: 'a', text: '5 — the closure automatically sees the latest React state' },
                  { id: 'b', text: '0 — the closure captured count=0 when the effect first ran' },
                  { id: 'c', text: 'undefined — closures cannot access state across renders' },
                  { id: 'd', text: 'Depends on whether useState uses a ref internally' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'The closure was created in the first render when count=0. It captured a reference to that render\'s count variable. Subsequent renders create new count variables; the old closure still holds its original reference.',
              explanation: 'Each render call creates a new function scope with new variable bindings. The setTimeout callback captures count from the render in which it was created (count=0). Later renders create new count=1, count=2 etc., but those are different variables. The original closure still holds its snapshot of count=0. Fix: use a ref (useRef) which is a mutable object shared across renders, or add count to the effect\'s dependency array and clear/reset the timeout.',
              complexity_score: 4,
              estimated_time: 120,
            },
          ],
        },
      ],
    },
    {
      title: 'Module 2: Async JavaScript',
      slug: 'async-javascript',
      description: 'Promises, async/await, and error handling patterns — the modern async toolkit explained from first principles.',
      sort_order: 20,
      topics: [
        {
          title: 'Promises & Async/Await',
          slug: 'promises-async-await',
          description: 'The evolution from callbacks to Promises to async/await — and the common mistakes at each level.',
          sort_order: 10,
          lessons: [
            {
              title: 'From Callback Hell to Clean Async Code',
              slug: 'callback-hell-to-async-await',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Promises Were Created',
                  subtitle: 'The callback pyramid that broke JavaScript at scale',
                  content_json: {
                    callback_problem: `// Classic "callback hell" / "pyramid of doom"
getUser(userId, function(err, user) {
  if (err) { return handleError(err); }
  getOrders(user.id, function(err, orders) {
    if (err) { return handleError(err); }
    getInvoice(orders[0].id, function(err, invoice) {
      if (err) { return handleError(err); }
      sendEmail(invoice, function(err) {
        if (err) { return handleError(err); }
        // 4 levels deep, and getting worse
      });
    });
  });
});`,
                    problems_with_callbacks: [
                      'Inversion of control: you pass YOUR function to THEIR code. No guarantee about when/how often it\'s called.',
                      'Error handling at every level — no centralized catch',
                      'Cannot compose operations cleanly',
                      'No way to wait for multiple operations and combine results',
                    ],
                    promise_solution: 'A Promise is an object representing the eventual result of an async operation. It has three states: pending, fulfilled, rejected. You can chain .then() for success and .catch() for errors.',
                  },
                  sort_order: 10,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Promises: States, Chaining, and Composition',
                  subtitle: 'The Promise API and how chaining works',
                  content_json: {
                    promise_states: [
                      { state: 'Pending', meaning: 'Initial state. Operation not yet complete.' },
                      { state: 'Fulfilled', meaning: 'Operation completed successfully. resolve() was called.' },
                      { state: 'Rejected', meaning: 'Operation failed. reject() was called or an error was thrown.' },
                    ],
                    chaining: `getUser(userId)          // Returns Promise<User>
  .then(user => getOrders(user.id))  // Returns Promise<Orders>
  .then(orders => getInvoice(orders[0].id))  // Returns Promise<Invoice>
  .then(invoice => sendEmail(invoice))
  .catch(err => handleError(err));   // One catch handles ALL errors`,
                    key_rules: [
                      '.then() always returns a new Promise — enabling chaining',
                      'Return a value from .then() → next .then() receives it',
                      'Return a Promise from .then() → next .then() waits for it to settle',
                      'Throw an error in .then() → next .catch() handles it',
                      '.catch() is equivalent to .then(undefined, onRejected)',
                    ],
                    composition_methods: [
                      { method: 'Promise.all([...promises])', behavior: 'Waits for ALL to fulfill. Fails fast if any reject. Returns array of results.' },
                      { method: 'Promise.allSettled([...promises])', behavior: 'Waits for ALL to settle (fulfill or reject). Returns array of {status, value/reason} objects. Never rejects.' },
                      { method: 'Promise.race([...promises])', behavior: 'Resolves/rejects with the FIRST promise to settle.' },
                      { method: 'Promise.any([...promises])', behavior: 'Resolves with the FIRST fulfillment. Rejects only if ALL reject.' },
                    ],
                  },
                  sort_order: 20,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'async/await: Syntactic Sugar Over Promises',
                  subtitle: 'What the transpiler actually generates from async/await',
                  content_json: {
                    what_async_does: 'async functions always return a Promise. If you return a value, it\'s wrapped in Promise.resolve(value). If you throw, the returned Promise rejects.',
                    what_await_does: 'await pauses the ASYNC FUNCTION (not the event loop!) at that point and waits for the Promise to settle. The JS engine suspends the async function and processes other event loop tasks while waiting.',
                    under_the_hood: `// This async/await code:
async function fetchUser(id) {
  const user = await getUser(id);
  const orders = await getOrders(user.id);
  return orders;
}

// Is equivalent to this Promise chain:
function fetchUser(id) {
  return getUser(id)
    .then(user => getOrders(user.id))
    .then(orders => orders);
}`,
                    await_does_not_block: 'await inside an async function suspends that function but does NOT block the event loop. Other callbacks, DOM events, and async operations continue during the await.',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Common Async/Await Mistakes',
                  subtitle: 'Patterns that silently break correctness or performance',
                  content_json: {
                    mistakes: [
                      {
                        mistake: 'Sequential awaits when parallel is possible',
                        bad_code: `// Takes: time(users) + time(products) sequentially
const users = await getUsers();
const products = await getProducts();`,
                        good_code: `// Takes: max(time(users), time(products)) — parallel
const [users, products] = await Promise.all([getUsers(), getProducts()]);`,
                        impact: 'If each call takes 500ms: sequential = 1000ms. Parallel = 500ms.',
                      },
                      {
                        mistake: 'Missing error handling in async functions',
                        bad_code: `async function loadData() {
  const data = await fetch('/api/data'); // throws on network error
  setData(data); // never called if fetch throws
}
// calling code has no .catch() — unhandled rejection`,
                        good_code: `async function loadData() {
  try {
    const data = await fetch('/api/data');
    setData(data);
  } catch (err) {
    setError(err.message);
  }
}`,
                      },
                      {
                        mistake: 'Using await inside forEach',
                        bad_code: `// forEach does not await — all run concurrently with no tracking
ids.forEach(async (id) => {
  await processItem(id); // forEach ignores the returned Promise
});
// Code after this runs immediately, before any items complete`,
                        good_code: `// Use for...of for sequential processing
for (const id of ids) {
  await processItem(id); // truly sequential
}
// Or Promise.all for parallel
await Promise.all(ids.map(id => processItem(id)));`,
                      },
                    ],
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: Promises vs async/await',
                  subtitle: 'When to use each and what the differences are',
                  content_json: {
                    question: 'What is the difference between Promises and async/await? When would you use .then() chaining vs async/await?',
                    answer: `async/await is syntactic sugar over Promises — they compile to the same thing. Choosing between them:

Use async/await when:
- Sequential operations where each depends on the previous
- Complex error handling (try/catch reads more naturally than .catch)
- Loops with async work (for...of with await)
- Most readable in typical CRUD operations

Use Promise chaining when:
- Composing independent async operations
- Promise.all/allSettled/race — these naturally return promises
- Utility functions that return Promises (callers can chain or await)

Key differences to mention in interview:
- Both use microtask queue for callbacks
- async functions always return a Promise
- await can only be used inside async functions (top-level await is an exception)
- Error propagation: await + try/catch vs .catch() — functionally equivalent`,
                    follow_up: 'What happens if you forget await before an async function call? — You get the Promise object, not the resolved value. The code continues immediately without waiting. Common source of bugs.',
                  },
                  sort_order: 50,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Promises & Async/Await: Core Principles',
                  subtitle: 'The async patterns that every JavaScript developer needs',
                  content_json: {
                    bullets: [
                      'Promise states: pending → fulfilled or rejected. Settled = not pending.',
                      '.then() returns a new Promise — enabling chaining. Throw = reject, return = resolve.',
                      'async/await = syntactic sugar over Promises — same microtask behavior',
                      'await suspends the async function, not the event loop',
                      'Promise.all for parallel independent operations (fastest when no dependencies)',
                      'await in forEach does NOT work — use for...of or Promise.all(arr.map(...))',
                      'Always handle rejections — unhandled Promise rejections crash Node processes',
                    ],
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
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
              difficulty_level: 'INTERMEDIATE',
              title: 'Promise.all vs Sequential Await',
              question_text: 'Three API calls each take 300ms. How long do these two implementations take?\n\nImpl A: const [a,b,c] = await Promise.all([api1(), api2(), api3()]);\nImpl B: const a = await api1(); const b = await api2(); const c = await api3();',
              options_json: {
                options: [
                  { id: 'a', text: 'Both take 900ms — they all make the same network calls' },
                  { id: 'b', text: 'A: ~300ms, B: ~900ms — A runs all three in parallel, B runs sequentially' },
                  { id: 'c', text: 'A: ~300ms, B: ~300ms — JavaScript runs async calls in parallel by default' },
                  { id: 'd', text: 'A: ~900ms, B: ~300ms — Promise.all adds overhead from promise management' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'Promise.all starts all three concurrently and waits for the slowest. Sequential await starts each only after the previous completes.',
              explanation: 'Promise.all([api1(), api2(), api3()]) — all three API calls start SIMULTANEOUSLY. Since they\'re independent, they run in parallel. Total time ≈ max(300, 300, 300) = 300ms. Sequential await: api1 starts, takes 300ms, completes → api2 starts, 300ms → api3 starts, 300ms. Total ≈ 900ms. Rule: use Promise.all when operations are INDEPENDENT. Use sequential await when each operation depends on the previous result.',
              complexity_score: 2,
              estimated_time: 90,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Debug: forEach + async',
              question_text: 'This code should process all items, then log "Done". But "Done" appears before any items are processed. Find the bug.',
              scenario_context: `async function processAll(items) {
  items.forEach(async (item) => {
    await processItem(item); // async work
    console.log('Processed:', item.id);
  });

  console.log('Done!'); // This appears FIRST
}`,
              correct_answer: 'Array.forEach ignores the returned Promise from async callbacks. It starts all async operations but does not wait for them. Use for...of with await for sequential, or await Promise.all(items.map(async item => ...)) for parallel.',
              expected_reasoning: 'forEach runs each callback and ignores its return value. async function always returns a Promise. forEach ignores those Promises.',
              explanation: `forEach cannot await. Fix options:

Sequential (each item completes before next):
for (const item of items) {
  await processItem(item);
  console.log('Processed:', item.id);
}
console.log('Done!');

Parallel (all items at once, faster if independent):
await Promise.all(items.map(async (item) => {
  await processItem(item);
  console.log('Processed:', item.id);
}));
console.log('Done!');`,
              complexity_score: 3,
              estimated_time: 120,
            },
          ],
        },
      ],
    },
  ],
};
