import { CourseData } from './types';

export const sqlCourse: CourseData = {
  title: 'SQL & Database Design',
  slug: 'sql-database-design',
  description: 'SQL is the language of data. Master JOINs, normalization, indexing, and transactions — with the deep understanding of why these concepts exist and how they prevent data disasters.',
  modules: [
    {
      title: 'Module 1: Query Mastery',
      slug: 'sql-query-mastery',
      description: 'From SELECT to complex multi-table JOINs — understanding what SQL actually does when it runs your query.',
      sort_order: 10,
      topics: [
        {
          title: 'SQL JOINs: Relational Thinking',
          slug: 'sql-joins-relational-thinking',
          description: 'JOINs are the heart of relational databases. Understanding the different JOIN types and their underlying algorithms unlocks database performance.',
          sort_order: 10,
          lessons: [
            {
              title: 'Why JOINs Exist and How They Work',
              slug: 'joins-why-and-how',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Relational Databases Use Multiple Tables',
                  subtitle: 'Normalization: the principle that makes JOINs necessary',
                  content_json: {
                    problem: 'If you store all customer data in one "orders" table: customer_name, customer_email, customer_address, product_name, product_price in every order row — what happens when a customer\'s email changes? You update potentially thousands of rows. What if you miss one? Now you have inconsistent data.',
                    normalization_solution: 'Normalization: store each fact once, in one place. Customers in customers table. Products in products table. Orders reference customers and products by ID. Change an email? Update one row in customers. All orders automatically reflect it.',
                    why_joins_exist: 'JOINs reassemble normalized data at query time. You pay for normalization\'s data integrity with the cost of joining tables. Modern databases are optimized for this — JOINs on indexed columns are fast.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'JOIN Types: INNER, LEFT, RIGHT, FULL, CROSS',
                  subtitle: 'Each JOIN type answers a different question',
                  content_json: {
                    join_types: [
                      {
                        type: 'INNER JOIN',
                        returns: 'Only rows where the join condition matches in BOTH tables',
                        use_case: 'Get orders with their customer — excludes orders with missing customer (orphaned rows)',
                        example: 'SELECT o.id, c.name FROM orders o INNER JOIN customers c ON o.customer_id = c.id',
                      },
                      {
                        type: 'LEFT JOIN (LEFT OUTER JOIN)',
                        returns: 'ALL rows from the left table + matching rows from right. NULL for unmatched right columns.',
                        use_case: 'Get ALL customers, with their orders if any — includes customers who never ordered',
                        example: 'SELECT c.name, o.id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id',
                      },
                      {
                        type: 'RIGHT JOIN',
                        returns: 'ALL rows from the right table + matching left rows. Rarely needed — rewrite as LEFT JOIN with tables swapped.',
                        use_case: 'Same as LEFT JOIN but keeps all right table rows',
                      },
                      {
                        type: 'FULL OUTER JOIN',
                        returns: 'ALL rows from BOTH tables. NULL where no match on either side.',
                        use_case: 'Find all customers and all orders, showing unmatched on both sides',
                      },
                      {
                        type: 'CROSS JOIN',
                        returns: 'Cartesian product — every row of left × every row of right.',
                        use_case: 'Generate all combinations (size × color for products). Dangerous without WHERE — 1K rows × 1K rows = 1M result rows',
                      },
                    ],
                    null_pattern: 'A LEFT JOIN with WHERE right.id IS NULL finds rows in left that have NO match in right: "Find customers who never placed an order".',
                  },
                  sort_order: 20,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERNAL_WORKING',
                  title: 'JOIN Algorithms: Nested Loop, Hash Join, Merge Join',
                  subtitle: 'How the database actually executes a JOIN',
                  content_json: {
                    algorithms: [
                      {
                        name: 'Nested Loop Join',
                        algorithm: 'For each row in outer table, scan inner table for matches. O(n×m). Fast when outer table is small AND inner table has an index.',
                        when_used: 'Small outer table, inner table has index on join column. Very common for indexed lookups.',
                      },
                      {
                        name: 'Hash Join',
                        algorithm: 'Build a hash table from the smaller table (hash key = join column). Scan larger table, probe hash table for matches. O(n+m) time but O(n) memory.',
                        when_used: 'No usable index, both tables are large. Very fast when smaller table fits in memory.',
                      },
                      {
                        name: 'Merge Join (Sort-Merge)',
                        algorithm: 'Sort both tables by join column, then merge. O(n log n + m log m) for sorting + O(n+m) for merge. Excellent for already-sorted or indexed data.',
                        when_used: 'Both tables already sorted (from index). Often seen in EXPLAIN output for indexed range scans.',
                      },
                    ],
                    explain_reading: 'Run EXPLAIN on any query with a JOIN. The algorithm chosen tells you if indexes are being used. "Hash Join" in EXPLAIN usually means "no useful index found — consider adding one".',
                  },
                  sort_order: 30,
                  difficulty_level: 'ADVANCED',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'The N+1 Query Problem',
                  subtitle: 'How ORMs create invisible JOIN inefficiencies',
                  content_json: {
                    what_is_it: 'The N+1 problem: 1 query to fetch N records, then N queries to fetch related data for each record. Total = N+1 queries.',
                    example: `// ORM code that looks innocent:
const orders = await Order.findAll({ where: { status: 'pending' } });
// ↑ 1 query: SELECT * FROM orders WHERE status='pending' (returns 100 rows)

for (const order of orders) {
  const customer = await order.getCustomer();
  // ↑ 100 queries: SELECT * FROM customers WHERE id = ?
  console.log(order.id, customer.name);
}
// Total: 101 queries instead of 1 JOIN`,
                    orm_solutions: [
                      { orm: 'Sequelize', solution: 'Include: Order.findAll({ include: [{ model: Customer }] })' },
                      { orm: 'Prisma', solution: 'include: { customer: true }' },
                      { orm: 'TypeORM', solution: 'relations: ["customer"] or JOIN in QueryBuilder' },
                    ],
                    sql_solution: 'SELECT orders.*, customers.name FROM orders JOIN customers ON orders.customer_id = customers.id WHERE orders.status = \'pending\'',
                    detection: 'Query logs showing repeated identical queries with different ID parameters. Tools: Prisma query logging, Sequelize logging option, pg query logs.',
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'MISTAKES',
                  title: 'JOIN Mistakes That Corrupt Data or Crush Performance',
                  subtitle: 'The mistakes developers repeat until they\'ve seen the consequences',
                  content_json: {
                    mistakes: [
                      {
                        mistake: 'Implicit JOIN without ON condition = Cartesian product',
                        code: `-- Missing ON condition!
SELECT * FROM orders, customers;
-- Returns: 1000 orders × 5000 customers = 5,000,000 rows`,
                        fix: 'Always use explicit JOIN syntax with ON condition. Implicit comma JOIN is SQL-92 legacy syntax.',
                      },
                      {
                        mistake: 'INNER JOIN when you need LEFT JOIN — silently drops data',
                        code: `-- This drops orders with deleted/missing customers:
SELECT o.id, c.name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id
-- If customer was deleted: their orders disappear from results silently`,
                        fix: 'Use LEFT JOIN when all rows from one side must be preserved. Use INNER JOIN only when missing matches should be excluded.',
                      },
                      {
                        mistake: 'Joining on non-indexed columns',
                        code: `-- customers.email is not indexed
SELECT * FROM orders
JOIN customers ON orders.billing_email = customers.email
-- Full table scan of customers for every order row`,
                        fix: 'Always create indexes on JOIN columns. Primary keys are auto-indexed. Foreign keys usually need explicit indexes.',
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
                  title: 'Interview: LEFT JOIN vs INNER JOIN',
                  subtitle: 'The scenario that reveals real SQL understanding',
                  content_json: {
                    question: 'What is the difference between LEFT JOIN and INNER JOIN? Give an example where using INNER JOIN would silently hide data you need.',
                    answer: `INNER JOIN: returns rows only where the join condition matches in BOTH tables.
LEFT JOIN: returns ALL rows from the left table, with NULLs for unmatched right table columns.

Scenario where INNER JOIN hides data:
You need to count how many orders each customer has placed, including customers with ZERO orders.

WRONG (INNER JOIN):
SELECT c.name, COUNT(o.id) as order_count
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;
-- Customers with 0 orders are EXCLUDED (no matching rows in orders)

CORRECT (LEFT JOIN):
SELECT c.name, COUNT(o.id) as order_count
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name;
-- Customers with 0 orders show order_count = 0 (NULL counted as 0)

Real-world impact: reporting queries that use INNER JOIN unknowingly exclude records.
A "total revenue per customer" report shows lower total than actual if any customers have no orders.`,
                    follow_up: 'How would you find customers who have NEVER placed an order? — LEFT JOIN + WHERE orders.id IS NULL: SELECT c.name FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL.',
                  },
                  sort_order: 60,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'SQL JOINs: Core Principles',
                  subtitle: 'The mental models for correct JOIN usage',
                  content_json: {
                    bullets: [
                      'INNER JOIN: rows in BOTH tables match — excludes non-matching rows',
                      'LEFT JOIN: ALL left rows + matching right, NULL if no match — never loses left table data',
                      'CROSS JOIN: Cartesian product — every combination, dangerous without WHERE',
                      'N+1 queries: most ORMs solve with eager loading (include/populate)',
                      'Always index JOIN columns — unindexed JOINs trigger full table scans',
                      'LEFT JOIN + WHERE right.id IS NULL = "find rows with no match" pattern',
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
              title: 'JOIN Type Selection',
              question_text: 'You want to list all products, including ones that have never been ordered. Which JOIN is correct?\n\nSELECT p.name, COUNT(o.id) as times_ordered\nFROM products p\n[?] orders o ON p.id = o.product_id\nGROUP BY p.id',
              options_json: {
                options: [
                  { id: 'a', text: 'INNER JOIN — only shows products that have orders' },
                  { id: 'b', text: 'LEFT JOIN — shows all products, 0 for unordered ones' },
                  { id: 'c', text: 'CROSS JOIN — shows all product-order combinations' },
                  { id: 'd', text: 'RIGHT JOIN — would work from the orders side' },
                ],
              },
              correct_answer: 'b',
              expected_reasoning: 'All products must appear, including those with 0 orders. LEFT JOIN keeps all rows from the left (products) table with NULL for unmatched orders. COUNT(o.id) counts NULL as 0.',
              explanation: 'LEFT JOIN keeps all rows from the left table (products). Products with no orders get NULL for all orders columns. COUNT(o.id) counts non-NULL o.id values, so products with no orders return count=0. INNER JOIN would exclude them entirely — you\'d only see products that have at least one order.',
              complexity_score: 1,
              estimated_time: 60,
            },
            {
              question_type: 'DEBUG_BASED',
              thinking_type: 'DEBUGGING',
              difficulty_level: 'INTERMEDIATE',
              title: 'Debug: Duplicate Rows from JOIN',
              question_text: 'This query returns duplicate rows for each order. Find the bug.',
              scenario_context: `SELECT o.id, o.total, t.name as tag_name
FROM orders o
JOIN order_tags ot ON o.id = ot.order_id
JOIN tags t ON ot.tag_id = t.id
WHERE o.customer_id = 'cust_123';

-- Results:
-- order_id: 1, total: 99.00, tag_name: "electronics"
-- order_id: 1, total: 99.00, tag_name: "gadgets"
-- order_id: 1, total: 99.00, tag_name: "sale"
-- The same order appears 3 times!`,
              correct_answer: 'Not a bug — this is correct SQL behavior. Order 1 has 3 tags, so it appears 3 times (one row per tag). To get a single row per order with aggregated tags, use STRING_AGG or GROUP_CONCAT, or filter to a specific tag.',
              expected_reasoning: 'Many-to-many JOINs multiply rows. One order with 3 tags = 3 result rows. This is expected behavior for a JOIN — not a bug.',
              explanation: 'This is expected JOIN behavior for many-to-many relationships. An order with 3 tags produces 3 joined rows — one per tag. Solutions depend on requirement: (1) Keep as-is if showing all tag+order combinations. (2) Aggregate: SELECT o.id, o.total, STRING_AGG(t.name, \', \') as tags FROM orders o JOIN order_tags ot... JOIN tags t... GROUP BY o.id, o.total. (3) Filter: AND t.name = \'electronics\' to show only one tag. Understanding this "multiplication" is key to debugging unexpected row counts.',
              complexity_score: 2,
              estimated_time: 120,
            },
            {
              question_type: 'SCENARIO_ANALYSIS',
              thinking_type: 'PERFORMANCE',
              difficulty_level: 'ADVANCED',
              title: 'Multi-Table JOIN Optimization',
              question_text: 'A query joining 5 tables takes 8 seconds. EXPLAIN shows Hash Joins on 3 of the joins. Suggest optimization approaches.',
              scenario_context: `SELECT u.name, o.total, p.name, c.name as category, s.name as supplier
FROM users u
JOIN orders o ON u.id = o.user_id          -- users.id indexed (PK)
JOIN order_items oi ON o.id = oi.order_id   -- orders.id indexed (PK)
JOIN products p ON oi.product_id = p.id     -- products.id indexed (PK)
JOIN categories c ON p.category_id = c.id  -- p.category_id NOT indexed
JOIN suppliers s ON p.supplier_id = s.id   -- p.supplier_id NOT indexed
WHERE u.email = 'user@example.com'
  AND o.created_at > NOW() - INTERVAL '30 days';`,
              correct_answer: 'Add indexes on p.category_id and p.supplier_id (eliminating the Hash Joins). Add index on users.email if not present. Consider adding index on o.created_at for the date range filter. These 3-4 indexes should turn Hash Joins into Nested Loop/Index scans.',
              expected_reasoning: 'Hash Joins indicate missing indexes. The two unindexed foreign keys (category_id, supplier_id) cause full table scans. users.email needs an index for the WHERE filter.',
              explanation: `Priority fixes:
1. CREATE INDEX ON products(category_id);
2. CREATE INDEX ON products(supplier_id);
3. CREATE INDEX ON users(email);   -- if email not unique-indexed
4. CREATE INDEX ON orders(user_id, created_at DESC);  -- composite for user + date filter

After indexing, EXPLAIN should show Nested Loop or Index Scan instead of Hash Join for those tables. Test with EXPLAIN ANALYZE to verify. Also consider: is this query run frequently? If so, a covering index that includes p.name, c.name, s.name could eliminate heap fetches.`,
              complexity_score: 4,
              estimated_time: 240,
            },
          ],
        },
        {
          title: 'Database Normalization: Data Integrity Through Design',
          slug: 'database-normalization',
          description: 'Normalization eliminates data redundancy and prevents anomalies. Understanding 1NF through 3NF is essential for designing databases that don\'t silently corrupt data.',
          sort_order: 20,
          lessons: [
            {
              title: 'From Chaos to Normalized Schema',
              slug: 'normalization-1nf-to-3nf',
              sort_order: 10,
              blocks: [
                {
                  block_type: 'WHY',
                  title: 'Why Normalization Prevents Data Disasters',
                  subtitle: 'The three anomalies that bad schema design causes',
                  content_json: {
                    bad_table: `-- Un-normalized order table (everything in one place):
orders: | order_id | customer_name | customer_email | product_name | product_price | qty |
        |    1     | "Alice Smith"  | alice@co.com   | "Keyboard"   | 49.99         |  2  |
        |    2     | "Alice Smith"  | alice@co.com   | "Mouse"      | 29.99         |  1  |
        |    3     | "Bob Jones"    | bob@co.com     | "Keyboard"   | 49.99         |  1  |`,
                    anomalies: [
                      {
                        type: 'Update Anomaly',
                        scenario: 'Keyboard price changes to 59.99. Must update rows 1 AND 3. Miss row 1? Inconsistent data — same product, different prices.',
                      },
                      {
                        type: 'Insert Anomaly',
                        scenario: 'You cannot add a new product (Headphones, $79.99) to the database without having an order for it.',
                      },
                      {
                        type: 'Delete Anomaly',
                        scenario: 'Delete Bob\'s order (row 3) → you lose the fact that Keyboard costs 49.99 (if no other row has it).',
                      },
                    ],
                    solution: 'Normalization: store each fact once. Customer info in customers table, product info in products table, orders reference them by ID.',
                  },
                  sort_order: 10,
                  difficulty_level: 'BEGINNER',
                  estimated_time: 4,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'CONCEPT',
                  title: 'Normal Forms: 1NF, 2NF, 3NF',
                  subtitle: 'The rules that progressively eliminate redundancy',
                  content_json: {
                    forms: [
                      {
                        form: 'First Normal Form (1NF)',
                        rule: 'Each column contains atomic (indivisible) values. No repeating groups. Each row uniquely identified by primary key.',
                        violation: 'colors: "red,blue,green" (comma-separated in one column)',
                        fix: 'Create a product_colors table with one color per row',
                      },
                      {
                        form: 'Second Normal Form (2NF)',
                        rule: '1NF + every non-key column depends on the ENTIRE primary key (not part of it). Applies to composite keys only.',
                        violation: 'Table: (order_id, product_id) → product_name. product_name depends only on product_id, not order_id.',
                        fix: 'Move product_name to products table (keyed by product_id alone)',
                      },
                      {
                        form: 'Third Normal Form (3NF)',
                        rule: '2NF + no non-key column depends on another non-key column (no transitive dependencies).',
                        violation: 'employees: employee_id, department_id, department_name. department_name depends on department_id, not employee_id.',
                        fix: 'Create departments table. employees only stores department_id.',
                      },
                    ],
                    practical_summary: 'In practice: "Every non-key attribute should depend on the key, the whole key, and nothing but the key."',
                  },
                  sort_order: 20,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'REAL_WORLD',
                  title: 'When to Break Normalization',
                  subtitle: 'The performance vs integrity tradeoff in production systems',
                  content_json: {
                    why_denormalize: 'Normalization requires JOINs to reassemble data. JOINs have cost. For high-read, high-scale systems, denormalization trades some data redundancy for query speed.',
                    denormalization_patterns: [
                      {
                        pattern: 'Computed columns',
                        example: 'Store order_total in orders table even though it can be computed from order_items. Avoids SUM() query for every order display.',
                        tradeoff: 'Must update order_total when items change. Risk of inconsistency if updates fail.',
                      },
                      {
                        pattern: 'Materialized views',
                        example: 'Pre-compute aggregation (daily_sales_by_region) and refresh periodically. Analytics queries hit the materialized view.',
                        tradeoff: 'Stale data between refreshes. Good for dashboards, not real-time.',
                      },
                      {
                        pattern: 'JSON columns for polymorphic data',
                        example: 'Store product-type-specific attributes (color for clothes, wattage for electronics) in a JSONB column instead of separate tables per type.',
                        tradeoff: 'Less rigid schema, harder to query specific attributes, no FK constraints.',
                      },
                    ],
                    rule_of_thumb: 'Start normalized. Measure performance. Denormalize only where profiling shows the JOIN cost is unacceptable. Never denormalize preemptively.',
                  },
                  sort_order: 30,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 5,
                  is_interactive: false,
                  is_required: true,
                },
                {
                  block_type: 'INTERVIEW',
                  title: 'Interview: Normalize This Schema',
                  subtitle: 'The live schema design question every SQL interview includes',
                  content_json: {
                    question: 'This table has normalization problems. Identify the normal form violations and provide a corrected schema.\n\nemployees: id, name, email, dept_name, dept_manager, project1, project2, project3, skill1, skill2',
                    violations: [
                      '1NF: project1/2/3 are repeating groups (not atomic)',
                      '1NF: skill1/skill2 are repeating groups',
                      '3NF: dept_manager depends on dept_name (transitive dependency)',
                    ],
                    normalized_schema: `-- departments table
departments: id, name, manager_employee_id

-- employees table
employees: id, name, email, department_id (FK → departments)

-- employee_projects (many-to-many)
employee_projects: employee_id, project_id
projects: id, name, description

-- employee_skills (many-to-many)
employee_skills: employee_id, skill_id
skills: id, name, level

-- All facts stored exactly once. No repeating groups. No transitive deps.`,
                    answer: 'Violations: (1) Repeating project columns violate 1NF — create projects + employee_projects junction table. (2) Repeating skill columns violate 1NF — create skills + employee_skills junction table. (3) dept_manager transitively depends on dept_name (not employee id) — violates 3NF — create departments table.',
                  },
                  sort_order: 40,
                  difficulty_level: 'INTERMEDIATE',
                  estimated_time: 6,
                  is_interactive: true,
                  is_required: true,
                },
                {
                  block_type: 'SUMMARY',
                  title: 'Normalization: Core Principles',
                  subtitle: 'The rules that prevent data anomalies',
                  content_json: {
                    bullets: [
                      '1NF: atomic values, no repeating groups, primary key on every table',
                      '2NF: no partial dependencies — non-key columns depend on ENTIRE key',
                      '3NF: no transitive dependencies — no non-key depending on another non-key',
                      'Un-normalized: update/insert/delete anomalies corrupt data',
                      'Start normalized; denormalize only where profiling shows JOIN cost is unacceptable',
                      'Materialized views bridge normalization and performance for analytics',
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
              difficulty_level: 'INTERMEDIATE',
              title: '3NF Violation',
              question_text: 'Table: invoices(invoice_id, customer_id, customer_city, customer_zip). Which normal form is violated and why?',
              options_json: {
                options: [
                  { id: 'a', text: '1NF — customer_city and customer_zip are not atomic' },
                  { id: 'b', text: '2NF — customer_city depends on customer_id not the full key' },
                  { id: 'c', text: '3NF — customer_city depends on customer_zip (ZIP determines city), creating a transitive dependency' },
                  { id: 'd', text: 'No violation — all columns are about the invoice' },
                ],
              },
              correct_answer: 'c',
              expected_reasoning: 'customer_zip → customer_city (ZIP code determines the city). This is a transitive dependency: invoice_id → customer_id → customer_zip → customer_city.',
              explanation: '3NF violation: customer_zip determines customer_city (a given ZIP code is always in the same city). The dependency chain is: invoice_id → customer_id → customer_zip → customer_city. customer_city depends on customer_zip, not directly on invoice_id — a transitive dependency. Fix: create an addresses table or a zip_codes table with (zip, city). Also: customer data (city, zip) should be in a customers table — not in invoices.',
              complexity_score: 3,
              estimated_time: 90,
            },
            {
              question_type: 'ARCHITECTURE_REASONING',
              thinking_type: 'ARCHITECTURE',
              difficulty_level: 'ADVANCED',
              title: 'Schema Design for E-Commerce',
              question_text: 'Design a normalized schema for a product catalog where: (1) products can have multiple categories, (2) each product can have custom attributes (different for each category type), (3) products have multiple images.',
              scenario_context: 'Electronics: wattage, voltage, brand. Clothing: size, color, material. Both share: name, price, description, sku.',
              correct_answer: 'Core products table with shared fields. product_categories junction for many-to-many. product_images table for multiple images. For attributes: use EAV (product_id, attribute_name, attribute_value) or JSONB column — both are valid tradeoffs.',
              expected_reasoning: 'Many-to-many for categories. Separate table for images. For heterogeneous attributes: EAV provides full relational constraints but complex queries; JSONB provides flexibility but loses type enforcement.',
              explanation: `Normalized schema:
products (id, sku, name, description, base_price, created_at)
categories (id, name, parent_id)  -- self-referential for hierarchy
product_categories (product_id, category_id)  -- many-to-many junction
product_images (id, product_id, url, is_primary, sort_order)
-- For attributes, two valid approaches:
-- EAV: product_attributes (product_id, key, value, data_type)
-- JSONB: products.attributes JSONB  -- e.g. {"wattage": 100, "voltage": "220V"}
-- JSONB is simpler, queryable with -> operators, good for diverse attributes
-- EAV allows foreign key constraints and typed values but complex queries`,
              complexity_score: 4,
              estimated_time: 300,
            },
          ],
        },
      ],
    },
  ],
};
