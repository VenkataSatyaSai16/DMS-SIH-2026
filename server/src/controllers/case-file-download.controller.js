import prisma from "../config/db.js";
import { getFileFromStorage } from "../services/file-storage.service.js";

export const downloadCaseFile = async (req, res) => {
  try {
    const { caseId, fileId } = req.params;

    const caseFile = await prisma.caseFile.findFirst({
      where: {
        id: fileId,
        caseId,
      },
    });

    if (!caseFile) {
      return res.status(404).json({
        message: "Case file not found",
      });
    }

    const storageResponse = await getFileFromStorage(caseFile.storageKey);

    res.setHeader(
      "Content-Type",
      caseFile.mimeType
    );

    res.setHeader(
      "Content-Length",
      caseFile.size.toString()
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${caseFile.originalName}"`
    );

    storageResponse.Body.pipe(res);
  } catch (error) {
    console.error("Case file download failed:", error);

    return res.status(500).json({
      message: "Case file download failed",
    });
  }
};