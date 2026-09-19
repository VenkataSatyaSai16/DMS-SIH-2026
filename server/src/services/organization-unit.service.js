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