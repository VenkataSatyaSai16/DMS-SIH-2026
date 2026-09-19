import prisma from "../config/db.js";

export const searchCaseFiles = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { q, category } = req.query;

    const filters = {
      caseId,
    };

    if (category) {
      filters.category = category;
    }

    if (q) {
      filters.OR = [
        {
          displayName: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          originalName: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: q.toLowerCase(),
          },
        },
      ];
    }

    const files = await prisma.caseFile.findMany({
      where: filters,
      select: {
        id: true,
        caseId: true,
        originalName: true,
        displayName: true,
        mimeType: true,
        size: true,
        sha256: true,
        category: true,
        description: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Case files searched successfully",
      count: files.length,
      data: files.map((file) => ({
        ...file,
        size: file.size.toString(),
      })),
    });
  } catch (error) {
    console.error("Case file search failed:", error);

    return res.status(500).json({
      message: "Case file search failed",
    });
  }
};