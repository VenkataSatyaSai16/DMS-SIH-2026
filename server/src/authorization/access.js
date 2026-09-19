import prisma from "../config/db.js";

export const getUserAuthorization = async (userId) => {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      isActive: true,
      role: {
        isActive: true,
      },
    },
    include: {
      role: {
        include: {
          permissions: {
            where: {
              permission: {
                isActive: true,
              },
            },
            include: {
              permission: true,
            },
          },
        },
      },
      unit: true,
    },
  });

  return userRoles.map((userRole) => ({
    roleId: userRole.roleId,
    roleName: userRole.role.name,
    unitId: userRole.unitId,
    unit: userRole.unit,
    scope: userRole.scope,
    permissions: userRole.role.permissions.map(
      (rolePermission) => rolePermission.permission.name
    ),
  }));
};