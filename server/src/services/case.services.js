import prisma from "../config/db.js";
import { getUserAuthorization } from "../authorization/access.js";
import { hasCaseScopeAccess } from "../authorization/scope.js";

const generateCaseId = async (tx) => {
  const year = new Date().getFullYear();

  const counter = await tx.caseCounter.upsert({
    where: { year },

    update: {
      lastNumber: {
        increment: 1,
      },
    },

    create: {
      year,
      lastNumber: 1,
    },
  });

  return `DMS-${year}-${String(counter.lastNumber).padStart(6, "0")}`;
};

export const createCase = async ({
  title,
  description,
  caseType = "CRIMINAL",
  status = "ACTIVE",
  priority = "NORMAL",
  unitId,
  createdById,
}) => {
  const user = await prisma.user.findUnique({
    where: { id: createdById },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("User is inactive");
    error.statusCode = 400;
    throw error;
  }

  let targetUnitId = unitId;
  if (!targetUnitId) {
    const membership = await prisma.userMembership.findFirst({
      where: { userId: createdById, isActive: true },
    });
    if (membership) {
      targetUnitId = membership.unitId;
    } else {
      const firstUnit = await prisma.organizationUnit.findFirst({
        where: { isActive: true },
      });
      if (firstUnit) {
        targetUnitId = firstUnit.id;
      }
    }
  }

  if (!targetUnitId) {
    const error = new Error("Organization unit is required for case creation");
    error.statusCode = 400;
    throw error;
  }

  const unit = await prisma.organizationUnit.findUnique({
    where: { id: targetUnitId },
  });

  if (!unit || !unit.isActive) {
    const error = new Error("Organization unit not found or is inactive");
    error.statusCode = 404;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const caseId = await generateCaseId(tx);

    return tx.case.create({
      data: {
        caseId,
        title,
        description,
        caseType: caseType || "CRIMINAL",
        status: status || "ACTIVE",
        priority: priority || "NORMAL",
        createdById,

        units: {
          create: {
            unitId: targetUnitId,
          },
        },

        assignments: {
          create: {
            userId: createdById,
            assignedById: createdById,
            status: "ACTIVE",
          },
        },
      },

      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        units: {
          include: {
            unit: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },

        assignments: {
          where: {
            status: "ACTIVE",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  });
};

export const getCases = async (userId) => {
  const authorizations = await getUserAuthorization(userId);

  const viewAuthorizations = authorizations.filter((authorization) =>
    authorization.permissions.includes("CASE_VIEW")
  );

  if (viewAuthorizations.length === 0) {
    return [];
  }

  const allCases = await prisma.case.findMany({
    include: {
      units: {
        where: {
          status: "ACTIVE",
        },
        include: {
          unit: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignments: {
        where: {
          status: "ACTIVE",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const accessibleCases = [];

  for (const caseRecord of allCases) {
    let allowed = caseRecord.createdById === userId;

    if (!allowed) {
      for (const authorization of viewAuthorizations) {
        if (
          await hasCaseScopeAccess({
            userId,
            caseId: caseRecord.id,
            scope: authorization.scope,
          })
        ) {
          allowed = true;
          break;
        }
      }
    }

    if (allowed) {
      accessibleCases.push(caseRecord);
    }
  }

  return accessibleCases;
};

export const getCaseById = async (id) => {
  const caseRecord = await prisma.case.findUnique({
    where: { id },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      units: {
        where: {
          status: "ACTIVE",
        },

        include: {
          unit: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      },

      assignments: {
        where: {
          status: "ACTIVE",
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!caseRecord) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  return caseRecord;
};

export const updateCase = async (
  id,
  {
    title,
    description,
    caseType,
    status,
    priority,
  }
) => {
  const existingCase = await prisma.case.findUnique({
    where: { id },
  });

  if (!existingCase) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.case.update({
    where: { id },

    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(caseType !== undefined && { caseType }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
    },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

export const assignCaseToUnit = async (
  caseId,
  unitId,
  assignedById
) => {
  const [caseRecord, unit, assignedBy] = await Promise.all([
    prisma.case.findUnique({
      where: { id: caseId },
    }),

    prisma.organizationUnit.findUnique({
      where: { id: unitId },
    }),

    prisma.user.findUnique({
      where: { id: assignedById },
    }),
  ]);

  if (!caseRecord) {
    const error = new Error("Case not found");
    error.statusCode = 404;
    throw error;
  }

  if (!unit) {
    const error = new Error("Organization unit not found");
    error.statusCode = 404;
    throw error;
  }

  if (!unit.isActive) {
    const error = new Error("Organization unit is inactive");
    error.statusCode = 400;
    throw error;
  }

  if (!assignedBy) {
    const error = new Error("Assigning user not found");
    error.statusCode = 404;
    throw error;
  }

  const existing = await prisma.caseUnit.findUnique({
    where: {
      caseId_unitId: {
        caseId,
        unitId,
      },
    },
  });

  if (existing && existing.status === "ACTIVE") {
    const error = new Error(
      "Case is already assigned to this organization unit"
    );
    error.statusCode = 409;
    throw error;
  }

  if (existing) {
    return prisma.caseUnit.update({
      where: { id: existing.id },

      data: {
        status: "ACTIVE",
        assignedAt: new Date(),
        assignedById,
      },
    });
  }

  return prisma.caseUnit.create({
    data: {
      caseId,
      unitId,
      assignedById,
      status: "ACTIVE",
    },

    include: {
      unit: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
    },
  });
};

export const assignCaseToUser = async (
  caseId,
  userId,
  assignedById
) => {
  const [caseRecord, user, assignedBy] = await Promise.all([
    prisma.case.findUnique({
      where: { id: caseId },
    }),

    prisma.user.findUnique({
      where: { id: userId },
    }),

    prisma.user.findUnique({
      where: { id: assignedById },
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

  if (!user.isActive) {
    const error = new Error("User is inactive");
    error.statusCode = 400;
    throw error;
  }

  if (!assignedBy) {
    const error = new Error("Assigning user not found");
    error.statusCode = 404;
    throw error;
  }

  const existing = await prisma.caseAssignment.findUnique({
    where: {
      caseId_userId: {
        caseId,
        userId,
      },
    },
  });

  if (existing && existing.status === "ACTIVE") {
    const error = new Error(
      "User is already assigned to this case"
    );
    error.statusCode = 409;
    throw error;
  }

  if (existing) {
    return prisma.caseAssignment.update({
      where: { id: existing.id },

      data: {
        status: "ACTIVE",
        assignedAt: new Date(),
        assignedById,
      },
    });
  }

  return prisma.caseAssignment.create({
    data: {
      caseId,
      userId,
      assignedById,
      status: "ACTIVE",
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};