import express from "express";

import {
  createCaseController,
  getCasesController,
  getCaseByIdController,
  updateCaseController,
  assignCaseToUnitController,
  assignCaseToUserController,
} from "../controllers/case.controller.js";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  createCaseSchema,
  updateCaseSchema,
  assignCaseUnitSchema,
  assignCaseUserSchema,
} from "../validators/case.validator.js";

import {
  grantCaseAccessController,
  revokeCaseAccessController,
} from "../controllers/case-access.controller.js";

import { grantCaseAccessSchema } from "../validators/case.validator.js";

import { zeroTrustCase } from "../middleware/zero-trust.js";

const router = express.Router();


router.post(
  "/",
  authenticate,
  authorize("CASE_CREATE"),
  validate(createCaseSchema),
  createCaseController
);

router.get(
  "/",
  authenticate,
  authorize("CASE_VIEW"),
  getCasesController
);

router.post(
  "/:caseId/access",
  authenticate,
  authorize("CASE_ASSIGN"),
  validate(grantCaseAccessSchema),
  grantCaseAccessController
);

router.delete(
  "/:caseId/access/:userId",
  authenticate,
  authorize("CASE_ASSIGN"),
  revokeCaseAccessController
);

router.get(
  "/:id",
  authenticate,
  authorize("CASE_VIEW"),
  zeroTrustCase("CASE_VIEW"),
  getCaseByIdController
);

router.patch(
  "/:id",
  authenticate,
  authorize("CASE_MODIFY"),
  zeroTrustCase("CASE_MODIFY"),
  validate(updateCaseSchema),
  updateCaseController
);

router.post(
  "/:id/units",
  authenticate,
  authorize("CASE_ASSIGN"),
  validate(assignCaseUnitSchema),
  assignCaseToUnitController
);

router.post(
  "/:id/assignments",
  authenticate,
  authorize("CASE_ASSIGN"),
  validate(assignCaseUserSchema),
  assignCaseToUserController
);



export default router;