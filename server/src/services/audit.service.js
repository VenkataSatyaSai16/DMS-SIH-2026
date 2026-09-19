import prisma from "../config/db.js";

export const createAuditLog = async ({
  userId,
  action,
  resource,
  resourceId,
  result,
  ipAddress,
  userAgent,
  metadata,
}) => {
  return prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      action,
      resource,
      resourceId: resourceId ?? null,
      result,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      metadata: metadata ?? undefined,
    },
  });
};