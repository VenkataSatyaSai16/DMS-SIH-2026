import {
  createAccessRequest,
  reviewAccessRequest,
} from "../services/access-request.service.js";

export const createAccessRequestController = async (req, res, next) => {
  try {
    const request = await createAccessRequest({
      caseId: req.params.caseId,
      requesterId: req.user.sub,
      reason: req.body.reason,
    });

    return res.status(201).json({
      message: "Access request created successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewAccessRequestController = async (req, res, next) => {
  try {
    const request = await reviewAccessRequest({
      requestId: req.params.requestId,
      reviewerId: req.user.sub,
      approve: req.body.approve,
    });

    return res.json({
      message: req.body.approve
        ? "Access request approved successfully"
        : "Access request rejected successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
};