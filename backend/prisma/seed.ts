import { Prisma } from '@prisma/client';
import prisma from '../src/utils/prisma';
import bcrypt from 'bcryptjs';
import { CourseData } from './seed-data/types';

import { htmlCourse } from './seed-data/html';
import { cssCourse } from './seed-data/css';
import { javascriptCourse } from './seed-data/javascript';
import { nodejsCourse } from './seed-data/nodejs';
import { expressCourse } from './seed-data/expressjs';
import { sqlCourse } from './seed-data/sql';
import { gitCourse } from './seed-data/git';
import { tailwindCourse } from './seed-data/tailwind';
import { seoCourse } from './seed-data/seo';

// ──────────────────────────────────────────────────────────────────────────────
// Generic course seeder — handles the full CourseData hierarchy
// ──────────────────────────────────────────────────────────────────────────────
async function seedCourse(courseData: CourseData, adminUserId: string) {
  // Clean slate for this slug
  const existing = await prisma.course.findUnique({ where: { slug: courseData.slug } });
  if (existing) {
    await prisma.course.delete({ where: { id: existing.id } });
  }

  const course = await prisma.course.create({
    data: {
      title: courseData.title,
      slug: courseData.slug,
      description: courseData.description,
      is_published: true,
      created_by: adminUserId,
    },
  });

  for (const moduleData of courseData.modules) {
    const mod = await prisma.module.create({
      data: {
        course_id: course.id,
        title: moduleData.title,
        slug: moduleData.slug,
        description: moduleData.description,
        sort_order: moduleData.sort_order,
        is_published: true,
      },
    });

    for (const topicData of moduleData.topics) {
      const topic = await prisma.topic.create({
        data: {
          module_id: mod.id,
          title: topicData.title,
          slug: topicData.slug,
          description: topicData.description,
          sort_order: topicData.sort_order,
          is_published: true,
        },
      });

      for (const lessonData of topicData.lessons) {
        const lesson = await prisma.lesson.create({
          data: {
            topic_id: topic.id,
            title: lessonData.title,
            slug: lessonData.slug,
            sort_order: lessonData.sort_order,
            is_published: true,
          },
        });

        for (const block of lessonData.blocks) {
          await prisma.lessonBlock.create({
            data: {
              lesson_id: lesson.id,
              block_type: block.block_type,
              title: block.title,
              subtitle: block.subtitle,
              content_json: block.content_json,
              sort_order: block.sort_order,
              difficulty_level: block.difficulty_level,
              estimated_time: block.estimated_time,
              is_interactive: block.is_interactive,
              is_required: block.is_required,
              created_by: adminUserId,
            },
          });
        }
      }

      if (topicData.questions.length > 0) {
        await prisma.practiceQuestion.createMany({
          data: topicData.questions.map(q => ({
            topic_id: topic.id,
            question_type: q.question_type,
            thinking_type: q.thinking_type,
            difficulty_level: q.difficulty_level,
            title: q.title,
            question_text: q.question_text,
            scenario_context: q.scenario_context ?? null,
            options_json: q.options_json ?? Prisma.DbNull,
            correct_answer: q.correct_answer,
            expected_reasoning: q.expected_reasoning ?? Prisma.DbNull,
            explanation: q.explanation,
            complexity_score: q.complexity_score,
            estimated_time: q.estimated_time,
            is_active: true,
            created_by: adminUserId,
          })),
        });
      }
    }
  }

  const topicCount = courseData.modules.reduce((m, mod) => m + mod.topics.length, 0);
  const questionCount = courseData.modules.reduce(
    (m, mod) => m + mod.topics.reduce((t, topic) => t + topic.questions.length, 0),
    0,
  );
  console.log(`  ✓ ${course.title} — ${courseData.modules.length} module(s), ${topicCount} topic(s), ${questionCount} question(s)`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Seeding database...');

  // ── 1. Roles ──────────────────────────────────────────────────────────────
  const roleDefinitions = [
    { role_name: 'Super Admin', role_code: 'SUPER_ADMIN', description: 'Super Administrator with full access' },
    { role_name: 'Admin', role_code: 'ADMIN', description: 'Administrator with management access' },
    { role_name: 'Student', role_code: 'STUDENT', description: 'Student with learning access' },
  ];

  const seededRoles = [];
  for (const r of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { role_code: r.role_code },
      update: {},
      create: r,
    });
    seededRoles.push(role);
  }
  console.log('Roles:', seededRoles.map(r => r.role_name).join(', '));

  // ── 2. Permissions ────────────────────────────────────────────────────────
  const permissionDefinitions = [
    { permission_name: 'Create Lesson', permission_key: 'lesson.create', module_name: 'Lessons' },
    { permission_name: 'Edit Lesson', permission_key: 'lesson.edit', module_name: 'Lessons' },
    { permission_name: 'Delete Lesson', permission_key: 'lesson.delete', module_name: 'Lessons' },
    { permission_name: 'Publish Lesson', permission_key: 'lesson.publish', module_name: 'Lessons' },
    { permission_name: 'Create Question', permission_key: 'question.create', module_name: 'Practice' },
    { permission_name: 'Edit Question', permission_key: 'question.edit', module_name: 'Practice' },
    { permission_name: 'Create Test', permission_key: 'test.create', module_name: 'Tests' },
    { permission_name: 'Upload JSON', permission_key: 'json.upload', module_name: 'Imports' },
    { permission_name: 'View Analytics', permission_key: 'analytics.view', module_name: 'Analytics' },
    { permission_name: 'Manage Practice Questions', permission_key: 'practice.manage', module_name: 'Practice' },
  ];

  const seededPermissions = [];
  for (const p of permissionDefinitions) {
    const permission = await prisma.permission.upsert({
      where: { permission_key: p.permission_key },
      update: {},
      create: p,
    });
    seededPermissions.push(permission);
  }
  console.log('Permissions seeded:', seededPermissions.length);

  // ── 3. Role → Permission links ────────────────────────────────────────────
  const superAdminRole = seededRoles.find(r => r.role_code === 'SUPER_ADMIN')!;
  const adminRole = seededRoles.find(r => r.role_code === 'ADMIN')!;
  const studentRole = seededRoles.find(r => r.role_code === 'STUDENT')!;

  for (const p of seededPermissions) {
    for (const role of [superAdminRole, adminRole]) {
      await prisma.rolePermission.upsert({
        where: { role_id_permission_id: { role_id: role.id, permission_id: p.id } },
        update: {},
        create: { role_id: role.id, permission_id: p.id },
      });
    }
  }

  const viewAnalyticsPerm = seededPermissions.find(p => p.permission_key === 'analytics.view')!;
  await prisma.rolePermission.upsert({
    where: { role_id_permission_id: { role_id: studentRole.id, permission_id: viewAnalyticsPerm.id } },
    update: {},
    create: { role_id: studentRole.id, permission_id: viewAnalyticsPerm.id },
  });
  console.log('Role permissions linked.');

  // ── 4. Users ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 10);

  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@learninghub.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@learninghub.com',
      password: hashedPassword,
      role_id: superAdminRole.id,
      is_active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@learninghub.com' },
    update: {},
    create: {
      name: 'Loki Admin',
      email: 'admin@learninghub.com',
      password: hashedPassword,
      role_id: adminRole.id,
      is_active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@learninghub.com' },
    update: {},
    create: {
      name: 'Loki Student',
      email: 'student@learninghub.com',
      password: hashedPassword,
      role_id: studentRole.id,
      is_active: true,
    },
  });

  console.log('Users seeded.');

  // ── 5. PostgreSQL Internals course (original detailed course) ─────────────
  console.log('\nSeeding PostgreSQL Internals course...');

  const existingPg = await prisma.course.findUnique({ where: { slug: 'postgres-performance' } });
  if (existingPg) {
    await prisma.course.delete({ where: { id: existingPg.id } });
  }

  const pgCourse = await prisma.course.create({
    data: {
      title: 'Deep-Dive PostgreSQL Internals & Performance Tuning',
      slug: 'postgres-performance',
      description: 'Master the hidden layers of PostgreSQL. Learn execution plans, B-Tree indexes, lock contentions, and query optimizations from production scenarios.',
      is_published: true,
      created_by: superAdminUser.id,
    },
  });

  const pgModule1 = await prisma.module.create({
    data: {
      course_id: pgCourse.id,
      title: 'Module 1: Query Execution & Scan Types',
      slug: 'query-execution-scan-types',
      description: 'Explore how PostgreSQL parses, optimizes, and executes queries from disk blocks.',
      sort_order: 10,
      is_published: true,
    },
  });

  const pgTopic1 = await prisma.topic.create({
    data: {
      module_id: pgModule1.id,
      title: 'Topic 1.1: EXPLAIN ANALYZE Breakdown',
      slug: 'explain-analyze-breakdown',
      description: 'Deep-dive scan strategies selected by the optimizer.',
      sort_order: 10,
      is_published: true,
    },
  });

  const pgLesson1 = await prisma.lesson.create({
    data: {
      topic_id: pgTopic1.id,
      title: 'Lesson 1.1.1: Sequential vs Index Scans',
      slug: 'seq-scans-vs-index-scans',
      sort_order: 10,
      is_published: true,
    },
  });

  const pgBlocks = [
    {
      block_type: 'WHY',
      title: 'Why Indexing Matters',
      subtitle: 'The cost of full table scans in production',
      content_json: {
        problem: 'Queries that take milliseconds on local dev take 12 seconds in production with 10M rows.',
        history: 'Historically, tables were small enough to fit entirely in memory, making disk seeking negligible. At scale, random disk seek overhead becomes a bottleneck.',
        purpose: 'Understand when Postgres chooses sequential vs index scans to build predictable database workloads.',
      },
      sort_order: 10,
      difficulty_level: 'BEGINNER',
      estimated_time: 3,
      is_interactive: false,
      is_required: true,
    },
    {
      block_type: 'CONCEPT',
      title: 'Sequential Scan vs Index Scan Mechanics',
      subtitle: 'How PostgreSQL retrieves tuples from disk blocks',
      content_json: {
        text: 'A **Sequential Scan (Seq Scan)** reads every single database page from the heap file sequentially. A **B-Tree Index Scan**, however, traverses a balanced tree structure to find the exact pointer (TID) to the heap tuple.',
        points: [
          'Seq Scan is faster for retrieving a large percentage of table rows because it uses sequential multi-block read I/O.',
          'Index Scan is faster for target-point lookups, replacing O(N) sequential scans with O(log N) tree traversals followed by single-page heap fetches.',
        ],
      },
      sort_order: 20,
      difficulty_level: 'BEGINNER',
      estimated_time: 4,
      is_interactive: false,
      is_required: true,
    },
    {
      block_type: 'INTERNAL_WORKING',
      title: 'The Internal B-Tree Traversal Execution Path',
      subtitle: 'From Index Root to Heap Data Blocks',
      content_json: {
        steps: [
          '1. SQL Query Parser parses the select where filter criteria.',
          '2. Optimizer looks up statistics for the column and decides if selective index traversal is cheaper than sequential heap reads.',
          '3. Executor traverses from the B-Tree Root node down to leaf nodes.',
          '4. B-Tree leaf node yields the Page and Tuple Offset (TID, e.g., (Block 42, Offset 5)).',
          '5. Executor fetches block 42 directly from shared buffers or triggers physical disk read.',
        ],
      },
      sort_order: 30,
      difficulty_level: 'INTERMEDIATE',
      estimated_time: 5,
      is_interactive: false,
      is_required: true,
    },
    {
      block_type: 'MISTAKES',
      title: 'The "Index Everything" Fallacy',
      subtitle: 'Why blanket indexing ruins write throughput',
      content_json: {
        wrong_code: `CREATE INDEX ON users(first_name);
CREATE INDEX ON users(last_name);
CREATE INDEX ON users(email);
CREATE INDEX ON users(age);
CREATE INDEX ON users(created_at);`,
        explanation: 'Every index is a physical balanced tree that MUST be updated on every INSERT, UPDATE, and DELETE. Blanket indexing quadruples writing I/O cost and causes index bloat.',
        correct_code: `CREATE UNIQUE INDEX ON users(email);
CREATE INDEX ON users(last_name) WHERE is_active = true;
-- Only index fields used in critical WHERE/JOIN filters!`,
      },
      sort_order: 40,
      difficulty_level: 'INTERMEDIATE',
      estimated_time: 4,
      is_interactive: false,
      is_required: true,
    },
    {
      block_type: 'DEBUGGING',
      title: 'Debugging a Slow Query',
      subtitle: 'Simulating a missing index scenario',
      content_json: {
        error_log: "Slow Query Detected: SELECT * FROM events WHERE tenant_id = '9b1deb4d' ORDER BY created_at DESC LIMIT 10;\nExecution Time: 3420 ms",
        steps: [
          '1. Run EXPLAIN ANALYZE on the slow SQL statement.',
          '2. Output shows: "Seq Scan on events (cost=0.00..892403.20 rows=15 width=128) (actual time=2.40..3418.15 rows=10 loops=1)".',
          '3. Notice that it does a sequential search over 10M rows to filter by tenant_id.',
          '4. Solve it by adding a composite partial index: CREATE INDEX idx_events_tenant_created ON events(tenant_id, created_at DESC).',
          '5. Re-run EXPLAIN ANALYZE: "Index Scan using idx_events_tenant_created on events (cost=0.43..8.50 rows=10 width=128) (actual time=0.08..0.12 rows=10 loops=1)".',
          '6. Execution time drops from 3420ms to 0.12ms!',
        ],
      },
      sort_order: 50,
      difficulty_level: 'ADVANCED',
      estimated_time: 6,
      is_interactive: false,
      is_required: true,
    },
    {
      block_type: 'INTERVIEW',
      title: 'PostgreSQL Index Scan vs Bitmap Index Scan',
      subtitle: 'Under the hood optimizer choices',
      content_json: {
        question: 'Why does PostgreSQL sometimes switch from an Index Scan to a Bitmap Index Scan?',
        thinking_strategy: 'Explain how random disk page access relates to index lookups and cache hit rates.',
        answer: 'An Index Scan fetches tuples one-by-one, which might result in bouncing back and forth across different disk pages if rows are scattered. A Bitmap Index Scan reads index data first, builds a bitmap of matching pages in memory, sorts the page numbers, and then reads heap pages sequentially. This converts random disk access into sequential disk access!',
      },
      sort_order: 60,
      difficulty_level: 'ADVANCED',
      estimated_time: 5,
      is_interactive: true,
      is_required: true,
    },
    {
      block_type: 'CHALLENGE',
      title: 'Challenge: Add a Partial Index',
      subtitle: 'Optimize dynamic billing scopes',
      content_json: {
        instructions: "Create a partial index on a large `invoices` table to optimize searching for unpaid invoices (`status = 'UNPAID'`) filtered by `user_id`. Write the correct SQL statement.",
        hints: [
          'Use the WHERE clause inside the CREATE INDEX statement.',
          'Target both fields: user_id and status.',
        ],
        expected_output: "CREATE INDEX idx_unpaid_user_invoices ON invoices(user_id) WHERE status = 'UNPAID';",
      },
      sort_order: 70,
      difficulty_level: 'INTERMEDIATE',
      estimated_time: 5,
      is_interactive: true,
      is_required: true,
    },
    {
      block_type: 'SUMMARY',
      title: 'Core Cheat-Sheet Summary',
      subtitle: 'Sequential vs Index Scan takeaways',
      content_json: {
        bullets: [
          'B-Trees yield O(log N) random seek reads.',
          'Multi-column indexing requires ordering filters correctly (equality fields first).',
          "Don't index low-cardinality flags (e.g. status boolean) unless using partial indexes.",
          'Always analyze plans via EXPLAIN ANALYZE.',
        ],
      },
      sort_order: 80,
      difficulty_level: 'BEGINNER',
      estimated_time: 2,
      is_interactive: false,
      is_required: true,
    },
  ];

  for (const b of pgBlocks) {
    await prisma.lessonBlock.create({
      data: {
        lesson_id: pgLesson1.id,
        block_type: b.block_type,
        title: b.title,
        subtitle: b.subtitle,
        content_json: b.content_json,
        sort_order: b.sort_order,
        difficulty_level: b.difficulty_level,
        estimated_time: b.estimated_time,
        is_interactive: b.is_interactive,
        is_required: b.is_required,
        created_by: superAdminUser.id,
      },
    });
  }

  await prisma.practiceQuestion.createMany({
    data: [
      {
        topic_id: pgTopic1.id,
        question_type: 'MCQ',
        thinking_type: 'LOGIC',
        difficulty_level: 'BEGINNER',
        title: 'Seq Scan vs Index Scan Decision',
        question_text: 'A table has 10,000 rows. A query retrieves 8,000 of them with no WHERE clause. Which scan will PostgreSQL most likely choose?',
        options_json: {
          options: [
            { id: 'a', text: 'Index Scan — always faster due to B-tree traversal' },
            { id: 'b', text: 'Sequential Scan — cheaper for retrieving a large fraction of rows' },
            { id: 'c', text: 'Bitmap Index Scan — always chosen for large tables' },
            { id: 'd', text: 'Index Only Scan — skips the heap entirely' },
          ],
        },
        correct_answer: 'b',
        expected_reasoning: 'When retrieving >5–10% of rows, the cost of random I/O for each index lookup exceeds the cost of reading pages sequentially.',
        explanation: 'Sequential Scan is chosen because reading 80% of a table via an index would cause far more random page fetches than simply scanning the heap sequentially.',
        complexity_score: 1,
        estimated_time: 60,
        created_by: superAdminUser.id,
        is_active: true,
      },
      {
        topic_id: pgTopic1.id,
        question_type: 'MCQ',
        thinking_type: 'PERFORMANCE',
        difficulty_level: 'INTERMEDIATE',
        title: 'Index Selectivity',
        question_text: 'You add an index on a boolean column `is_active` which is `true` for 98% of rows. What will happen?',
        options_json: {
          options: [
            { id: 'a', text: 'The index dramatically speeds up all queries on is_active' },
            { id: 'b', text: 'PostgreSQL will likely ignore the index due to low selectivity' },
            { id: 'c', text: 'The index only helps DELETE operations' },
            { id: 'd', text: 'The index reduces storage since boolean values are small' },
          ],
        },
        correct_answer: 'b',
        expected_reasoning: 'Low-cardinality columns yield poor selectivity — the index covers almost all rows, so a seq scan is cheaper.',
        explanation: 'An index on a column where 98% of rows share one value has near-zero selectivity. The planner will skip it for queries filtering on `is_active = true`.',
        complexity_score: 2,
        estimated_time: 90,
        created_by: superAdminUser.id,
        is_active: true,
      },
      {
        topic_id: pgTopic1.id,
        question_type: 'DEBUG_BASED',
        thinking_type: 'DEBUGGING',
        difficulty_level: 'INTERMEDIATE',
        title: 'Debug the Slow Report Query',
        question_text: 'This query runs in 8 seconds on a table with 5M rows. Identify the problem and state the fix.',
        scenario_context: `-- Query taking 8+ seconds:
SELECT order_id, total, status
FROM orders
WHERE customer_id = 'cust_abc123'
  AND created_at > '2024-01-01'
ORDER BY created_at DESC;

-- EXPLAIN ANALYZE output:
-- Seq Scan on orders (cost=0.00..198432.00 rows=47 width=40)
-- (actual time=0.01..8143.25 rows=47 loops=1)
-- Rows Removed by Filter: 4999953`,
        correct_answer: 'Add a composite index on (customer_id, created_at DESC) to enable an index scan instead of filtering 5M rows sequentially.',
        expected_reasoning: 'The seq scan filters 4,999,953 rows — an index on the WHERE columns eliminates this waste.',
        explanation: 'Fix: `CREATE INDEX idx_orders_customer_date ON orders(customer_id, created_at DESC);`. Put the equality column first (customer_id), then the range/sort column (created_at).',
        complexity_score: 3,
        estimated_time: 180,
        created_by: superAdminUser.id,
        is_active: true,
      },
      {
        topic_id: pgTopic1.id,
        question_type: 'MCQ',
        thinking_type: 'INTERVIEW',
        difficulty_level: 'ADVANCED',
        title: 'Bitmap Index Scan vs Index Scan',
        question_text: 'A query matches 5% of rows from a large table and rows are physically scattered across many pages. Why might PostgreSQL choose a Bitmap Index Scan over a regular Index Scan?',
        options_json: {
          options: [
            { id: 'a', text: 'Bitmap scans are always faster because they use less memory' },
            { id: 'b', text: 'Bitmap scans collect all matching TIDs, sort them by page, then fetch pages in sequential order — avoiding random I/O' },
            { id: 'c', text: 'Bitmap scans skip the index entirely and use OS-level file caching' },
            { id: 'd', text: 'Index Scan requires a B-Tree, while Bitmap scan works on any column type' },
          ],
        },
        correct_answer: 'b',
        expected_reasoning: 'Bitmap scan batches TIDs, sorts by page, converts random I/O to sequential reads.',
        explanation: 'Bitmap Index Scan solves the "scattered rows" problem: it collects all matching TIDs, builds an in-memory bitmap, sorts by page number, then reads heap pages sequentially.',
        complexity_score: 4,
        estimated_time: 120,
        created_by: superAdminUser.id,
        is_active: true,
      },
      {
        topic_id: pgTopic1.id,
        question_type: 'MCQ',
        thinking_type: 'INTERVIEW',
        difficulty_level: 'INTERMEDIATE',
        title: 'EXPLAIN vs EXPLAIN ANALYZE',
        question_text: 'What is the key difference between EXPLAIN and EXPLAIN ANALYZE in PostgreSQL?',
        options_json: {
          options: [
            { id: 'a', text: 'EXPLAIN actually executes the query; EXPLAIN ANALYZE does not' },
            { id: 'b', text: 'EXPLAIN ANALYZE executes the query and shows real vs estimated costs' },
            { id: 'c', text: 'They are identical — just different aliases' },
            { id: 'd', text: 'EXPLAIN ANALYZE only works on SELECT statements' },
          ],
        },
        correct_answer: 'b',
        expected_reasoning: 'EXPLAIN shows estimated plan. EXPLAIN ANALYZE runs the query and reports actual row counts and times.',
        explanation: 'EXPLAIN shows the query plan with estimated costs without executing. EXPLAIN ANALYZE actually executes the query and reports real timing and row counts alongside estimates.',
        complexity_score: 2,
        estimated_time: 60,
        created_by: superAdminUser.id,
        is_active: true,
      },
      {
        topic_id: pgTopic1.id,
        question_type: 'SCENARIO_ANALYSIS',
        thinking_type: 'REAL_WORLD',
        difficulty_level: 'ADVANCED',
        title: 'SaaS Multi-Tenant Index Strategy',
        question_text: 'How would you design an indexing strategy for this scenario to maintain sub-100ms query times?',
        scenario_context: 'The `events` table has 200M rows across 5,000 tenants. A dashboard query filters by `tenant_id` + `event_type` + date range. The table receives 10,000 INSERT/second during peak hours.',
        correct_answer: 'Composite partial index: CREATE INDEX idx_events_tenant_type_date ON events(tenant_id, event_type, created_at DESC) INCLUDE (id, payload);',
        expected_reasoning: 'tenant_id first for equality filter, event_type next, created_at for range+sort, INCLUDE avoids heap fetch.',
        explanation: 'Optimal: `CREATE INDEX ON events(tenant_id, event_type, created_at DESC) INCLUDE (id, payload);`. This is a covering index. Column order follows selectivity. INCLUDE prevents heap fetches.',
        complexity_score: 4,
        estimated_time: 300,
        created_by: superAdminUser.id,
        is_active: true,
      },
    ],
  });

  console.log('  ✓ PostgreSQL Internals course seeded.');

  // ── 6. Seed all 9 technology courses ─────────────────────────────────────
  console.log('\nSeeding technology courses...');

  const courses: CourseData[] = [
    htmlCourse,
    cssCourse,
    javascriptCourse,
    nodejsCourse,
    expressCourse,
    sqlCourse,
    gitCourse,
    tailwindCourse,
    seoCourse,
  ];

  for (const course of courses) {
    await seedCourse(course, superAdminUser.id);
  }

  // ── 7. Seed Assessment Tests ─────────────────────────────────────────────
  console.log('\nSeeding assessment tests...');

  const testDefs = [
    {
      slug: 'js-fundamentals-test',
      title: 'JavaScript Fundamentals',
      description: 'Test your core JavaScript knowledge: closures, prototypes, async patterns.',
      category: 'JavaScript',
      difficulty: 'INTERMEDIATE' as const,
      duration_secs: 600,
      passing_score: 70,
      questions: [
        { question_text: 'What does `typeof null` return in JavaScript?', options_json: ['null', 'object', 'undefined', 'string'], correct_answer: 1, explanation: '`typeof null` returns "object" — a long-standing quirk (bug) in JavaScript.' },
        { question_text: 'Which method creates a shallow copy of an array?', options_json: ['array.copy()', 'array.clone()', '[...array]', 'array.duplicate()'], correct_answer: 2, explanation: 'The spread operator `[...array]` creates a shallow copy.' },
        { question_text: 'What is a closure in JavaScript?', options_json: ['A function that has no return value', 'A function that accesses variables from its outer scope', 'An arrow function', 'A function called immediately'], correct_answer: 1, explanation: 'A closure is a function that retains access to its lexical scope even when executed outside that scope.' },
        { question_text: 'What does `Promise.all()` do when one promise rejects?', options_json: ['It ignores the rejection', 'It waits for all promises to settle', 'It immediately rejects with that reason', 'It returns undefined'], correct_answer: 2, explanation: '`Promise.all()` short-circuits and rejects immediately if any promise in the array rejects.' },
        { question_text: 'What is the output of `console.log(0.1 + 0.2 === 0.3)`?', options_json: ['true', 'false', 'NaN', 'Error'], correct_answer: 1, explanation: 'Floating point arithmetic means 0.1 + 0.2 equals 0.30000000000000004, not exactly 0.3.' },
        { question_text: 'Which statement correctly describes `let` vs `var`?', options_json: ['let is function-scoped, var is block-scoped', 'var is block-scoped, let is function-scoped', 'let is block-scoped, var is function-scoped', 'Both are block-scoped'], correct_answer: 2, explanation: '`let` is block-scoped; `var` is function-scoped (or global if outside a function).' },
        { question_text: 'What does the `===` operator check?', options_json: ['Value only', 'Type only', 'Value and type', 'Reference equality'], correct_answer: 2, explanation: 'Strict equality (`===`) checks both value and type without type coercion.' },
        { question_text: 'How do you prevent an object from being mutated in JavaScript?', options_json: ['Object.seal()', 'Object.freeze()', 'Object.lock()', 'Object.protect()'], correct_answer: 1, explanation: '`Object.freeze()` prevents adding, removing, or modifying properties.' },
      ],
    },
    {
      slug: 'react-hooks-test',
      title: 'React Hooks Deep Dive',
      description: 'Evaluate understanding of useState, useEffect, useCallback, useMemo, and custom hooks.',
      category: 'React',
      difficulty: 'ADVANCED' as const,
      duration_secs: 900,
      passing_score: 75,
      questions: [
        { question_text: 'What happens if you omit the dependency array in useEffect?', options_json: ['Effect runs once on mount', 'Effect never runs', 'Effect runs after every render', 'Effect runs only on unmount'], correct_answer: 2, explanation: 'Without a dependency array, useEffect runs after every render.' },
        { question_text: 'When should you use useCallback?', options_json: ['Always, for better performance', 'When passing callbacks to optimized child components to avoid unnecessary re-renders', 'To memoize the return value of a function', 'To replace useState'], correct_answer: 1, explanation: 'useCallback memoizes a function reference, preventing child component re-renders when the function hasn\'t changed.' },
        { question_text: 'What is the difference between useMemo and useCallback?', options_json: ['They are identical', 'useMemo memoizes a value; useCallback memoizes a function', 'useCallback memoizes a value; useMemo memoizes a function', 'useMemo is for class components'], correct_answer: 1, explanation: 'useMemo returns a memoized value; useCallback returns a memoized function.' },
        { question_text: 'How do you run cleanup code when a component unmounts?', options_json: ['Return a cleanup function from useEffect', 'Use the componentWillUnmount lifecycle', 'Call useCleanup()', 'Use useState with a null value'], correct_answer: 0, explanation: 'Return a function from useEffect — it runs when the component unmounts or before the next effect.' },
        { question_text: 'What does useRef return?', options_json: ['A getter/setter pair', 'A mutable object with a .current property', 'An immutable value', 'A promise'], correct_answer: 1, explanation: 'useRef returns a mutable object `{ current: initialValue }` that persists for the lifetime of the component.' },
        { question_text: 'Which hook would you use to access context?', options_json: ['useContext', 'useState', 'useReducer', 'useStore'], correct_answer: 0, explanation: 'useContext accepts a context object and returns the current context value.' },
      ],
    },
  ];

  for (const td of testDefs) {
    const existing = await prisma.test.findUnique({ where: { slug: td.slug } });
    if (!existing) {
      const test = await prisma.test.create({
        data: {
          title: td.title, slug: td.slug, description: td.description,
          category: td.category, difficulty: td.difficulty,
          duration_secs: td.duration_secs, passing_score: td.passing_score,
          is_published: true, created_by: superAdminUser.id,
        },
      });
      await prisma.testQuestion.createMany({
        data: td.questions.map((q, i) => ({
          test_id: test.id, question_text: q.question_text,
          options_json: q.options_json, correct_answer: q.correct_answer,
          explanation: q.explanation, sort_order: (i + 1) * 10,
        })),
      });
      console.log(`  ✓ Test: ${td.title}`);
    } else {
      console.log(`  – Test already exists: ${td.title}`);
    }
  }

  // ── 8. Seed Revision Decks ────────────────────────────────────────────────
  console.log('\nSeeding revision decks...');

  const deckDefs = [
    {
      slug: 'js-core-concepts',
      title: 'JavaScript Core Concepts',
      description: 'Essential JS flashcards: closures, prototypes, event loop, async.',
      category: 'JavaScript',
      cards: [
        { question: 'What is a closure?', answer: 'A function that retains access to its lexical scope even when executed outside of that scope. The inner function "closes over" the outer variables.', tip: 'Classic example: counter factories, module pattern.', difficulty: 'INTERMEDIATE' as const },
        { question: 'Explain the event loop in JavaScript.', answer: 'JavaScript is single-threaded. The event loop picks tasks from the task queue and executes them on the call stack when the stack is empty. Microtasks (Promises) run before the next task.', tip: 'Order: sync code → microtasks (queueMicrotask, Promise.then) → macrotasks (setTimeout, setInterval).', difficulty: 'ADVANCED' as const },
        { question: 'What is prototype chaining?', answer: 'Every object has a [[Prototype]] link to another object. Property lookup walks up the chain until found or null is reached. `Object.prototype` is the root.', tip: '`Object.getPrototypeOf(obj)` inspects the chain.', difficulty: 'INTERMEDIATE' as const },
        { question: 'What is the difference between `==` and `===`?', answer: '`==` performs type coercion before comparing. `===` (strict equality) checks both value AND type with no coercion.', tip: 'Always prefer `===` to avoid unexpected coercion bugs.', difficulty: 'BEGINNER' as const },
        { question: 'What are Promises?', answer: 'Objects representing the eventual result (or failure) of an async operation. States: pending → fulfilled | rejected. Chain with .then()/.catch() or use async/await.', tip: 'Promise.all() for parallel; Promise.race() for first-to-settle.', difficulty: 'INTERMEDIATE' as const },
        { question: 'What is `this` in JavaScript?', answer: 'The value of `this` depends on how a function is called: global (window/undefined in strict), method call (the object), arrow function (inherited from enclosing scope), or explicit bind/call/apply.', tip: 'Arrow functions do NOT have their own `this`.', difficulty: 'ADVANCED' as const },
      ],
    },
    {
      slug: 'react-patterns',
      title: 'React Patterns & Hooks',
      description: 'Flashcards covering React hooks, patterns, and performance optimization.',
      category: 'React',
      cards: [
        { question: 'What is the Virtual DOM?', answer: 'An in-memory JavaScript representation of the real DOM. React diffs the new virtual tree against the previous one (reconciliation) and applies only the minimal real DOM changes (commit phase).', tip: 'Key prop helps React identify which items in a list changed.', difficulty: 'BEGINNER' as const },
        { question: 'When does React re-render a component?', answer: 'When: (1) state changes via setState/useState setter, (2) props change, (3) parent re-renders (unless memoized), (4) context value changes.', tip: 'Use React.memo to skip re-renders when props haven\'t changed.', difficulty: 'INTERMEDIATE' as const },
        { question: 'What is the purpose of the key prop in lists?', answer: 'Keys help React identify which items changed/added/removed. A stable unique key allows React to reuse DOM nodes efficiently and preserve component state.', tip: 'Never use array index as key for lists that can reorder.', difficulty: 'BEGINNER' as const },
        { question: 'What is lifting state up?', answer: 'Moving state to the closest common ancestor of components that need to share it. The ancestor passes state and setter down as props.', tip: 'If too deep, consider Context or a state manager.', difficulty: 'INTERMEDIATE' as const },
      ],
    },
    {
      slug: 'node-backend-essentials',
      title: 'Node.js Backend Essentials',
      description: 'Express, middleware, async patterns, and Node internals flashcards.',
      category: 'Node',
      cards: [
        { question: 'What is middleware in Express?', answer: 'Functions with signature (req, res, next) that sit in the request-response pipeline. They can read/modify req and res, call next() to continue, or end the cycle.', tip: 'Order matters — middleware executes in the order it is registered.', difficulty: 'BEGINNER' as const },
        { question: 'What is the difference between process.nextTick and setImmediate?', answer: 'process.nextTick fires before any I/O callbacks in the current iteration of the event loop. setImmediate fires in the check phase, after I/O callbacks.', tip: 'nextTick is faster but can starve I/O if called recursively.', difficulty: 'ADVANCED' as const },
        { question: 'How does Node.js handle concurrent requests despite being single-threaded?', answer: 'Node offloads I/O operations (file, network, DB) to the OS and libuv thread pool. While waiting, the event loop processes other events. True concurrency for CPU-bound work requires worker_threads or child_process.', tip: 'Non-blocking I/O is the core design principle.', difficulty: 'ADVANCED' as const },
      ],
    },
  ];

  for (const dd of deckDefs) {
    const existing = await prisma.revisionDeck.findUnique({ where: { slug: dd.slug } });
    if (!existing) {
      const deck = await prisma.revisionDeck.create({
        data: {
          title: dd.title, slug: dd.slug, description: dd.description,
          category: dd.category, is_published: true, created_by: superAdminUser.id,
        },
      });
      await prisma.revisionCard.createMany({
        data: dd.cards.map((c, i) => ({
          deck_id: deck.id, question: c.question, answer: c.answer,
          tip: c.tip ?? null, tags: [], difficulty: c.difficulty, sort_order: (i + 1) * 10,
        })),
      });
      console.log(`  ✓ Revision deck: ${dd.title}`);
    } else {
      console.log(`  – Deck already exists: ${dd.title}`);
    }
  }

  // ── 9. Seed Rapid Fire Pools ──────────────────────────────────────────────
  console.log('\nSeeding rapid fire pools...');

  const poolDefs = [
    {
      slug: 'js-rapid-fire',
      title: 'JavaScript Quick Blitz',
      description: '15-second rapid-fire JavaScript questions. Test your reflexes.',
      category: 'JavaScript',
      questions: [
        { question_text: 'What does `NaN === NaN` return?', options_json: ['true', 'false', 'undefined', 'TypeError'], correct_answer: 1, explanation: 'NaN is the only value not equal to itself. Use Number.isNaN() to check.' },
        { question_text: 'Which array method returns a new array?', options_json: ['push()', 'sort()', 'map()', 'splice()'], correct_answer: 2, explanation: 'map() returns a new array; push/sort/splice mutate in place.' },
        { question_text: 'What is the result of `typeof function(){}`?', options_json: ['object', 'function', 'callable', 'undefined'], correct_answer: 1, explanation: 'typeof returns "function" for function objects.' },
        { question_text: 'Which keyword declares a block-scoped variable?', options_json: ['var', 'global', 'let', 'define'], correct_answer: 2, explanation: 'let is block-scoped; var is function-scoped.' },
        { question_text: 'What does `Array.isArray([])` return?', options_json: ['false', 'true', '"array"', 'null'], correct_answer: 1, explanation: 'Array.isArray returns true for arrays, unlike typeof which returns "object".' },
        { question_text: 'How do you convert a string to a number?', options_json: ['Number("42")', 'String("42")', 'Parse("42")', 'Int("42")'], correct_answer: 0, explanation: 'Number() converts a string to a number. Also works: +"42" or parseInt("42").' },
        { question_text: 'What does `!!value` do?', options_json: ['Negates value', 'Converts to boolean', 'Doubles the value', 'Throws error'], correct_answer: 1, explanation: 'Double negation converts any value to its boolean equivalent.' },
        { question_text: 'What is a truthy value in JavaScript?', options_json: ['0', '""', 'null', '"hello"'], correct_answer: 3, explanation: 'Non-empty strings are truthy. Falsy values: 0, "", null, undefined, NaN, false.' },
        { question_text: 'Which method removes the last element of an array?', options_json: ['shift()', 'unshift()', 'pop()', 'splice(-1)'], correct_answer: 2, explanation: 'pop() removes and returns the last element.' },
        { question_text: 'What does `Object.keys()` return?', options_json: ['Values of an object', 'Keys of an object as an array', 'Key-value pairs', 'An iterator'], correct_answer: 1, explanation: 'Object.keys() returns an array of the object\'s own enumerable property names.' },
        { question_text: 'What is the spread operator used for?', options_json: ['Multiplication', 'Expanding iterables', 'String formatting', 'Error handling'], correct_answer: 1, explanation: '... expands an iterable (array, string, etc.) into individual elements.' },
        { question_text: 'Which built-in method joins array elements into a string?', options_json: ['concat()', 'merge()', 'join()', 'toString()'], correct_answer: 2, explanation: 'join() joins all elements of an array into a string with an optional separator.' },
      ],
    },
    {
      slug: 'react-rapid-fire',
      title: 'React Rapid Fire',
      description: 'Fast-paced React questions — hooks, JSX, component patterns.',
      category: 'React',
      questions: [
        { question_text: 'Which hook manages local component state?', options_json: ['useEffect', 'useContext', 'useState', 'useRef'], correct_answer: 2, explanation: 'useState manages local state within a functional component.' },
        { question_text: 'What does JSX compile to?', options_json: ['HTML', 'React.createElement() calls', 'DOM nodes', 'JSON'], correct_answer: 1, explanation: 'JSX is syntactic sugar — Babel/SWC transforms it into React.createElement() calls.' },
        { question_text: 'What prevents a component from re-rendering when props haven\'t changed?', options_json: ['useCallback', 'React.memo', 'useMemo', 'shouldUpdate'], correct_answer: 1, explanation: 'React.memo wraps a component and skips re-renders if props haven\'t changed (shallow compare).' },
        { question_text: 'How do you pass data from child to parent in React?', options_json: ['Using Redux only', 'Through callback functions passed as props', 'Via the DOM', 'With localStorage'], correct_answer: 1, explanation: 'Parent passes a callback as a prop; child calls it with the data.' },
        { question_text: 'What does the dependency array in useEffect control?', options_json: ['The component\'s props', 'When the effect re-runs', 'Component keys', 'Context values'], correct_answer: 1, explanation: 'The dependency array tells React to re-run the effect only when listed values change.' },
        { question_text: 'What is conditional rendering in React?', options_json: ['Rendering only on server', 'Rendering components based on conditions', 'Lazy loading', 'Rendering in a loop'], correct_answer: 1, explanation: 'Using JS expressions (&&, ternary) to conditionally include JSX in render output.' },
        { question_text: 'Which lifecycle phase does useEffect with [] mimic?', options_json: ['componentDidUpdate', 'componentWillUnmount', 'componentDidMount', 'getDerivedStateFromProps'], correct_answer: 2, explanation: 'useEffect with an empty dependency array runs once after the initial mount.' },
        { question_text: 'What does `key` prop do in a list?', options_json: ['Styles the element', 'Identifies elements for efficient reconciliation', 'Adds a ref', 'Sets tab order'], correct_answer: 1, explanation: 'Key helps React identify which items changed, reducing DOM operations.' },
        { question_text: 'What hook would you use to store a mutable value without triggering re-renders?', options_json: ['useState', 'useReducer', 'useRef', 'useMemo'], correct_answer: 2, explanation: 'useRef persists a value across renders without causing re-renders when changed.' },
        { question_text: 'What is prop drilling?', options_json: ['Removing unused props', 'Passing props through many layers of components', 'Validating prop types', 'Cloning components'], correct_answer: 1, explanation: 'Prop drilling is passing data through many intermediate components that don\'t use it themselves.' },
      ],
    },
  ];

  for (const pd of poolDefs) {
    const existing = await prisma.rapidFirePool.findUnique({ where: { slug: pd.slug } });
    if (!existing) {
      const pool = await prisma.rapidFirePool.create({
        data: {
          title: pd.title, slug: pd.slug, description: pd.description,
          category: pd.category, is_published: true, created_by: superAdminUser.id,
        },
      });
      await prisma.rapidFireQuestion.createMany({
        data: pd.questions.map((q, i) => ({
          pool_id: pool.id, question_text: q.question_text,
          options_json: q.options_json, correct_answer: q.correct_answer,
          explanation: q.explanation, sort_order: (i + 1) * 10,
        })),
      });
      console.log(`  ✓ Rapid Fire pool: ${pd.title}`);
    } else {
      console.log(`  – Pool already exists: ${pd.title}`);
    }
  }

  console.log('\nDatabase seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
