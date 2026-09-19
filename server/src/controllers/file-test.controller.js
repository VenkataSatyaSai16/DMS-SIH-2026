import { uploadFileToStorage , getFileFromStorage } from "../services/file-storage.service.js";

export const uploadTestFile = async (req, res) => {
  try {
    const result = await uploadFileToStorage(req.file);

    return res.status(201).json({
      message: "File uploaded successfully",
      data: result,
    });
  } catch (error) {
    console.error("File upload failed:", error);

    return res.status(500).json({
      message: "File upload failed",
      error: error.message,
    });
  }
};

export const downloadTestFile = async (req, res) => {
  try {
    // console.log("Query:", req.query);
    // console.log(req.params);
    const objectKey = req.query.key;

    const response = await getFileFromStorage(objectKey);

    if (response.ContentType) {
      res.setHeader("Content-Type", response.ContentType);
    }

    if (response.ContentLength !== undefined) {
      res.setHeader("Content-Length", response.ContentLength);
    }

    if (response.Body) {
      response.Body.pipe(res);
    }
  } catch (error) {
    console.error("File download failed:", error);

    return res.status(500).json({
      message: "File download failed",
      error: error.message,
    });
  }
};