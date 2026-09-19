import prisma from "../config/db.js";

export const SCOPE = {
  ORGANIZATION: "ORGANIZATION",
  OWN_UNIT: "OWN_UNIT",
  UNIT_AND_DESCENDANTS: "UNIT_AND_DESCENDANTS",
  ASSIGNED_CASES: "ASSIGNED_CASES",
  EXPLICIT_CASES: "EXPLICIT_CASES",
};

const getUserUnitIds = async (userId) => {
  const memberships = await prisma.userMembership.findMany({
    where: {
      userId,
      isActive: true,
      OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      unit: {
        isActive: true,
      },
    },
    select: {
      unitId: true,
    },
  });

  return memberships.map((membership) => membership.unitId);
};

const getDescendantUnitIds = async (unitIds) => {
  const allUnits = await prisma.organizationUnit.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      parentUnitId: true,
    },
  });

  const result = new Set(unitIds);
  let changed = true;

  while (changed) {
    changed = false;

    for (const unit of allUnits) {
      if (
        unit.parentUnitId &&
        result.has(unit.parentUnitId) &&
        !result.has(unit.id)
      ) {
        result.add(unit.id);
        changed = true;
      }
    }
  }

  return [...result];
};

export const hasCaseScopeAccess = async ({ userId, caseId, scope }) => {
  if (!Object.values(SCOPE).includes(scope)) {
    return false;
  }

  // Case creator always has access to their own case file
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId },
    select: { createdById: true },
  });

  if (caseRecord && caseRecord.createdById === userId) {
    return true;
  }

  if (scope === SCOPE.ORGANIZATION) {
    return true;
  }

  if (scope === SCOPE.ASSIGNED_CASES) {
    const assignment = await prisma.caseAssignment.findFirst({
      where: {
        caseId,
        userId,
        status: "ACTIVE",
      },
    });

    return Boolean(assignment);
  }

  if (scope === SCOPE.EXPLICIT_CASES) {
  const access = await prisma.caseAccess.findUnique({
    where: {
      caseId_userId: {
        caseId,
        userId,
      },
    },
  });

  if (!access || !access.isActive) {
    return false;
  }

  if (access.expiresAt && access.expiresAt <= new Date()) {
    return false;
  }

  return true;
}

  const userUnitIds = await getUserUnitIds(userId);

  if (userUnitIds.length === 0) {
    return false;
  }

  let allowedUnitIds = userUnitIds;

  if (scope === SCOPE.UNIT_AND_DESCENDANTS) {
    allowedUnitIds = await getDescendantUnitIds(userUnitIds);
  }

  const caseUnit = await prisma.caseUnit.findFirst({
    where: {
      caseId,
      unitId: {
        in: allowedUnitIds,
      },
      status: "ACTIVE",
    },
  });

  return Boolean(caseUnit);
};
