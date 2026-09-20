import prisma from "../config/db.js";

export const createOrganizationUnit = async ({
  name,
  code,
  description,
  parentUnitId,
}) => {
  if (parentUnitId) {
    const parentUnit = await prisma.organizationUnit.findUnique({
      where: {
        id: parentUnitId,
      },
    });

    if (!parentUnit) {
      const error = new Error("Parent organization unit not found");
      error.statusCode = 404;
      throw error;
    }

    if (!parentUnit.isActive) {
      const error = new Error("Parent organization unit is inactive");
      error.statusCode = 400;
      throw error;
    }
  }

  const existingUnit = await prisma.organizationUnit.findUnique({
    where: {
      code,
    },
  });

  if (existingUnit) {
    const error = new Error("Organization unit code already exists");
    error.statusCode = 409;
    throw error;
  }

  return prisma.organizationUnit.create({
    data: {
      name,
      code,
      description,
      parentUnitId: parentUnitId ?? null,
    },
  });
};


export const getOrganizationUnits = async () => {
  return prisma.organizationUnit.findMany({
    orderBy: {
      createdAt: "asc",
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      _count: {
        select: {
          children: true,
          memberships: true,
          caseUnits: true,
        },
      },
    },
  });
};


export const getOrganizationUnitById = async (id) => {
  const unit = await prisma.organizationUnit.findUnique({
    where: {
      id,
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      _count: {
        select: {
          memberships: true,
          caseUnits: true,
        },
      },
    },
  });

  if (!unit) {
    const error = new Error("Organization unit not found");
    error.statusCode = 404;
    throw error;
  }

  return unit;
};


export const updateOrganizationUnit = async (
  id,
  { name, code, description, parentUnitId }
) => {
  const existingUnit = await prisma.organizationUnit.findUnique({
    where: {
      id,
    },
  });

  if (!existingUnit) {
    const error = new Error("Organization unit not found");
    error.statusCode = 404;
    throw error;
  }

  if (code && code !== existingUnit.code) {
    const codeExists = await prisma.organizationUnit.findUnique({
      where: {
        code,
      },
    });

    if (codeExists) {
      const error = new Error("Organization unit code already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  if (parentUnitId !== undefined && parentUnitId !== null) {
    if (parentUnitId === id) {
      const error = new Error(
        "An organization unit cannot be its own parent"
      );
      error.statusCode = 400;
      throw error;
    }

    const parentUnit = await prisma.organizationUnit.findUnique({
      where: {
        id: parentUnitId,
      },
    });

    if (!parentUnit) {
      const error = new Error("Parent organization unit not found");
      error.statusCode = 404;
      throw error;
    }

    if (!parentUnit.isActive) {
      const error = new Error("Parent organization unit is inactive");
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.organizationUnit.update({
    where: {
      id,
    },
    data: {
      ...(name !== undefined && { name }),
      ...(code !== undefined && { code }),
      ...(description !== undefined && { description }),
      ...(parentUnitId !== undefined && { parentUnitId }),
    },
  });
};


export const deactivateOrganizationUnit = async (id) => {
  const existingUnit = await prisma.organizationUnit.findUnique({
    where: {
      id,
    },
  });

  if (!existingUnit) {
    const error = new Error("Organization unit not found");
    error.statusCode = 404;
    throw error;
  }

  if (!existingUnit.isActive) {
    const error = new Error("Organization unit is already inactive");
    error.statusCode = 400;
    throw error;
  }

  return prisma.organizationUnit.update({
    where: {
      id,
    },
    data: {
      isActive: false,
    },
  });
};

export const activateOrganizationUnit = async (id, currentUser) => {
  const existingUnit = await prisma.organizationUnit.findUnique({
    where: {
      id,
    },
  });

  if (!existingUnit) {
    const error = new Error("Organization unit not found");
    error.statusCode = 404;
    throw error;
  }

  if (existingUnit.isActive) {
    const error = new Error("Organization unit is already active");
    error.statusCode = 400;
    throw error;
  }

  if (currentUser && currentUser.sub) {
    const userId = currentUser.sub;

    const userRoles = await prisma.userRole.findMany({
      where: { userId, isActive: true },
      include: { role: true },
    });

    const isSysAdmin = userRoles.some(
      (ur) => ur.role.name === "SYSTEM_ADMINISTRATOR"
    );

    let isAuthorized = isSysAdmin;

    if (!isAuthorized) {
      const userMemberships = await prisma.userMembership.findMany({
        where: { userId, isActive: true },
        select: { unitId: true },
      });

      const userUnitIds = new Set([
        ...userRoles.map((ur) => ur.unitId).filter(Boolean),
        ...userMemberships.map((um) => um.unitId),
      ]);

      const isSupervisor = userRoles.some(
        (ur) =>
          ur.role.name === "INVESTIGATION_SUPERVISOR" ||
          ur.role.name.includes("SUPERVISOR") ||
          ur.role.name === "SYSTEM_ADMINISTRATOR"
      );

      const isUnitHead = isSupervisor && userUnitIds.has(id);
      const isParentUnitHead =
        existingUnit.parentUnitId &&
        isSupervisor &&
        userUnitIds.has(existingUnit.parentUnitId);

      isAuthorized = isUnitHead || isParentUnitHead;
    }

    if (!isAuthorized) {
      const error = new Error(
        "Access denied: Only System Administrator, Unit Head, or Parent Unit Head can activate this organization unit"
      );
      error.statusCode = 403;
      throw error;
    }
  }

  const updatedUnit = await prisma.organizationUnit.update({
    where: {
      id,
    },
    data: {
      isActive: true,
    },
  });

  try {
    await prisma.auditLog.create({
      data: {
        userId: currentUser?.sub || null,
        action: "UNIT_ACTIVATED",
        resource: "ORGANIZATION_UNIT",
        resourceId: id,
        result: "SUCCESS",
        metadata: {
          unitName: updatedUnit.name,
          unitCode: updatedUnit.code,
        },
      },
    });
  } catch (auditErr) {
    console.error("Failed to write audit log for unit activation:", auditErr);
  }

  return updatedUnit;
};