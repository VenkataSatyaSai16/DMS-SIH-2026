import prisma from '../config/db.js';
import { getUserAuthorization } from '../authorization/access.js';
import { getCases } from '../services/case.services.js';

export const getAuditLogsController = async (req, res) => {
  try {
    const userId = req.user.sub;
    const authorizations = await getUserAuthorization(userId);

    const isOrgWide = authorizations.some((auth) => auth.scope === 'ORGANIZATION');

    let whereClause = {};

    if (!isOrgWide) {
      // Get officer's department unit memberships
      const memberships = await prisma.userMembership.findMany({
        where: { userId, isActive: true },
        select: { unitId: true },
      });
      const unitIds = memberships.map((m) => m.unitId);

      // Get officer's scope-authorized cases
      const accessibleCases = await getCases(userId);
      const caseIds = accessibleCases.map((c) => c.id);

      const targetResourceIds = [...new Set([...unitIds, ...caseIds])];

      whereClause = {
        OR: [
          { userId: userId },
          { resourceId: { in: targetResourceIds } },
        ],
      };
    }

    const rawLogs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Populate actor user names and emails for UI rendering
    const actorUserIds = [...new Set(rawLogs.map((l) => l.userId).filter(Boolean))];
    const users = await prisma.user.findMany({
      where: { id: { in: actorUserIds } },
      select: { id: true, name: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const populatedLogs = rawLogs.map((log) => ({
      ...log,
      user: userMap.get(log.userId) || null,
    }));

    return res.status(200).json({
      message: 'Audit logs retrieved successfully',
      data: populatedLogs,
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return res.status(500).json({
      message: 'Internal server error while fetching audit logs',
    });
  }
};
