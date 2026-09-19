import express from "express";

import {
  createRoleController,
  getRolesController,
  getRoleByIdController,
  updateRoleController,
  deactivateRoleController,
} from "../controllers/role.controller.js";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  createRoleSchema,
  updateRoleSchema,
} from "../validators/role.validator.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("ROLE_CREATE"),
  validate(createRoleSchema),
  createRoleController,
);

router.get("/", authenticate, authorize("ROLE_VIEW"), getRolesController);

router.get("/:id", authenticate, authorize("ROLE_VIEW"), getRoleByIdController);

router.patch(
  "/:id",
  authenticate,
  authorize("ROLE_MODIFY"),
  validate(updateRoleSchema),
  updateRoleController,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("ROLE_DEACTIVATE"),
  deactivateRoleController,
);

export default router;
