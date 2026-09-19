import { hasCaseScopeAccess } from "../authorization/scope.js";

export const testCaseScopeController = async (req, res, next) => {
  try {
    const { caseId, scope } = req.body;

    const allowed = await hasCaseScopeAccess({
      userId: req.user.sub,
      caseId,
      scope,
    });

    return res.status(200).json({
      allowed,
      scope,
    });
  } catch (error) {
    next(error);
  }
};