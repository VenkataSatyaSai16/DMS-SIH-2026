-- CreateTable
CREATE TABLE "CaseAccess" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CaseAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseAccess_userId_idx" ON "CaseAccess"("userId");

-- CreateIndex
CREATE INDEX "CaseAccess_caseId_idx" ON "CaseAccess"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "CaseAccess_caseId_userId_key" ON "CaseAccess"("caseId", "userId");

-- AddForeignKey
ALTER TABLE "CaseAccess" ADD CONSTRAINT "CaseAccess_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseAccess" ADD CONSTRAINT "CaseAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
