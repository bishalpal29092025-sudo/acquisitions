CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "users" ADD COLUMN "public_id" varchar(36);

UPDATE "users"
SET "public_id" = gen_random_uuid()::text
WHERE "public_id" IS NULL;

ALTER TABLE "users"
ALTER COLUMN "public_id" SET DEFAULT gen_random_uuid()::text;

ALTER TABLE "users"
ALTER COLUMN "public_id" SET NOT NULL;

ALTER TABLE "users"
ADD CONSTRAINT "users_public_id_unique" UNIQUE("public_id");
