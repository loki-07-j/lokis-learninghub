import { CourseData } from './types';

export const expressCourse: CourseData = {
  title: 'Express.js: Building Production APIs',
  slug: 'expressjs-production-apis',
  description: 'Express.js is the backbone of Node.js backends. Understand middleware architecture, error handling, route design, and the patterns that separate a fragile prototype from a production-grade API.',
  modules: [
    {
      title: 'Module 1: Middleware Architecture & REST Design',
      slug: 'express-middleware-rest',
      description: 'Express middleware is a functional composition pipeline. Understanding how it works unlocks everything from authentication to error handling.',
      sort_order: 10,
      topics: [
        {
          title: 'Express Middleware: The Request Pipeline',
          slug: 'express-middleware-pipeline',
          description: 'Every Express request flows through a pipeline of middleware functions. Understanding this pipeline is understanding Express.',
          sort_order: 10,
          lessons: [
            {
              title: 'How Express Middleware Actually Works',
              slug: 'how-express-middleware-works',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Middleware Architecture Exists',
                  subtitle: 'The decorator pattern for HTTP request handling',
                  content_json: {
                    problem: 'Without middleware, every route handler would need to: parse JSON body, verify authentication, validate input, log the request, handle CORS, compress the response. Duplicating this code in every handler is unmaintainable.',
                    solution: 'Middleware is Express\'s implementation of the Chain of Responsibility pattern. Each middleware does one thing, calls next() to pass control, or ends the request cycle. Compose them in order to build complex behaviors from simple functions.',
                    why_it_works: 'Express processes incoming requests through an ordered list of middleware functions. Each function can: modify req/res, end the cycle (res.send()), or pass to next middleware (next()). This makes cross-cutting concerns (auth, logging, compression) composable.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 3,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Middleware Function Signature & next()',
                  subtitle: 'The three function signatures in Express middleware',
                  content_json: {
                    signatures: [
                      {
                        type: 'Regular middleware',
                        signature: '(req, res, next) => void',
                        use: 'Transform request, add to req, check conditions, log, then call next()',
                      },
                      {
                        type: 'Error middleware',
                        signature: '(err, req, res, next) => void',
                        use: '4-parameter signature — only called when next(err) is called. MUST have exactly 4 parameters.',
                      },
                      {
                        type: 'Route handler',
                        signature: '(req, res) => void',
                        use: 'End of chain — sends response. No next() needed.',
                      },
                    ],
                    next_behavior: [
                      { call: 'next()', effect: 'Pass to next middleware or route handler' },
                      { call: 'next(err)', effect: 'Skip to next ERROR middleware (4-param functions). Bypasses all regular middleware.' },
                      { call: 'next("route")', effect: 'Skip remaining handlers for current route, go to next matching route' },
                    ],
                    order_matters: `// This order is correct:
app.use(morgan('dev'));        // 1. Log request
app.use(cors());               // 2. Add CORS headers
app.use(express.json());       // 3. Parse JSON body
app.use(authMiddleware);       // 4. Verify token
app.use('/api', apiRoutes);    // 5. Route to handlers
app.use(errorHandler);         // 6. Error handling (LAST)`,
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'How Express Matches Routes',
                  subtitle: 'The layer-based matching algorithm inside Express router',
                  content_json: {
                    router_internals: 'Express maintains an ordered list of "layers" (middleware + routes). For each request, it iterates through layers, running each whose path matches.',
                    matching_algorithm: [
                      'Request comes in: GET /api/users/123',
                      'Iterate through app._router.stack (ordered layers)',
                      'Layer 1: app.use(morgan) — path "/" matches any path → execute morgan',
                      'Layer 2: app.use(express.json) — matches → execute json parser',
                      'Layer 3: app.use("/api", apiRouter) — path "/api" matches → delegate to apiRouter',
                      'apiRouter layer: GET "/users/:id" — matches GET /users/123 → execute handler',
                    ],
                    params_and_query: 'req.params = path parameters (:id → {id: "123"}). req.query = query string (?sort=asc → {sort:"asc"}). req.body = parsed request body (requires express.json() middleware).',
                    important_gotcha: 'app.use() matches by PREFIX (any path starting with the mount path). app.get() matches the EXACT path (plus URL params). This is why app.use("/api") catches /api, /api/users, /api/admin/users.',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'Building an Authentication Middleware',
                  subtitle: 'A production-grade JWT auth middleware',
                  content_json: {
                    implementation: `import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.substring(7);

  // 2. Verify token
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Attach decoded user to request
    next(); // Proceed to next middleware/handler
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Usage:
app.use('/api/protected', authMiddleware, protectedRoutes);
// Public routes go without authMiddleware`,
                    design_decisions: [
                      'Attach decoded user to req.user — downstream handlers access it without re-verifying',
                      'Return specific errors for expired vs invalid — client can refresh on 401+expired',
                      'No database call in auth middleware — JWT is self-contained. DB call = latency on every request',
                    ],
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'Express Middleware Anti-Patterns',
                  subtitle: 'The mistakes that silently break production APIs',
                  content_json: {
                    mistakes: [
                      {
                        mistake: 'Not calling next() or sending response — hanging requests',
                        bad_code: `app.use((req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    // Missing: return res.status(403).json({...}) or next()
    // Request hangs forever — client times out
  }
  next();
});`,
                        fix: 'Every middleware path must EITHER call next() OR send a response. No silent returns.',
                      },
                      {
                        mistake: 'Error middleware with 3 parameters (Express ignores it)',
                        bad_code: `// This will NEVER be called as error handler!
app.use((req, res, next) => {  // 3 params = regular middleware
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});`,
                        fix: `// Must have EXACTLY 4 parameters:
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});`,
                      },
                      {
                        mistake: 'Not wrapping async handlers',
                        bad_code: `app.get('/users', async (req, res) => {
  const users = await db.findAll(); // If this throws, Express doesn't catch it
  res.json(users);
  // Unhandled promise rejection — process may crash
});`,
                        fix: `// Option 1: Try/catch + next(err)
app.get('/users', async (req, res, next) => {
  try {
    const users = await db.findAll();
    res.json(users);
  } catch (err) {
    next(err); // Passes to error middleware
  }
});

// Option 2: Wrapper utility
const asyncHandler = fn => (req, res, next) => fn(req, res, next).catch(next);
app.get('/users', asyncHandler(async (req, res) => {
  const users = await db.findAll();
  res.json(users);
}));`,
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
                  title: 'Interview: Express Error Handling',
                  subtitle: 'How to build a resilient error handling pipeline',
                  content_json: {
                    question: 'How does Express error handling middleware work? How do you ensure all errors are properly caught and formatted?',
                    answer: `Express error handling requires 3 things:

1. Error-first middleware (4 params) LAST in the chain:
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

2. Wrap async handlers to forward errors:
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

3. Create typed errors for consistent handling:
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
// throw new AppError('Not found', 404)

Common patterns:
- 400: Validation errors (missing fields, wrong types)
- 401: Authentication failed (no token, expired)
- 403: Authorization failed (wrong permissions)
- 404: Resource not found
- 422: Semantic validation errors
- 500: Unexpected server errors (never expose stack in production)`,
                    follow_up: 'How do you handle uncaught promise rejections globally in Node.js? — process.on("unhandledRejection") and process.on("uncaughtException"). Log and gracefully shutdown — never resume after uncaughtException.',
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Express Middleware: Core Principles',
                  subtitle: 'The foundation of every Express application',
                  content_json: {
                    bullets: [
                      'Middleware is an ordered pipeline: each function processes req/res then calls next()',
                      'Every middleware must either call next() or send a response — never hang',
                      'next(err) skips to 4-parameter error middleware — use for error propagation',
                      'Error middleware MUST have exactly 4 parameters: (err, req, res, next)',
                      'Async handlers must catch errors and pass to next(err) — Express cannot catch async throws',
                      'Order matters: body parser before auth, auth before routes, error handler last',
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
              title: 'next() vs next(err)',
              question_text: 'Inside an Express middleware, what is the difference between calling next() and next(new Error("failed"))?',
              options_json: {
                options: [
                  { id: 'a', text: 'No difference — both move to the next middleware in order' },
                  { id: 'b', text: 'next() moves to the next middleware. next(err) skips to the error-handling middleware (4-param function).' },
                  { id: 'c', text: 'next(err) throws the error immediately and crashes the process' },
                  { id: 'd', text: 'next(err) returns a 500 error response automatically' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'next() = proceed normally. next(err) = bypass all remaining regular middleware, jump to the 4-parameter error handler.',
              explanation: 'next() moves to the next middleware in the stack. next(error) tells Express "something went wrong — skip normal middleware and jump to the error handler". Express identifies error handlers by their 4-parameter signature (err, req, res, next). This allows centralized error formatting instead of duplicating res.status(500) in every handler.',
              complexity_score: 1,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Debug: Middleware Order Bug',
              question_text: 'The API returns 401 Unauthorized for all requests even for a public route. Find the problem in the middleware order.',
              scenario_context: `const app = express();

app.use(authMiddleware);    // Requires JWT token
app.use(express.json());
app.use(cors());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/users', authMiddleware, userController.getAll);
app.post('/api/auth/login', authController.login);`,
              correct_answer: 'authMiddleware is applied globally BEFORE routes, so /api/health and /api/auth/login (which should be public) require authentication. Fix: apply authMiddleware only to protected routes, or add a whitelist to the middleware.',
              expected_reasoning: 'app.use(authMiddleware) runs for ALL routes. Public routes (health, login) need to be exempt.',
              explanation: `Fix: Move authMiddleware to only protected routes:
app.use(express.json());
app.use(cors());

// Public routes (no auth)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.post('/api/auth/login', authController.login);

// Protected routes (with auth)
app.get('/api/users', authMiddleware, userController.getAll);

// Or use router groups:
const publicRouter = express.Router();
const privateRouter = express.Router();
privateRouter.use(authMiddleware);
app.use('/api', publicRouter);
app.use('/api', privateRouter);`,
              complexity_score: 2,
              estimated_time: 120,
            },
            {
              question_type: 'SCENARIO_ANALYSIS',
              thinking_type: 'ARCHITECTURE',
              difficulty_level: 'ADVANCED',
              title: 'Rate Limiting Architecture',
              question_text: 'Design a rate limiting middleware for an Express API that: (1) limits each user to 100 req/min, (2) returns 429 with retry-after header, (3) works across multiple server instances.',
              scenario_context: 'Server: 3 Express instances behind a load balancer. In-memory storage cannot work across instances.',
              correct_answer: 'Use Redis as shared counter store. Per-user key with TTL = 1 minute. Increment atomically. Return 429 with Retry-After header when limit exceeded. Redis INCR + EXPIRE is atomic.',
              expected_reasoning: 'In-memory rate limiting only works per-instance. Redis provides shared state across all instances with atomic operations.',
              explanation: `Implementation:
const redis = require('ioredis');
const client = new redis(process.env.REDIS_URL);

async function rateLimiter(req, res, next) {
  const userId = req.user?.id || req.ip;
  const key = \`ratelimit:\${userId}\`;
  const limit = 100;
  const window = 60; // seconds

  const [current, ttl] = await redis.pipeline()
    .incr(key)
    .ttl(key)
    .exec();

  const count = current[1];
  if (count === 1) await client.expire(key, window); // Set TTL on first request

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - count));

  if (count > limit) {
    res.setHeader('Retry-After', ttl[1] > 0 ? ttl[1] : window);
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  next();
}`,
              complexity_score: 4,
              estimated_time: 300,
            },
          ],
        },
      ],
    },
  ],
};
