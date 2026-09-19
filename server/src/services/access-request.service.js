import prisma from "../config/db.js";

export const createAccessRequest = async ({
  caseId,
  requesterId,
  reason,
}) => {
  const [caseRecord, requester] = await Promise.all([
    prisma.case.findUnique({
      where: { id: caseId },
    }),

    prisma.user.findUnique({
      where: { id: requesterId },
    }),
  ]);

  if (!caseRecord) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  if (!requester || !requester.isActive) {
    const error = new Error("Requester not found or inactive");
    error.statusCode = 404;
    throw error;
  }

  const existingRequest = await prisma.accessRequest.findFirst({
    where: {
      caseId,
      requesterId,
      status: "PENDING",
    },
  });

  if (existingRequest) {
    const error = new Error("Access request already pending");
    error.statusCode = 409;
    throw error;
  }

  return prisma.accessRequest.create({
    data: {
      caseId,
      requesterId,
      reason,
    },
  });
};

export const reviewAccessRequest = async ({
  requestId,
  reviewerId,
  approve,
}) => {
  const request = await prisma.accessRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    const error = new Error("Access request not found");
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== "PENDING") {
    const error = new Error("Access request has already been reviewed");
    error.statusCode = 409;
    throw error;
  }

  const status = approve ? "APPROVED" : "REJECTED";

  return prisma.$transaction(async (tx) => {
    const updatedRequest = await tx.accessRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewerId,
        reviewedAt: new Date(),
      },
    });

    if (approve) {
      await tx.caseAccess.upsert({
        where: {
          caseId_userId: {
            caseId: request.caseId,
            userId: request.requesterId,
          },
        },
        update: {
          grantedById: reviewerId,
          grantedAt: new Date(),
          isActive: true,
        },
        create: {
          caseId: request.caseId,
          userId: request.requesterId,
          grantedById: reviewerId,
        },
      });
    }

    return updatedRequest;
  });
};