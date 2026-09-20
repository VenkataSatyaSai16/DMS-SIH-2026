import express from "express";

import {
  createOrganizationUnitController,
  getOrganizationUnitsController,
  getOrganizationUnitByIdController,
  updateOrganizationUnitController,
  deactivateOrganizationUnitController,
  activateOrganizationUnitController,
} from "../controllers/organization-unit.controller.js";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  createOrganizationUnitSchema,
  updateOrganizationUnitSchema,
} from "../validators/organization-unit.validator.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("UNIT_CREATE"),
  validate(createOrganizationUnitSchema),
  createOrganizationUnitController
);

router.get(
  "/",
  authenticate,
  authorize("UNIT_VIEW"),
  getOrganizationUnitsController
);

router.get(
  "/:id",
  authenticate,
  authorize("UNIT_VIEW"),
  getOrganizationUnitByIdController
);

router.patch(
  "/:id",
  authenticate,
  authorize("UNIT_MODIFY"),
  validate(updateOrganizationUnitSchema),
  updateOrganizationUnitController
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("UNIT_DEACTIVATE"),
  deactivateOrganizationUnitController
);

router.patch(
  "/:id/activate",
  authenticate,
  authorize("UNIT_ACTIVATE"),
  activateOrganizationUnitController
);

export default router;