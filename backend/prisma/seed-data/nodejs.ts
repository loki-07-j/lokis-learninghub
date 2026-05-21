import { CourseData } from './types';

export const nodejsCourse: CourseData = {
  title: 'Node.js: The Server-Side JavaScript Runtime',
  slug: 'nodejs-deep-dive',
  description: 'Node.js was created to solve the C10K problem. Understand its architecture, the event loop from the OS perspective, and why it excels at I/O-bound workloads while failing at CPU-bound ones.',
  modules: [
    {
      title: 'Module 1: Node.js Architecture',
      slug: 'nodejs-architecture',
      description: 'libuv, the event loop, and the thread pool — understanding what actually runs your JavaScript on a server.',
      sort_order: 10,
      topics: [
        {
          title: 'Non-Blocking I/O & the Node.js Event Loop',
          slug: 'nodejs-event-loop-io',
          description: 'Why Node.js can handle 10,000 concurrent connections with one thread, and when that model breaks down.',
          sort_order: 10,
          lessons: [
            {
              title: 'The C10K Problem and Why Node.js Exists',
              slug: 'c10k-problem-nodejs',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Node.js Was Created',
                  subtitle: 'The C10K problem and the death of the thread-per-request model',
                  content_json: {
                    the_c10k_problem: 'In 1999, Dan Kegel wrote "The C10K problem" — could a server handle 10,000 concurrent connections? Traditional web servers (Apache) used one thread per connection. At 10K connections: 10K threads × (2MB stack memory) = 20GB RAM just for stacks. Thread context switching at 10K adds enormous CPU overhead.',
                    traditional_model: 'Thread-per-request (Apache, Java pre-NIO): each HTTP request occupies a thread for its entire lifetime. 90% of that time the thread is WAITING for database responses, file reads, network — doing nothing except consuming memory.',
                    ryan_dahls_insight: 'Ryan Dahl observed in 2009: "What if, instead of blocking a thread while waiting for I/O, you gave the OS a callback and the thread did other work?" This is non-blocking I/O — the foundation of Node.js.',
                    node_result: 'Node.js handles 10K+ concurrent connections with ONE thread. Each "connection" is just a small event callback — not a blocked thread. The OS handles waiting; Node handles callbacks.',
                  },
                  sort_order: 10,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Node.js Architecture: V8, libuv, and the Thread Pool',
                  subtitle: 'The three components that make Node.js work',
                  content_json: {
                    components: [
                      {
                        name: 'V8 JavaScript Engine (Google Chrome\'s engine)',
                        role: 'Executes JavaScript. Compiles JS to machine code via JIT compilation. Single-threaded execution context.',
                        location: 'C++ library embedded in Node.js',
                      },
                      {
                        name: 'libuv (Cross-platform async I/O library)',
                        role: 'The core of Node.js async capabilities. Provides: event loop, async TCP/UDP sockets, async file I/O, thread pool for blocking OS calls, timers, child processes.',
                        location: 'C++ library. The actual "non-blocking" happens here.',
                      },
                      {
                        name: 'Thread Pool (libuv default: 4 threads)',
                        role: 'Some operations cannot be done asynchronously at OS level (file system on Linux, DNS lookup, crypto). libuv moves these to a thread pool — they block a worker thread, not the main event loop thread.',
                        location: 'Background OS threads managed by libuv',
                      },
                    ],
                    the_event_loop_phases: [
                      { phase: 'Timers', handles: 'setTimeout, setInterval callbacks whose delay has expired' },
                      { phase: 'Pending Callbacks', handles: 'I/O callbacks deferred to next iteration' },
                      { phase: 'Idle, Prepare', handles: 'Internal use only' },
                      { phase: 'Poll', handles: 'Retrieve new I/O events. Block here if queue empty (waiting for events).' },
                      { phase: 'Check', handles: 'setImmediate callbacks' },
                      { phase: 'Close Callbacks', handles: 'e.g. socket.on("close", ...)' },
                    ],
                    microtasks_between_phases: 'process.nextTick() and Promise callbacks drain between EVERY event loop phase — not just at the end of an iteration.',
                  },
                  sort_order: 20,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'What Actually Happens During a Database Query',
                  subtitle: 'Tracing an async database call from Node to OS and back',
                  content_json: {
                    trace: [
                      '1. Node.js calls db.query("SELECT * FROM users", callback)',
                      '2. Node passes this to libuv',
                      '3. libuv opens a TCP socket to the database (async — kernel handles it)',
                      '4. libuv registers interest in "this socket is readable" with the OS epoll/kqueue/IOCP',
                      '5. JS thread returns immediately — continues executing other code',
                      '6. OS handles TCP communication at kernel level (hardware interrupts, DMA)',
                      '7. When DB response arrives: kernel signals epoll, libuv is notified',
                      '8. libuv queues the callback in the Poll phase',
                      '9. Event loop reaches Poll phase → executes callback with result data',
                    ],
                    why_this_is_efficient: 'The JS thread was never blocked. While waiting for the database, it may have handled 100 other HTTP requests, set 20 timers, and processed 50 file read results. The OS-level epoll mechanism monitors thousands of sockets with zero CPU overhead.',
                    what_blocks_the_loop: 'CPU-intensive JS code (JSON.parse of huge objects, complex calculations, infinite loops) blocks the V8 engine and therefore the entire event loop. During this time: no HTTP requests are handled, no timer callbacks fire, no I/O events are processed.',
                  },
                  sort_order: 30,
                  difficulty_level: 'ADVANCED',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'When Node.js Excels vs When It Fails',
                  subtitle: 'Choosing the right tool requires knowing both',
                  content_json: {
                    node_excels_at: [
                      { scenario: 'REST APIs with DB/cache I/O', reason: 'Each request spends most time waiting for DB. Non-blocking I/O handles 10K concurrent with ease.' },
                      { scenario: 'Real-time applications (chat, live feeds)', reason: 'WebSocket connections are cheap — each is just a callback. No thread per connection.' },
                      { scenario: 'API gateways and proxies', reason: 'Just forwarding requests — minimal CPU, maximum I/O. Perfect for Node.' },
                      { scenario: 'Microservices with high concurrency', reason: 'Low memory footprint, fast startup time, same language as frontend.' },
                    ],
                    node_struggles_with: [
                      { scenario: 'CPU-intensive computation', reason: 'Blocks the event loop. Image processing, video transcoding, ML inference — use C++ addon, worker thread, or separate service.' },
                      { scenario: 'Long CPU calculations per request', reason: 'One heavy request blocks ALL other requests. A bank balance calculation involving millions of rows should not run on Node.' },
                    ],
                    solution_for_cpu: 'Node.js Worker Threads (available since Node 12): worker_threads module allows running CPU-intensive JavaScript on separate threads without blocking the main event loop.',
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Blocking the Event Loop in Production',
                  subtitle: 'The most impactful Node.js performance mistake',
                  content_json: {
                    examples: [
                      {
                        mistake: 'Using synchronous file system methods in request handlers',
                        bad_code: `app.get('/config', (req, res) => {
  // Blocks event loop while disk reads!
  const config = fs.readFileSync('./config.json', 'utf8');
  res.json(JSON.parse(config));
});`,
                        fix: `app.get('/config', async (req, res) => {
  const config = await fs.promises.readFile('./config.json', 'utf8');
  res.json(JSON.parse(config));
});`,
                      },
                      {
                        mistake: 'JSON.parse on large responses',
                        bad_code: `// 100MB JSON file — blocks for ~800ms
const data = JSON.parse(fs.readFileSync('big.json'));`,
                        fix: 'Use streaming JSON parsers (jsonstream, @streamparser/json) for large JSON. Or offload to worker thread.',
                      },
                      {
                        mistake: 'Bcrypt without specifying cost factor (defaults to high)',
                        bad_code: `// bcrypt.hashSync blocks the event loop for hundreds of ms
const hash = bcrypt.hashSync(password, 12); // synchronous!`,
                        fix: `const hash = await bcrypt.hash(password, 12); // async — uses thread pool`,
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
                  block_type: 'DEBUGGING',
                  title: 'Detecting Event Loop Lag in Production',
                  subtitle: 'Measuring and diagnosing performance problems',
                  content_json: {
                    tools: [
                      { tool: 'Clinic.js', use: 'npm install -g clinic. Run: clinic doctor -- node app.js. Diagnoses event loop delay, I/O issues, memory. Most useful first-step tool.' },
                      { tool: '0x (flame graphs)', use: 'npm install -g 0x. Creates flame graphs showing where CPU time is spent. Identifies blocking synchronous operations.' },
                      { tool: 'perf_hooks (built-in)', use: 'const { performance } = require("perf_hooks"). Use performance.now() to time operations. PerformanceObserver for event loop lag measurement.' },
                      { tool: 'Node.js --inspect flag', use: 'node --inspect app.js → Chrome DevTools profiler for Node. CPU profiling, memory snapshots, event loop analysis.' },
                    ],
                    event_loop_lag_measurement: `const { monitorEventLoopDelay } = require('perf_hooks');
const h = monitorEventLoopDelay({ resolution: 10 });
h.enable();
setInterval(() => {
  console.log('Event loop lag p99:', h.percentile(99) / 1e6, 'ms');
}, 5000);
// p99 > 100ms suggests blocking operations`,
                  },
                  sort_order: 60,
                  difficulty_level: 'ADVANCED',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: Node.js Scalability',
                  subtitle: 'The architecture questions that distinguish senior candidates',
                  content_json: {
                    question: 'How does Node.js handle 10,000 concurrent connections with a single thread? What are the limits of this model?',
                    answer: `Node.js single-thread concurrency model:
1. One V8 thread executes JavaScript
2. libuv handles async I/O via OS-level epoll/kqueue/IOCP — monitors thousands of sockets with near-zero CPU overhead
3. Each "connection" is callbacks waiting in a queue, not a blocked thread
4. While one request waits for DB response, JS thread handles other callbacks

Limits of the model:
1. CPU-bound work blocks ALL connections — one heavy computation = all requests stall
2. Memory: callbacks accumulate if I/O is faster than processing (backpressure needed)
3. Single failure crashes the process — need PM2/cluster/K8s for reliability
4. Thread pool size (default 4) limits concurrent file I/O and other blocking operations

Solutions:
- Worker Threads for CPU work
- Cluster module / PM2 cluster mode for multi-core
- Process manager for reliability (PM2, systemd)
- External queue (Redis) for backpressure`,
                    follow_up: 'What is process.nextTick() vs setImmediate()? — nextTick: fires before any I/O events, before the next event loop phase. setImmediate: fires in the Check phase after I/O. nextTick has higher priority; overusing it can starve I/O callbacks.',
                  },
                  sort_order: 70,
                  difficulty_level: 'ADVANCED',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Node.js Event Loop: Core Principles',
                  subtitle: 'The architecture that determines Node.js best practices',
                  content_json: {
                    bullets: [
                      'One V8 thread: single-threaded JavaScript, multi-threaded I/O via libuv',
                      'Non-blocking I/O: JS registers callbacks, OS handles waiting, callbacks fire when ready',
                      'Thread pool (4 threads default): used for file I/O, DNS, crypto — not network I/O',
                      'CPU-bound code blocks ALL connections — offload to Worker Threads or separate service',
                      'Always use async versions of fs, crypto etc. — never *Sync in request handlers',
                      'process.nextTick = high priority (fires before I/O), setImmediate = Check phase',
                    ],
                  },
                  sort_order: 80,
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
              thinking_type: 'ARCHITECTURE',
              difficulty_level: 'INTERMEDIATE',
              title: 'Node.js Workload Type',
              question_text: 'A financial app needs to calculate compound interest across 10 million customer accounts during a nightly job. Should this run in the main Node.js event loop?',
              options_json: {
                options: [
                  { id: 'a', text: 'Yes — Node.js is designed for this kind of server-side computation' },
                  { id: 'b', text: 'No — this is CPU-bound work that would block the event loop. Use Worker Threads or a separate process.' },
                  { id: 'c', text: 'Yes, but use async/await to avoid blocking' },
                  { id: 'd', text: 'No — database operations cannot be batched in Node.js' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'CPU-intensive loops run synchronously on the V8 thread, blocking the event loop regardless of async/await usage.',
              explanation: 'Calculating compound interest across 10M accounts involves CPU computation (math operations in a loop) — async/await does not help because the computation itself is synchronous JavaScript running on the V8 thread. While it runs, the event loop is blocked: no new HTTP requests handled, no timers fire. Solution: Worker Threads, child_process.fork(), or a dedicated batch processing service (Python/Go/Java for heavy computation).',
              complexity_score: 2,
              estimated_time: 60,
            },
            {
              question_type: 'MCQ',
              thinking_type: 'PERFORMANCE',
              difficulty_level: 'INTERMEDIATE',
              title: 'Thread Pool Exhaustion',
              question_text: 'Your Node.js server handles 1000 concurrent requests, each reading a different file from disk. The default libuv thread pool has 4 threads. What happens?',
              options_json: {
                options: [
                  { id: 'a', text: '4 files read concurrently; other 996 requests fail immediately' },
                  { id: 'b', text: '4 file reads run in parallel; the other 996 queue up and wait for a thread pool slot — high latency but no failures' },
                  { id: 'c', text: 'Node.js automatically increases the thread pool to 1000' },
                  { id: 'd', text: 'File I/O is non-blocking and doesn\'t use the thread pool' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'Thread pool is a fixed-size worker queue. When all threads are busy, new tasks queue. Requests wait, not fail.',
              explanation: 'libuv\'s thread pool processes tasks one at a time per thread. With 4 threads and 1000 concurrent file reads: 4 reads happen in parallel. The other 996 tasks queue. As threads become free, queued tasks are picked up. This causes latency spike — all 1000 requests wait. Fix: increase UV_THREADPOOL_SIZE env var (max 1024), use caching (avoid redundant reads), or use a CDN/object storage for static files.',
              complexity_score: 3,
              estimated_time: 90,
            },
            {
              question_type: 'SCENARIO_ANALYSIS',
              thinking_type: 'REAL_WORLD',
              difficulty_level: 'ADVANCED',
              title: 'Architecture: CPU Spike Issue',
              question_text: 'A Node.js API server processes image thumbnail generation on upload. During peak hours, CPU hits 100% and all HTTP requests start timing out for 5-10 seconds. Diagnose and propose a solution.',
              scenario_context: 'Stack: Node.js 20, Express. Image processing: sharp library (native C++ bindings). Server: 4 vCPU, 8GB RAM. Peak: 500 concurrent uploads/min. Problem: thumbnails are generated synchronously in the upload handler.',
              correct_answer: 'Image generation (even with C++ native library) competes with V8 for CPU time and blocks the event loop under load. Solution: offload to Worker Threads or a separate service/queue. Recommended: message queue (Redis/RabbitMQ) + separate worker process pool for thumbnail generation.',
              expected_reasoning: 'Even C++ native modules through Node bindings run in the main V8 context if not explicitly async. CPU saturation blocks all JavaScript execution.',
              explanation: 'Solution architecture: (1) Upload handler receives file, stores to temp location, queues a job (Redis/SQS: {jobId, filePath}), returns 202 Accepted immediately. (2) Separate worker processes (or Worker Threads) pick jobs from queue, run sharp, store thumbnail, update DB. (3) Client polls /thumbnails/:jobId or receives webhook on completion. Benefits: upload handler returns in <10ms, thumbnail workers scale independently, failures are isolated.',
              complexity_score: 4,
              estimated_time: 300,
            },
          ],
        },
        {
          title: 'Node.js Module System & Package Management',
          slug: 'nodejs-module-system',
          description: 'CommonJS vs ES Modules, the module resolution algorithm, and why circular dependencies are dangerous.',
          sort_order: 20,
          lessons: [
            {
              title: 'How Node.js Resolves Modules',
              slug: 'nodejs-module-resolution',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Node.js Created CommonJS',
                  subtitle: 'JavaScript had no module system — Node.js invented one',
                  content_json: {
                    problem: 'In 2009, JavaScript had no built-in module system. Browser JS included scripts via <script> tags that all shared the global scope. For server-side programming, this was catastrophic — large codebases would have global variable collisions.',
                    commonjs_solution: 'CommonJS (CJS) was created by the CommonJS project (later adopted by Node.js): each file is its own module scope. Use require() to import, module.exports to export. Synchronous loading — appropriate for disk I/O.',
                    esm_later: 'ES Modules (ESM) were standardized in ES2015. Browsers adopted them. Node.js added support in v12 with .mjs extension, later with "type":"module" in package.json. ESM has static imports (analyzable at parse time), top-level await, and better tree-shaking.',
                    why_both_exist: 'CJS is the legacy standard — most npm packages still use it. ESM is the modern standard. Node.js supports both but the interop is complex.',
                  },
                  sort_order: 10,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 3,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'CommonJS vs ES Modules: The Practical Differences',
                  subtitle: 'When to use each and how they interoperate',
                  content_json: {
                    comparison: [
                      { aspect: 'Syntax', cjs: 'require() / module.exports', esm: 'import / export' },
                      { aspect: 'Loading', cjs: 'Synchronous — blocks until module loads', esm: 'Async — parsed, linked, evaluated' },
                      { aspect: 'Exports', cjs: 'Copy of value at export time (primitives)', esm: 'Live bindings — changes to exported variable visible to importers' },
                      { aspect: 'this in module', cjs: 'module.exports object', esm: 'undefined' },
                      { aspect: 'Tree-shaking', cjs: 'Not possible — dynamic requires', esm: 'Possible — static analysis of imports' },
                      { aspect: 'Circular deps', cjs: 'Partially supported (exports might be incomplete)', esm: 'Handled via live bindings' },
                    ],
                    live_bindings_example: `// counter.mjs (ESM)
export let count = 0;
export const increment = () => count++;

// app.mjs
import { count, increment } from './counter.mjs';
increment();
console.log(count); // 1 — sees the LIVE updated value

// CommonJS equivalent would see the original copy (0)`,
                  },
                  sort_order: 20,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'The Module Resolution Algorithm',
                  subtitle: 'How Node.js finds a file when you call require()',
                  content_json: {
                    algorithm: [
                      { step: 'Built-in module check', detail: 'require("fs") → is "fs" a built-in? Yes → return it immediately. Fastest path.' },
                      { step: 'Absolute or relative path', detail: 'Starts with / or ./ or ../ → resolve from current file\'s directory. Try exact path, then +.js, +.json, +.node, then /index.js.' },
                      { step: 'node_modules lookup (most require() calls)', detail: 'No path prefix → search node_modules upward: ./node_modules → ../node_modules → ../../node_modules → ... → root.' },
                      { step: 'Within node_modules', detail: 'Find the package directory → read package.json "main" field → if no main, try index.js.' },
                    ],
                    caching: 'require() caches module results in require.cache. Same path loaded twice returns the SAME module instance. This is why global singletons (database connections) work — they\'re cached.',
                    cache_busting: 'delete require.cache[require.resolve("./module")] — clears the cache. Used in tests or hot-reloading. Use carefully.',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Circular Dependencies: The Invisible Bug',
                  subtitle: 'When module A requires B which requires A',
                  content_json: {
                    what_happens: `// a.js
const b = require('./b');
exports.valueA = 'from A';
console.log('b.valueB:', b.valueB); // undefined! Not "from B"

// b.js
const a = require('./a');
exports.valueB = 'from B';
console.log('a.valueA:', a.valueA); // "from A" — works

// Why: Node.js breaks the cycle by returning an incomplete exports object
// When a.js requires b.js, b.js requires a.js
// Node.js returns a.js's CURRENT (empty) exports object to break the cycle
// b.valueB is assigned AFTER a.js reads it — so a sees undefined`,
                    detection: 'circular-dependency-plugin (webpack) or madge (npm) can detect cycles. In tests, unexpected undefined values from requires often indicate circular deps.',
                    fix: 'Refactor to eliminate the cycle: extract shared logic to a third module c.js that both a.js and b.js can require without creating a cycle.',
                  },
                  sort_order: 40,
                  difficulty_level: 'ADVANCED',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: Why CJS exports are copies, ESM are live bindings',
                  subtitle: 'A question that tests real module system knowledge',
                  content_json: {
                    question: 'What is the difference between CommonJS exports and ES Module exports in terms of how consumers see changes?',
                    answer: `CommonJS: exports are VALUE copies (for primitives)
// counter.js (CJS)
let count = 0;
module.exports = { count, increment: () => count++ };

// In consumer:
const { count, increment } = require('./counter');
increment(); // modifies the original count in counter.js
console.log(count); // still 0! — count was copied at import time

ES Modules: exports are LIVE BINDINGS
// counter.mjs (ESM)
export let count = 0;
export const increment = () => count++;

// In consumer:
import { count, increment } from './counter.mjs';
increment();
console.log(count); // 1 — sees the live, current value

Why: CJS exports are evaluated and the VALUES copied when require() runs.
ESM creates live references to the exported bindings — like pointers.
Any change to the exported variable is immediately visible to importers.`,
                    practical_impact: 'CJS: destructure object to get functions, but primitive values are snapshots. ESM: destructured named exports are live. This affects singleton patterns and counter utilities.',
                  },
                  sort_order: 50,
                  difficulty_level: 'ADVANCED',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Module System: Core Principles',
                  subtitle: 'What every Node.js developer needs to know',
                  content_json: {
                    bullets: [
                      'CJS (require/module.exports): synchronous, value copies, dynamic, legacy',
                      'ESM (import/export): async, live bindings, static analysis, tree-shakeable',
                      'require() is cached — same path returns same object (singleton behavior)',
                      'Resolution: built-in → relative path → node_modules → upward',
                      'Circular dependencies in CJS return incomplete exports — avoid them',
                      'Use ESM for new projects; interop with CJS via .cjs/.mjs extensions or package.json "type"',
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
              difficulty_level: 'BEGINNER',
              title: 'require() Caching Behavior',
              question_text: 'Module A and Module B both require("./database"). Will they receive the same database connection instance or two separate ones?',
              options_json: {
                options: [
                  { id: 'a', text: 'Two separate instances — each require() creates a new module evaluation' },
                  { id: 'b', text: 'The same instance — require() caches module results by resolved path' },
                  { id: 'c', text: 'Depends on whether database.js uses singleton pattern' },
                  { id: 'd', text: 'Depends on the Node.js version' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'require() stores results in require.cache by resolved file path. Same path = same cached module object.',
              explanation: 'Node.js caches module evaluation results in require.cache keyed by resolved file path. The first require("./database") evaluates the module and stores the result. Subsequent require("./database") calls return the CACHED exports object — the same instance. This is how database connection pools work as singletons: create the pool once in database.js, export it, and every requiring module shares the same pool.',
              complexity_score: 2,
              estimated_time: 60,
            },
            {
              question_type: 'SCENARIO_ANALYSIS',
              thinking_type: 'ARCHITECTURE',
              difficulty_level: 'INTERMEDIATE',
              title: 'ESM vs CJS Package Decision',
              question_text: 'You are publishing a new npm package that does date manipulation. Should you publish as CJS, ESM, or both? What are the tradeoffs?',
              options_json: {
                options: [
                  { id: 'a', text: 'CJS only — maximum compatibility, all Node.js versions support it' },
                  { id: 'b', text: 'ESM only — modern standard, better tree-shaking' },
                  { id: 'c', text: 'Dual package (CJS + ESM) — provide both via package.json "exports" field' },
                  { id: 'd', text: 'CommonJS with .mjs extension — satisfies both formats' },
                ],
              },
              correct_answer: 'c',
              expected_reasoning: 'Dual package: CJS for existing Node.js consumers, ESM for bundlers (tree-shaking) and modern Node.js. Package.json exports field routes to correct format.',
              explanation: 'Best practice for public packages: dual CJS+ESM via package.json exports: { ".": { "import": "./dist/index.mjs", "require": "./dist/index.cjs" } }. CJS: existing Node.js apps, Jest without ESM transform. ESM: bundlers (Webpack/Rollup tree-shaking), modern Node.js with import. Tools like tsup, unbuild, or rollup can generate both formats from one TypeScript source. The dual package hazard (same module loaded twice if both CJS and ESM paths used) is a risk to document.',
              complexity_score: 3,
              estimated_time: 150,
            },
          ],
        },
      ],
    },
  ],
};
