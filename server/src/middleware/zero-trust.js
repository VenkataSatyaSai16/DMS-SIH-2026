import { getUserAuthorization } from "../authorization/access.js";
import { hasCaseScopeAccess } from "../authorization/scope.js";
import { createAuditLog } from "../services/audit.service.js";

export const zeroTrustCase = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Authentication required",
        });
      }

      const caseId = req.params.caseId || req.params.id;

      if (!caseId) {
        return res.status(400).json({
          message: "Case ID is required",
        });
      }

      const authorizations = await getUserAuthorization(req.user.sub);

      const eligibleAuthorizations = authorizations.filter(
        (authorization) =>
          authorization.permissions.includes(requiredPermission)
      );

      if (eligibleAuthorizations.length === 0) {
        await createAuditLog({
          userId: req.user.sub,
          action: requiredPermission,
          resource: "CASE",
          resourceId: caseId,
          result: "DENIED",
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        });

        return res.status(403).json({
          message: "Access denied",
        });
      }

      for (const authorization of eligibleAuthorizations) {
        const allowed = await hasCaseScopeAccess({
          userId: req.user.sub,
          caseId,
          scope: authorization.scope,
        });

        if (allowed) {
          await createAuditLog({
            userId: req.user.sub,
            action: requiredPermission,
            resource: "CASE",
            resourceId: caseId,
            result: "ALLOWED",
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
            metadata: {
              role: authorization.roleName,
              scope: authorization.scope,
            },
          });

          req.authorization = authorization;

          return next();
        }
      }

      await createAuditLog({
        userId: req.user.sub,
        action: requiredPermission,
        resource: "CASE",
        resourceId: caseId,
        result: "DENIED",
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      return res.status(403).json({
        message: "Access denied",
      });
    } catch (error) {
      next(error);
    }
  };
};