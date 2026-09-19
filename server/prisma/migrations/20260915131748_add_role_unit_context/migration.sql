/*
  Warnings:

  - A unique constraint covering the columns `[userId,roleId,unitId]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserRole_userId_roleId_key";

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "unitId" TEXT;

-- CreateIndex
CREATE INDEX "UserRole_unitId_idx" ON "UserRole"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_unitId_key" ON "UserRole"("userId", "roleId", "unitId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "OrganizationUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
