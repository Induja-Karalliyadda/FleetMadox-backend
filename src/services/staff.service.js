import bcrypt from "bcryptjs";
import * as staffRepo from "../repositories/staff.repository.js";

export const getAllStaff = async () => {
  return await staffRepo.getAllStaff();
};

export const getNextEmployeeNumber = async (role) => {
  return await staffRepo.getNextEmployeeNumber(role);
};

// ✅ Add staff with password hashing (only once)
export const addStaff = async (staff) => {
  // hash only if password is plain text
  if (!staff.password.startsWith("$2b$")) {
    staff.password = await bcrypt.hash(staff.password, 10);
  }
  return await staffRepo.addStaff(staff);
};

// ✅ Update staff (re-hash password if provided)
export const updateStaff = async (id, staff) => {
  if (staff.password && !staff.password.startsWith("$2b$")) {
    staff.password = await bcrypt.hash(staff.password, 10);
  }
  return await staffRepo.updateStaff(id, staff);
};

export const deleteStaff = async (id) => {
  return await staffRepo.deleteStaff(id);
};
