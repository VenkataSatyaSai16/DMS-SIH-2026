import {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  assignCaseToUnit,
  assignCaseToUser,
} from "../services/case.services.js";
import { createAuditLog } from "../services/audit.service.js";

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

    // Audit log specific status transitions (ARCHIVED, CLOSED, REOPENED, etc.)
    if (req.body.status) {
      const statusAction = 
        req.body.status === "ARCHIVED" ? "CASE_ARCHIVED" :
        req.body.status === "CLOSED" ? "CASE_CLOSED" :
        req.body.status === "ACTIVE" ? "CASE_REOPENED" : "CASE_STATUS_UPDATED";

      await createAuditLog({
        userId: req.user.sub,
        action: statusAction,
        resource: "CASE",
        resourceId: req.params.id,
        result: "ALLOWED",
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        metadata: {
          caseReference: caseRecord.caseId,
          newStatus: req.body.status,
          title: caseRecord.title
        }
      }).catch(err => console.error("Audit logging error:", err));
    }

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