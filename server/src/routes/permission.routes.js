import express from "express";

import {
  createPermissionController,
  getPermissionsController,
  getPermissionByIdController,
  updatePermissionController,
  deactivatePermissionController,
  assignPermissionToRoleController,
  removePermissionFromRoleController,
  getRolePermissionsController,
} from "../controllers/permission.controller.js";

import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

import {
  createPermissionSchema,
  updatePermissionSchema,
  assignPermissionSchema,
} from "../validators/permission.validator.js";

import { testCaseScopeController } from "../controllers/scope-test.controller.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("PERMISSION_MANAGE"),
  validate(createPermissionSchema),
  createPermissionController
);

router.get(
  "/",
  authenticate,
  authorize("PERMISSION_MANAGE"),
  getPermissionsController
);

router.get(
  "/:id",
  authenticate,
  authorize("PERMISSION_MANAGE"),
  getPermissionByIdController
);

router.patch(
  "/:id",
  authenticate,
  authorize("PERMISSION_MANAGE"),
  validate(updatePermissionSchema),
  updatePermissionController
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("PERMISSION_MANAGE"),
  deactivatePermissionController
);

/*
 * Role ↔ Permission relationship
 */

router.get(
  "/role/:roleId",
  authenticate,
  authorize("PERMISSION_MANAGE"),
  getRolePermissionsController
);

router.post(
  "/role/:roleId",
  authenticate,
  authorize("PERMISSION_MANAGE"),
  validate(assignPermissionSchema),
  assignPermissionToRoleController
);

router.delete(
  "/role/:roleId/:permissionId",
  authenticate,
  authorize("PERMISSION_MANAGE"),
  removePermissionFromRoleController
);

router.post(
  "/scope-test",
  authenticate,
  testCaseScopeController
);

export default router;