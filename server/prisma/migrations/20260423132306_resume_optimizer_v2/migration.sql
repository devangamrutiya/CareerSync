-- CreateTable
CREATE TABLE "ResumeRun" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "originalResumeFileUrl" TEXT NOT NULL,
    "originalJdText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ResumeRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParsedResume" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "ParsedResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParsedJobDescription" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "ParsedJobDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisResult" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "AnalysisResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suggestion" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalResume" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "html" TEXT,
    "pdfUrl" TEXT,
    "docxUrl" TEXT,

    CONSTRAINT "FinalResume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParsedResume_runId_key" ON "ParsedResume"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "ParsedJobDescription_runId_key" ON "ParsedJobDescription"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalysisResult_runId_key" ON "AnalysisResult"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "Suggestion_runId_key" ON "Suggestion"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalResume_runId_key" ON "FinalResume"("runId");

-- AddForeignKey
ALTER TABLE "ResumeRun" ADD CONSTRAINT "ResumeRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParsedResume" ADD CONSTRAINT "ParsedResume_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ResumeRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParsedJobDescription" ADD CONSTRAINT "ParsedJobDescription_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ResumeRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisResult" ADD CONSTRAINT "AnalysisResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ResumeRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ResumeRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalResume" ADD CONSTRAINT "FinalResume_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ResumeRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
