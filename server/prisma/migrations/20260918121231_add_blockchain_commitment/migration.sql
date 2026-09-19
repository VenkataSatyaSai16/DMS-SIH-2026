-- AlterTable
ALTER TABLE "CaseFile" ADD COLUMN     "blockchainCommitment" TEXT,
ADD COLUMN     "blockchainFileId" TEXT,
ADD COLUMN     "blockchainNetwork" TEXT,
ADD COLUMN     "blockchainStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "blockchainTxHash" TEXT;
