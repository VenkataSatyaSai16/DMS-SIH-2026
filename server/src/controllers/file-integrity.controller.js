import prisma from "../config/db.js";
import { getFileFromStorage } from "../services/file-storage.service.js";
import { verifyFileIntegrity } from "../services/file-integrity.service.js";
import { verifyEvidenceCommitment } from "../services/blockchain.service.js";
import { createIntegrityCommitment } from "../services/integrity-commitment.service.js";

export const verifyCaseFileIntegrity = async (req, res) => {
  try {
    const { caseId, fileId } = req.params;

    const caseFile = await prisma.caseFile.findFirst({
      where: {
        id: fileId,
        caseId,
      },
      select: {
        id: true,
        caseId: true,
        originalName: true,
        storageKey: true,
        sha256: true,
        blockchainStatus: true,
        blockchainTxHash: true,
        blockchainFileId: true,
        blockchainCommitment: true,
        blockchainNetwork: true,
      },
    });

    if (!caseFile) {
      return res.status(404).json({
        message: "Case file not found",
      });
    }

    const storageResponse = await getFileFromStorage(caseFile.storageKey);

    const verification = await verifyFileIntegrity({
      fileStream: storageResponse.Body,
      expectedHash: caseFile.sha256,
    });

    const currentCommitment = createIntegrityCommitment(
      verification.actualHash,
    );

    let blockchainVerification = null;

    if (caseFile.blockchainStatus === "ANCHORED") {
      blockchainVerification = await verifyEvidenceCommitment({
        fileId: caseFile.id,
        commitment: currentCommitment,
      });
    }

    return res.status(200).json({
      message:
        verification.verified &&
        (caseFile.blockchainStatus !== "ANCHORED" ||
          blockchainVerification?.verified)
          ? "File integrity verified"
          : "File integrity verification failed",

      data: {
        fileId: caseFile.id,
        caseId: caseFile.caseId,
        originalName: caseFile.originalName,

        fileIntegrity: {
          verified: verification.verified,
          expectedHash: verification.expectedHash,
          actualHash: verification.actualHash,
        },

        blockchainIntegrity: {
          verified: blockchainVerification?.verified ?? false,
          status: caseFile.blockchainStatus,
          network: caseFile.blockchainNetwork,
          transactionHash: caseFile.blockchainTxHash,
          blockchainFileId: caseFile.blockchainFileId,
          storedCommitment: caseFile.blockchainCommitment,
          currentCommitment,
        },
      },
    });
  } catch (error) {
    console.error("File integrity verification failed:", error);

    return res.status(500).json({
      message: "File integrity verification failed",
    });
  }
};
