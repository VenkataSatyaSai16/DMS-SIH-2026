import prisma from "../config/db.js";

export const createPermission = async ({
  name,
  resource,
  action,
  description,
}) => {
  const existingPermission = await prisma.permission.findUnique({
    where: { name },
  });

  if (existingPermission) {
    const error = new Error("Permission already exists");
    error.statusCode = 409;
    throw error;
  }

  return prisma.permission.create({
    data: {
      name,
      resource,
      action,
      description,
    },
  });
};

export const getPermissions = async () => {
  return prisma.permission.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getPermissionById = async (id) => {
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!permission) {
    const error = new Error("Permission not found");
    error.statusCode = 404;
    throw error;
  }

  return permission;
};

export const updatePermission = async (
  id,
  { name, resource, action, description },
) => {
  const existingPermission = await prisma.permission.findUnique({
    where: { id },
  });

  if (!existingPermission) {
    const error = new Error("Permission not found");
    error.statusCode = 404;
    throw error;
  }

  if (name && name !== existingPermission.name) {
    const nameExists = await prisma.permission.findUnique({
      where: { name },
    });

    if (nameExists) {
      const error = new Error("Permission already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  return prisma.permission.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(resource !== undefined && { resource }),
      ...(action !== undefined && { action }),
      ...(description !== undefined && { description }),
    },
  });
};

export const deactivatePermission = async (id) => {
  const existingPermission = await prisma.permission.findUnique({
    where: { id },
  });

  if (!existingPermission) {
    const error = new Error("Permission not found");
    error.statusCode = 404;
    throw error;
  }

  if (!existingPermission.isActive) {
    const error = new Error("Permission is already inactive");
    error.statusCode = 400;
    throw error;
  }

  return prisma.permission.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};

export const assignPermissionToRole = async (roleId, permissionId) => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  if (!role.isActive) {
    const error = new Error("Cannot assign permission to an inactive role");
    error.statusCode = 400;
    throw error;
  }

  const permission = await prisma.permission.findUnique({
    where: { id: permissionId },
  });

  if (!permission) {
    const error = new Error("Permission not found");
    error.statusCode = 404;
    throw error;
  }

  if (!permission.isActive) {
    const error = new Error("Cannot assign an inactive permission to a role");
    error.statusCode = 400;
    throw error;
  }

  const existingAssignment = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId,
      },
    },
  });

  if (existingAssignment) {
    const error = new Error("Permission is already assigned to this role");
    error.statusCode = 409;
    throw error;
  }

  return prisma.rolePermission.create({
    data: {
      roleId,
      permissionId,
    },
    include: {
      role: true,
      permission: true,
    },
  });
};

export const removePermissionFromRole = async (roleId, permissionId) => {
  const assignment = await prisma.rolePermission.findUnique({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId,
      },
    },
  });

  if (!assignment) {
    const error = new Error("Permission is not assigned to this role");
    error.statusCode = 404;
    throw error;
  }

  await prisma.rolePermission.delete({
    where: {
      roleId_permissionId: {
        roleId,
        permissionId,
      },
    },
  });

  return {
    message: "Permission removed from role successfully",
  };
};

export const getRolePermissions = async (roleId) => {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    const error = new Error("Role not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.rolePermission.findMany({
    where: {
      roleId,
      permission: {
        isActive: true,
      },
    },
    include: {
      permission: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};
