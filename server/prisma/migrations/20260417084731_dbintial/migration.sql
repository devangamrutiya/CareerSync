/*
  Warnings:

  - A unique constraint covering the columns `[userId,sourceEmailId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleConnectedAt" TIMESTAMP(3),
ADD COLUMN     "googleRefreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Job_userId_sourceEmailId_key" ON "Job"("userId", "sourceEmailId");
