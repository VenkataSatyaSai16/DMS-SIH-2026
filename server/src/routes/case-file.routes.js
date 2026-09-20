import express from "express";
import multer from "multer";

import { uploadCaseFile , getCaseFiles } from "../controllers/case-file.controller.js";
import { authenticate } from "../middleware/auth.js";
import { zeroTrustCase } from "../middleware/zero-trust.js";
import { downloadCaseFile } from "../controllers/case-file-download.controller.js";
import { verifyCaseFileIntegrity } from "../controllers/file-integrity.controller.js";
import { searchCaseFiles } from "../controllers/case-file-search.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const isAllowed = 
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("audio/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/pdf" ||
      file.mimetype === "text/plain";

    if (!isAllowed) {
      return cb(new Error("Unsupported file type"));
    }

    cb(null, true);
  },
});

router.post(
  "/:caseId/files",
  authenticate,
  zeroTrustCase("EVIDENCE_UPLOAD"),
  (req, res, next) => {
    upload.single("file")(req, res, (error) => {
      if (error) {
        console.error("File validation failed:", error);

        return res.status(400).json({
          message: error.message,
        });
      }

      next();
    });
  },
  uploadCaseFile
);

router.get(
  "/:caseId/files",
  authenticate,
  zeroTrustCase("EVIDENCE_VIEW"),
  getCaseFiles
);

router.get(
  "/:caseId/files/:fileId/download",
  authenticate,
  zeroTrustCase("EVIDENCE_DOWNLOAD"),
  downloadCaseFile
);

router.get(
  "/:caseId/files/:fileId/verify",
  authenticate,
  zeroTrustCase("EVIDENCE_VERIFY"),
  verifyCaseFileIntegrity
);

router.get(
  "/:caseId/files/search",
  authenticate,
  zeroTrustCase("EVIDENCE_VIEW"),
  searchCaseFiles
);

export default router;