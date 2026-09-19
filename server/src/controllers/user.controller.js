import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deactivateUser,
  assignUserToUnit,
  assignRoleToUser,
  updateUserRoleScope
} from "../services/user.service.js";

export const createUserController = async (req, res, next) => {
  try {
    const user = await createUser(req.body);

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};


export const getUsersController = async (req, res, next) => {
  try {
    const users = await getUsers();

    return res.status(200).json({
      users,
    });
  } catch (error) {
    next(error);
  }
};


export const getUserByIdController = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);

    return res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};


export const updateUserController = async (req, res, next) => {
  try {
    const user = await updateUser(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};


export const deactivateUserController = async (req, res, next) => {
  try {
    const user = await deactivateUser(req.params.id);

    return res.status(200).json({
      message: "User deactivated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};


export const assignUserToUnitController = async (
  req,
  res,
  next
) => {
  try {
    const membership = await assignUserToUnit(
      req.params.id,
      req.body.unitId
    );

    return res.status(201).json({
      message: "User assigned to organization unit successfully",
      membership,
    });
  } catch (error) {
    next(error);
  }
};


export const assignRoleToUserController = async (req, res, next) => {
  try {
    const userRole = await assignRoleToUser(
      req.params.id,
      req.body
    );

    return res.status(201).json({
      message: "Role assigned to user successfully",
      userRole,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoleScopeController = async (req, res, next) => {
  try {
    const userRole = await updateUserRoleScope(
      req.params.userRoleId,
      req.body.scope
    );

    return res.json({
      message: "User role scope updated successfully",
      userRole,
    });
  } catch (error) {
    next(error);
  }
};