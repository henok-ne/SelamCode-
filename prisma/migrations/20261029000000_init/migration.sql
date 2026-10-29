CREATE TABLE "users" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "display_name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'student',
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE TABLE "sessions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "token_hash" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires_at" DATETIME NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");
CREATE TABLE "exercises" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "starter_code" TEXT NOT NULL,
  "expected_output" TEXT NOT NULL,
  "test_cases_json" TEXT NOT NULL,
  "concept_tags_json" TEXT NOT NULL,
  "function_name" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "exercises_slug_key" ON "exercises"("slug");
CREATE TABLE "submissions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "exercise_id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "runtime_output" TEXT NOT NULL,
  "error_message" TEXT,
  "execution_mode" TEXT NOT NULL DEFAULT 'preview',
  "test_results_json" TEXT NOT NULL,
  "is_final" BOOLEAN NOT NULL DEFAULT false,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "submissions_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "submissions_user_id_exercise_id_created_at_idx" ON "submissions"("user_id", "exercise_id", "created_at");
CREATE TABLE "hint_requests" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "submission_id" TEXT NOT NULL,
  "hint_level" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'debugging',
  "prompt_context_json" TEXT NOT NULL,
  "ai_response" TEXT NOT NULL,
  "was_helpful" BOOLEAN,
  "language" TEXT NOT NULL DEFAULT 'en',
  "provider" TEXT NOT NULL DEFAULT 'offline',
  "notice" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hint_requests_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "hint_requests_submission_id_hint_level_key" ON "hint_requests"("submission_id", "hint_level");
CREATE TABLE "feedback_events" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "hint_request_id" TEXT NOT NULL,
  "rating" BOOLEAN NOT NULL,
  "comment" TEXT,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "feedback_events_hint_request_id_fkey" FOREIGN KEY ("hint_request_id") REFERENCES "hint_requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "feedback_events_hint_request_id_idx" ON "feedback_events"("hint_request_id");
PRAGMA foreign_keys=ON;
