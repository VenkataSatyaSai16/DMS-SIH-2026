import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deactivateRole,
} from "../services/role.service.js";

export const createRoleController = async (req, res, next) => {
  try {
    const role = await createRole(req.body);

    return res.status(201).json({
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const getRolesController = async (req, res, next) => {
  try {
    const roles = await getRoles();

    return res.status(200).json({
      roles,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoleByIdController = async (req, res, next) => {
  try {
    const role = await getRoleById(req.params.id);

    return res.status(200).json({
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRoleController = async (req, res, next) => {
  try {
    const role = await updateRole(req.params.id, req.body);

    return res.status(200).json({
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateRoleController = async (req, res, next) => {
  try {
    const role = await deactivateRole(req.params.id);

    return res.status(200).json({
      message: "Role deactivated successfully",
      role,
    });
  } catch (error) {
    next(error);
  }
};