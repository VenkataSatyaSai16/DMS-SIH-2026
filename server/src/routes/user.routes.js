import express from "express";

import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  deactivateUserController,
  assignUserToUnitController,
  assignRoleToUserController,
  updateUserRoleScopeController
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  createUserSchema,
  updateUserSchema,
  assignRoleSchema,
  updateUserRoleScopeSchema,
} from "../validators/user.validator.js";



const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("USER_CREATE"),
  validate(createUserSchema),
  createUserController
);

router.get(
  "/",
  authenticate,
  authorize("USER_VIEW"),
  getUsersController
);

router.patch(
  "/:id/roles/:userRoleId/scope",
  authenticate,
  authorize("ROLE_ASSIGN"),
  validate(updateUserRoleScopeSchema),
  updateUserRoleScopeController
);

router.get(
  "/:id",
  authenticate,
  authorize("USER_VIEW"),
  getUserByIdController
);

router.patch(
  "/:id",
  authenticate,
  authorize("USER_MODIFY"),
  validate(updateUserSchema),
  updateUserController
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("USER_DEACTIVATE"),
  deactivateUserController
);

router.post(
  "/:id/unit",
  authenticate,
  authorize("USER_ASSIGN_UNIT"),
  assignUserToUnitController
);

router.post(
  "/:id/role",
  authenticate,
  authorize("ROLE_ASSIGN"),
  validate(assignRoleSchema),
  assignRoleToUserController
);

export default router;