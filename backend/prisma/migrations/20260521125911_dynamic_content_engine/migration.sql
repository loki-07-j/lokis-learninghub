-- CreateEnum
CREATE TYPE "RevisionRating" AS ENUM ('HARD', 'MEDIUM', 'EASY');

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "duration_secs" INTEGER NOT NULL DEFAULT 120,
    "passing_score" INTEGER NOT NULL DEFAULT 75,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_questions" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "options_json" JSONB NOT NULL,
    "correct_answer" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "answers_json" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "is_passed" BOOLEAN NOT NULL,
    "time_taken" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revision_decks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revision_decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revision_cards" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tip" TEXT,
    "tags" JSONB,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revision_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_revision_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "rating" "RevisionRating" NOT NULL,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_revision_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapid_fire_pools" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rapid_fire_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapid_fire_questions" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "options_json" JSONB NOT NULL,
    "correct_answer" INTEGER NOT NULL,
    "explanation" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rapid_fire_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rapid_fire_sessions" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "time_taken" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rapid_fire_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tests_slug_key" ON "tests"("slug");

-- CreateIndex
CREATE INDEX "test_questions_test_id_idx" ON "test_questions"("test_id");

-- CreateIndex
CREATE INDEX "test_attempts_user_id_idx" ON "test_attempts"("user_id");

-- CreateIndex
CREATE INDEX "test_attempts_test_id_idx" ON "test_attempts"("test_id");

-- CreateIndex
CREATE UNIQUE INDEX "revision_decks_slug_key" ON "revision_decks"("slug");

-- CreateIndex
CREATE INDEX "revision_cards_deck_id_idx" ON "revision_cards"("deck_id");

-- CreateIndex
CREATE INDEX "user_revision_progress_user_id_idx" ON "user_revision_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_revision_progress_user_id_card_id_key" ON "user_revision_progress"("user_id", "card_id");

-- CreateIndex
CREATE UNIQUE INDEX "rapid_fire_pools_slug_key" ON "rapid_fire_pools"("slug");

-- CreateIndex
CREATE INDEX "rapid_fire_questions_pool_id_idx" ON "rapid_fire_questions"("pool_id");

-- CreateIndex
CREATE INDEX "rapid_fire_sessions_user_id_idx" ON "rapid_fire_sessions"("user_id");

-- AddForeignKey
ALTER TABLE "test_questions" ADD CONSTRAINT "test_questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revision_cards" ADD CONSTRAINT "revision_cards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "revision_decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_revision_progress" ADD CONSTRAINT "user_revision_progress_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "revision_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapid_fire_questions" ADD CONSTRAINT "rapid_fire_questions_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "rapid_fire_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapid_fire_sessions" ADD CONSTRAINT "rapid_fire_sessions_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "rapid_fire_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
