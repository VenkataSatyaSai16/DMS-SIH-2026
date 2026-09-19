import prisma from "../config/db.js";

export const grantCaseAccess = async ({
  caseId,
  userId,
  grantedById,
  expiresAt,
}) => {
  const [caseRecord, user, grantedBy] = await Promise.all([
    prisma.case.findUnique({
      where: { id: caseId },
    }),

    prisma.user.findUnique({
      where: { id: userId },
    }),

    prisma.user.findUnique({
      where: { id: grantedById },
    }),
  ]);

  if (!caseRecord) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!grantedBy) {
    const error = new Error("Granting user not found");
    error.statusCode = 404;
    throw error;
  }

  const existingAccess = await prisma.caseAccess.findUnique({
    where: {
      caseId_userId: {
        caseId,
        userId,
      },
    },
  });

  if (existingAccess) {
    return prisma.caseAccess.update({
      where: {
        id: existingAccess.id,
      },
      data: {
        grantedById,
        expiresAt: expiresAt ?? null,
        isActive: true,
        grantedAt: new Date(),
      },
    });
  }

  return prisma.caseAccess.create({
    data: {
      caseId,
      userId,
      grantedById,
      expiresAt: expiresAt ?? null,
    },
  });
};

export const revokeCaseAccess = async (caseId, userId) => {
  const access = await prisma.caseAccess.findUnique({
    where: {
      caseId_userId: {
        caseId,
        userId,
      },
    },
  });

  if (!access) {
    const error = new Error("Case access grant not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.caseAccess.update({
    where: {
      id: access.id,
    },
    data: {
      isActive: false,
    },
  });
};