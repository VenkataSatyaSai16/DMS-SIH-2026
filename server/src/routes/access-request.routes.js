import express from "express";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  createAccessRequestController,
  reviewAccessRequestController,
} from "../controllers/access-request.controller.js";

import {
  createAccessRequestSchema,
  reviewAccessRequestSchema,
} from "../validators/access-request.validator.js";

const router = express.Router();

router.post(
  "/cases/:caseId",
  authenticate,
  authorize("ACCESS_REQUEST_CREATE"),
  validate(createAccessRequestSchema),
  createAccessRequestController
);

router.patch(
  "/:requestId/review",
  authenticate,
  authorize("ACCESS_REQUEST_APPROVE"),
  validate(reviewAccessRequestSchema),
  reviewAccessRequestController
);

export default router;