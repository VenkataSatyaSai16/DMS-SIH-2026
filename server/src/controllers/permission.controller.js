import {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deactivatePermission,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions,
} from "../services/permission.service.js";

export const createPermissionController = async (req, res, next) => {
  try {
    const permission = await createPermission(req.body);

    return res.status(201).json({
      message: "Permission created successfully",
      permission,
    });
  } catch (error) {
    next(error);
  }
};

export const getPermissionsController = async (req, res, next) => {
  try {
    const permissions = await getPermissions();

    return res.status(200).json({
      permissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getPermissionByIdController = async (req, res, next) => {
  try {
    const permission = await getPermissionById(req.params.id);

    return res.status(200).json({
      permission,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePermissionController = async (req, res, next) => {
  try {
    const permission = await updatePermission(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "Permission updated successfully",
      permission,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivatePermissionController = async (req, res, next) => {
  try {
    const permission = await deactivatePermission(req.params.id);

    return res.status(200).json({
      message: "Permission deactivated successfully",
      permission,
    });
  } catch (error) {
    next(error);
  }
};

export const assignPermissionToRoleController = async (
  req,
  res,
  next
) => {
  try {
    const assignment = await assignPermissionToRole(
      req.params.roleId,
      req.body.permissionId
    );

    return res.status(201).json({
      message: "Permission assigned to role successfully",
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const removePermissionFromRoleController = async (
  req,
  res,
  next
) => {
  try {
    const result = await removePermissionFromRole(
      req.params.roleId,
      req.params.permissionId
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getRolePermissionsController = async (
  req,
  res,
  next
) => {
  try {
    const permissions = await getRolePermissions(req.params.roleId);

    return res.status(200).json({
      permissions,
    });
  } catch (error) {
    next(error);
  }
};