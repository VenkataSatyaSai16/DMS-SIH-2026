import { randomUUID } from "node:crypto";

import prisma from "../config/db.js";
import { calculateSHA256 } from "../services/file-hash.service.js";
import {
  uploadCaseFileToStorage,
  deleteFileFromStorage,
} from "../services/file-storage.service.js";
import { EVIDENCE_CATEGORIES } from "../config/evidence.js";
import { createIntegrityCommitment } from "../services/integrity-commitment.service.js";
import { anchorEvidenceCommitment } from "../services/blockchain.service.js";
import { extractTextFromImage } from "../services/ocr.service.js";

export const getCaseFiles = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { search, category } = req.query;

    const whereClause = {
      caseId,
    };

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { originalName: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { ocrText: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const caseFiles = await prisma.caseFile.findMany({
      where: whereClause,
      select: {
        id: true,
        caseId: true,
        originalName: true,
        displayName: true,
        storageKey: true,
        mimeType: true,
        size: true,
        sha256: true,
        category: true,
        description: true,
        tags: true,
        ocrLanguage: true,
        ocrText: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Case files fetched successfully",
      data: caseFiles.map((file) => ({
        ...file,
        size: file.size.toString(),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch case files:", error);

    return res.status(500).json({
      message: "Failed to fetch case files",
    });
  }
};

export const uploadCaseFile = async (req, res) => {
  try {
    const { caseId } = req.params;
    const file = req.file;
    const { displayName, category, description, tags } = req.body;

    if (category && !EVIDENCE_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid evidence category",
        allowedCategories: EVIDENCE_CATEGORIES,
      });
    }

    let normalizedTags = [];

    if (tags) {
      normalizedTags = tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);
    }

    if (!file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const existingCase = await prisma.case.findUnique({
      where: {
        id: caseId,
      },
      select: {
        id: true,
      },
    });

    if (!existingCase) {
      return res.status(404).json({
        message: "Case not found",
      });
    }

    const fileId = randomUUID();

    const sha256 = calculateSHA256(file.buffer);
    const blockchainCommitment = createIntegrityCommitment(sha256);

    const storageKey = await uploadCaseFileToStorage({
      file,
      caseId,
      fileId,
    });

    // Perform OCR text extraction if file is an image
    let extractedOcrText = null;
    let ocrLanguage = null;

    if (file.mimetype && (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf")) {
      try {
        extractedOcrText = await extractTextFromImage({
          buffer: file.buffer,
          language: "eng",
        });
        if (extractedOcrText) {
          ocrLanguage = "eng";
        }
      } catch (ocrErr) {
        console.error("OCR extraction error:", ocrErr.message);
      }
    }

    try {
      const caseFile = await prisma.caseFile.create({
        data: {
          id: fileId,
          caseId,
          uploadedById: req.user.sub,
          originalName: file.originalname,
          displayName: displayName || null,
          category: category || null,
          description: description || null,
          tags: normalizedTags,
          storageKey,
          mimeType: file.mimetype,
          size: BigInt(file.size),
          sha256,
          ocrLanguage,
          ocrText: extractedOcrText || null,
          blockchainCommitment,
          blockchainStatus: "PENDING",
          blockchainNetwork: "hardhat-local",
        },
      });

      try {
        const blockchainResult = await anchorEvidenceCommitment({
          fileId: caseFile.id,
          commitment: blockchainCommitment,
        });

        const updatedCaseFile = await prisma.caseFile.update({
          where: {
            id: caseFile.id,
          },
          data: {
            blockchainStatus: "ANCHORED",
            blockchainTxHash: blockchainResult.transactionHash,
            blockchainFileId: blockchainResult.blockchainFileId,
          },
        });

        return res.status(201).json({
          message: "Case file uploaded and blockchain anchored successfully",
          data: {
            id: updatedCaseFile.id,
            caseId: updatedCaseFile.caseId,
            originalName: updatedCaseFile.originalName,
            displayName: updatedCaseFile.displayName,
            category: updatedCaseFile.category,
            description: updatedCaseFile.description,
            storageKey: updatedCaseFile.storageKey,
            mimeType: updatedCaseFile.mimeType,
            size: updatedCaseFile.size.toString(),
            sha256: updatedCaseFile.sha256,
            blockchainCommitment: updatedCaseFile.blockchainCommitment,
            blockchainStatus: updatedCaseFile.blockchainStatus,
            blockchainNetwork: updatedCaseFile.blockchainNetwork,
            blockchainTxHash: updatedCaseFile.blockchainTxHash,
            blockchainFileId: updatedCaseFile.blockchainFileId,
          },
        });
      } catch (blockchainError) {
        console.error("Blockchain anchoring failed:", blockchainError);

        await prisma.caseFile.update({
          where: {
            id: caseFile.id,
          },
          data: {
            blockchainStatus: "FAILED",
          },
        });

        return res.status(202).json({
          message:
            "Case file uploaded successfully, but blockchain anchoring failed",
          data: {
            id: caseFile.id,
            caseId: caseFile.caseId,
            blockchainStatus: "FAILED",
          },
        });
      }
    } catch (dbError) {
      console.error("Database error after storage upload:", dbError);

      try {
        await deleteFileFromStorage(storageKey);
        console.log("Orphaned storage object deleted:", storageKey);
      } catch (cleanupError) {
        console.error(
          "Failed to delete orphaned storage object:",
          cleanupError,
        );
      }

      return res.status(500).json({
        message: "File upload failed because metadata could not be saved",
      });
    }
  } catch (error) {
    console.error("Case file upload failed:", error);

    return res.status(500).json({
      message: "Case file upload failed",
      error: error.message,
    });
  }
};
