import {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  assignCaseToUnit,
  assignCaseToUser,
} from "../services/case.services.js";

export const createCaseController = async (req, res, next) => {
  try {
    const caseRecord = await createCase({
      ...req.body,
      createdById: req.user.sub,
    });

    return res.status(201).json({
      message: "Case created successfully",
      case: caseRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const getCasesController = async (req, res, next) => {
  try {
    const cases = await getCases(req.user.sub);

    return res.status(200).json({
      cases,
    });
  } catch (error) {
    next(error);
  }
};

export const getCaseByIdController = async (req, res, next) => {
  try {
    const caseRecord = await getCaseById(req.params.id);

    return res.status(200).json({
      case: caseRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCaseController = async (req, res, next) => {
  try {
    const caseRecord = await updateCase(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "Case updated successfully",
      case: caseRecord,
    });
  } catch (error) {
    next(error);
  }
};

export const assignCaseToUnitController = async (
  req,
  res,
  next
) => {
  try {
    const result = await assignCaseToUnit(
      req.params.id,
      req.body.unitId,
      req.user.sub
    );

    return res.status(201).json({
      message: "Case assigned to organization unit successfully",
      caseUnit: result,
    });
  } catch (error) {
    next(error);
  }
};

export const assignCaseToUserController = async (
  req,
  res,
  next
) => {
  try {
    const result = await assignCaseToUser(
      req.params.id,
      req.body.userId,
      req.user.sub
    );

    return res.status(201).json({
      message: "User assigned to case successfully",
      assignment: result,
    });
  } catch (error) {
    next(error);
  }
};