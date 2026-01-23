/*
  Warnings:

  - The primary key for the `UserPractice` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `practiceKey` on the `UserPractice` table. All the data in the column will be lost.
  - Added the required column `practiceId` to the `UserPractice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPractice" DROP CONSTRAINT "UserPractice_pkey",
DROP COLUMN "practiceKey",
ADD COLUMN     "practiceId" TEXT NOT NULL,
ADD CONSTRAINT "UserPractice_pkey" PRIMARY KEY ("userId", "practiceId");

-- CreateTable
CREATE TABLE "Practice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Practice_ownerId_idx" ON "Practice"("ownerId");

-- CreateIndex
CREATE INDEX "UserPractice_practiceId_idx" ON "UserPractice"("practiceId");

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPractice" ADD CONSTRAINT "UserPractice_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPracticeCompletion" ADD CONSTRAINT "DailyPracticeCompletion_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
