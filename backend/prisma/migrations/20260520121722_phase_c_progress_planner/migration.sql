-- CreateEnum
CREATE TYPE "TargetRole" AS ENUM ('BACKEND', 'FRONTEND', 'FULLSTACK', 'DEVOPS', 'DATA_ENGINEER');

-- CreateEnum
CREATE TYPE "PlannerSkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "concept_mastery" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "mastery_score" INTEGER NOT NULL DEFAULT 0,
    "lessons_completed" INTEGER NOT NULL DEFAULT 0,
    "practice_attempts" INTEGER NOT NULL DEFAULT 0,
    "correct_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concept_mastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_activity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_date" DATE NOT NULL,
    "questions_answered" INTEGER NOT NULL DEFAULT 0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "minutes_active" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_role" "TargetRole" NOT NULL,
    "skill_level" "PlannerSkillLevel" NOT NULL,
    "hours_per_day" INTEGER NOT NULL DEFAULT 2,
    "duration_weeks" INTEGER NOT NULL DEFAULT 8,
    "target_date" TIMESTAMP(3),
    "roadmap_json" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_checkpoints" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "day_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "reference_id" TEXT,
    "estimated_minutes" INTEGER NOT NULL DEFAULT 20,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "concept_mastery_user_id_idx" ON "concept_mastery"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "concept_mastery_user_id_topic_id_key" ON "concept_mastery"("user_id", "topic_id");

-- CreateIndex
CREATE INDEX "daily_activity_user_id_idx" ON "daily_activity"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activity_user_id_activity_date_key" ON "daily_activity"("user_id", "activity_date");

-- CreateIndex
CREATE UNIQUE INDEX "learning_plans_user_id_key" ON "learning_plans"("user_id");

-- CreateIndex
CREATE INDEX "plan_checkpoints_plan_id_idx" ON "plan_checkpoints"("plan_id");

-- CreateIndex
CREATE INDEX "plan_checkpoints_plan_id_week_number_day_number_idx" ON "plan_checkpoints"("plan_id", "week_number", "day_number");

-- AddForeignKey
ALTER TABLE "concept_mastery" ADD CONSTRAINT "concept_mastery_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_checkpoints" ADD CONSTRAINT "plan_checkpoints_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "learning_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
