import prisma from "../config/db.js";

export const authorize = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: req.user.sub,
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
                    is: {
                      isActive: true,
                    },
                  },
                },
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      const userPermissions = new Set(
        userRoles.flatMap((userRole) =>
          userRole.role.permissions.map(
            (rolePermission) => rolePermission.permission.name,
          ),
        ),
      );

      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.has(permission),
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
