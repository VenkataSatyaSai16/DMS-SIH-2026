import prisma from '../config/db.js';

export const getAuditLogsController = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.status(200).json({
      message: 'Audit logs retrieved successfully',
      data: logs,
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return res.status(500).json({
      message: 'Internal server error while fetching audit logs',
    });
  }
};
