import prisma from "../config/db.js";

export const createRole = async ({ name, description }) => {
  const existingRole = await prisma.role.findUnique({
    where: { name },
  });

  if (existingRole) {
    const error = new Error("Role already exists");
    error.statusCode = 409;
    throw error;
  }

  return prisma.role.create({
    data: {
      name,
      description,
    },
  });
};

export const getRoles = async () => {
  return prisma.role.findMany({
    where: {
      isActive: true,
    },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!role) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  return role;
};

export const updateRole = async (id, { name, description }) => {
  const existingRole = await prisma.role.findUnique({
    where: { id },
  });

  if (!existingRole) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  if (name && name !== existingRole.name) {
    const roleExists = await prisma.role.findUnique({
      where: { name },
    });

    if (roleExists) {
      const error = new Error("Role already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  return prisma.role.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    },
  });
};

export const deactivateRole = async (id) => {
  const existingRole = await prisma.role.findUnique({
    where: { id },
  });

  if (!existingRole) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  if (!existingRole.isActive) {
    const error = new Error("Role is already inactive");
    error.statusCode = 400;
    throw error;
  }

  return prisma.role.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};