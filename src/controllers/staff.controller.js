import * as staffService from "../services/staff.service.js";

export const getAllStaff = async (req, res, next) => {
  try {
    const data = await staffService.getAllStaff();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const getNextEmployeeNumber = async (req, res, next) => {
  try {
    const { role } = req.query;
    const employeeNumber = await staffService.getNextEmployeeNumber(role);
    res.json({ employeeNumber });
  } catch (err) {
    next(err);
  }
};

export const addStaff = async (req, res, next) => {
  try {
    const staff = await staffService.addStaff(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const updated = await staffService.updateStaff(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    await staffService.deleteStaff(req.params.id);
    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (err) {
    next(err);
  }
};
