import {
  createOrganizationUnit,
  getOrganizationUnits,
  getOrganizationUnitById,
  updateOrganizationUnit,
  deactivateOrganizationUnit,
  activateOrganizationUnit,
} from "../services/organization-unit.service.js";

export const createOrganizationUnitController = async (req, res, next) => {
  try {
    const unit = await createOrganizationUnit(req.body);

    return res.status(201).json({
      message: "Organization unit created successfully",
      unit,
    });
  } catch (error) {
    next(error);
  }
};


export const getOrganizationUnitsController = async (req, res, next) => {
  try {
    const units = await getOrganizationUnits();

    return res.status(200).json({
      units,
    });
  } catch (error) {
    next(error);
  }
};


export const getOrganizationUnitByIdController = async (req, res, next) => {
  try {
    const unit = await getOrganizationUnitById(req.params.id);

    return res.status(200).json({
      unit,
    });
  } catch (error) {
    next(error);
  }
};


export const updateOrganizationUnitController = async (req, res, next) => {
  try {
    const unit = await updateOrganizationUnit(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      message: "Organization unit updated successfully",
      unit,
    });
  } catch (error) {
    next(error);
  }
};


export const deactivateOrganizationUnitController = async (
  req,
  res,
  next
) => {
  try {
    const unit = await deactivateOrganizationUnit(req.params.id);

    return res.status(200).json({
      message: "Organization unit deactivated successfully",
      unit,
    });
  } catch (error) {
    next(error);
  }
};


export const activateOrganizationUnitController = async (
  req,
  res,
  next
) => {
  try {
    const unit = await activateOrganizationUnit(req.params.id, req.user);

    return res.status(200).json({
      message: "Organization unit activated successfully",
      unit,
    });
  } catch (error) {
    next(error);
  }
};