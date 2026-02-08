-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COACH');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COACH',
    "schoolName" TEXT,
    "primarySport" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT NOT NULL,
    "imageAssetId" TEXT,
    "rawAiResponse" JSONB,
    "processingTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "homeTeamName" TEXT NOT NULL,
    "awayTeamName" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL,
    "awayScore" INTEGER NOT NULL,
    "quarterScores" JSONB,
    "overtime" BOOLEAN NOT NULL DEFAULT false,
    "gameData" JSONB NOT NULL,
    "editableUntil" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "approvedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidationError" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "errorCode" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "fieldPath" TEXT,
    "overridden" BOOLEAN NOT NULL DEFAULT false,
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidationError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditHistory" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "editedBy" TEXT NOT NULL,
    "editedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fieldPath" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,

    CONSTRAINT "EditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_schoolName_idx" ON "User"("schoolName");

-- CreateIndex
CREATE INDEX "User_verifiedAt_idx" ON "User"("verifiedAt");

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Submission_status_idx" ON "Submission"("status");

-- CreateIndex
CREATE INDEX "Submission_sport_idx" ON "Submission"("sport");

-- CreateIndex
CREATE INDEX "Submission_createdAt_idx" ON "Submission"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Game_submissionId_key" ON "Game"("submissionId");

-- CreateIndex
CREATE INDEX "Game_sport_idx" ON "Game"("sport");

-- CreateIndex
CREATE INDEX "Game_date_idx" ON "Game"("date");

-- CreateIndex
CREATE INDEX "Game_sport_date_idx" ON "Game"("sport", "date");

-- CreateIndex
CREATE INDEX "Game_homeTeamName_idx" ON "Game"("homeTeamName");

-- CreateIndex
CREATE INDEX "Game_awayTeamName_idx" ON "Game"("awayTeamName");

-- CreateIndex
CREATE INDEX "Game_editableUntil_idx" ON "Game"("editableUntil");

-- CreateIndex
CREATE INDEX "Game_deletedAt_idx" ON "Game"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Game_homeTeamName_awayTeamName_date_key" ON "Game"("homeTeamName", "awayTeamName", "date");

-- CreateIndex
CREATE INDEX "ValidationError_submissionId_idx" ON "ValidationError"("submissionId");

-- CreateIndex
CREATE INDEX "ValidationError_errorCode_idx" ON "ValidationError"("errorCode");

-- CreateIndex
CREATE INDEX "ValidationError_createdAt_idx" ON "ValidationError"("createdAt");

-- CreateIndex
CREATE INDEX "EditHistory_gameId_idx" ON "EditHistory"("gameId");

-- CreateIndex
CREATE INDEX "EditHistory_editedAt_idx" ON "EditHistory"("editedAt");

-- CreateIndex
CREATE INDEX "EditHistory_fieldPath_idx" ON "EditHistory"("fieldPath");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
