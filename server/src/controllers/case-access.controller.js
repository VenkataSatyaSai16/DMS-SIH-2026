import {
  grantCaseAccess,
  revokeCaseAccess,
} from "../services/case-access.service.js";

export const grantCaseAccessController = async (req, res, next) => {
  try {
    const access = await grantCaseAccess({
      caseId: req.params.caseId,
      userId: req.body.userId,
      grantedById: req.user.sub,
      expiresAt: req.body.expiresAt
        ? new Date(req.body.expiresAt)
        : null,
    });

    return res.status(201).json({
      message: "Case access granted successfully",
      access,
    });
  } catch (error) {
    next(error);
  }
};

export const revokeCaseAccessController = async (req, res, next) => {
  try {
    const access = await revokeCaseAccess(
      req.params.caseId,
      req.params.userId
    );

    return res.json({
      message: "Case access revoked successfully",
      access,
    });
  } catch (error) {
    next(error);
  }
};