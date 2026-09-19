-- CreateTable
CREATE TABLE "CaseCounter" (
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CaseCounter_pkey" PRIMARY KEY ("year")
);
