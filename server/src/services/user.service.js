import bcrypt from "bcrypt";
import prisma from "../config/db.js";

export const createUser = async ({
  name,
  email,
  password,
  unitId,
  roleId,
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  if (unitId) {
    const unit = await prisma.organizationUnit.findUnique({
      where: { id: unitId },
    });

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
  }

  if (roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      const error = new Error("Role not found");
      error.statusCode = 404;
      throw error;
    }

    if (!role.isActive) {
      const error = new Error("Role is inactive");
      error.statusCode = 400;
      throw error;
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    if (unitId) {
      await tx.userMembership.create({
        data: {
          userId: user.id,
          unitId,
        },
      });
    }

    if (roleId) {
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId,
        },
      });
    }

    return tx.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,

        memberships: {
          where: {
            isActive: true,
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

        roles: {
          where: {
            isActive: true,
          },
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });
  });
};


export const getUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,

      memberships: {
        where: {
          isActive: true,
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

      roles: {
        where: {
          isActive: true,
        },
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};


export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },

    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      memberships: {
        include: {
          unit: {
            select: {
              id: true,
              name: true,
              code: true,
              isActive: true,
            },
          },
        },
      },

      roles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};


export const updateUser = async (
  id,
  { name, email, password, isActive }
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  let hashedPassword;

  if (password !== undefined) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  return prisma.user.update({
    where: { id },

    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(hashedPassword !== undefined && {
        password: hashedPassword,
      }),
      ...(isActive !== undefined && { isActive }),
    },

    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};


export const deactivateUser = async (id) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!existingUser.isActive) {
    const error = new Error("User is already inactive");
    error.statusCode = 400;
    throw error;
  }

  return prisma.user.update({
    where: { id },

    data: {
      isActive: false,
    },

    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      updatedAt: true,
    },
  });
};


export const assignUserToUnit = async (userId, unitId) => {
  const [user, unit] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
    }),

    prisma.organizationUnit.findUnique({
      where: { id: unitId },
    }),
  ]);

  if (!user) {
    const error = new Error("User not found");
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

  const existingMembership = await prisma.userMembership.findFirst({
    where: {
      userId,
      unitId,
      isActive: true,
    },
  });

  if (existingMembership) {
    const error = new Error("User is already assigned to this unit");
    error.statusCode = 409;
    throw error;
  }

  return prisma.userMembership.create({
    data: {
      userId,
      unitId,
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


export const assignRoleToUser = async (
  userId,
  { roleId, unitId, scope }
) => {
  const [user, role] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
    }),

    prisma.role.findUnique({
      where: { id: roleId },
    }),
  ]);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (!role) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  if (!role.isActive) {
    const error = new Error("Role is inactive");
    error.statusCode = 400;
    throw error;
  }

  if (unitId) {
    const unit = await prisma.organizationUnit.findUnique({
      where: { id: unitId },
    });

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
  }

  const existingRole = await prisma.userRole.findFirst({
    where: {
      userId,
      roleId,
      unitId: unitId ?? null,
      isActive: true,
    },
  });

  if (existingRole) {
    const error = new Error(
      "User already has this role in this organization unit"
    );
    error.statusCode = 409;
    throw error;
  }

  return prisma.userRole.create({
    data: {
      userId,
      roleId,
      unitId: unitId ?? null,
      scope,
    },

    include: {
      role: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },

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

export const updateUserRoleScope = async (userRoleId, scope) => {
  const userRole = await prisma.userRole.findUnique({
    where: {
      id: userRoleId,
    },
  });

  if (!userRole) {
    const error = new Error("User role assignment not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.userRole.update({
    where: {
      id: userRoleId,
    },
    data: {
      scope,
    },
    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
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