import * as repo from '../repositories/assignments.repository.js';
import { findById as findUser } from '../repositories/users.repository.js';
import { query } from '../config/db.js';

export async function createAssignment(dto) {
  // vehicle exists?
  const v = await query('SELECT id FROM bus WHERE id = $1', [dto.vehicle_id]);
  if (!v.rowCount) throw Object.assign(new Error('Vehicle not found'), { status: 404 });

  // user exists and is driver?
  const user = await findUser(dto.employee_id);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
  if (user.role !== 'driver') throw Object.assign(new Error('User is not a driver'), { status: 400 });

  return repo.createAssignment(dto); // dto includes route if provided
}

export const listAssignments = (q) => repo.listAssignments(q);
export const getAssignment = (id) => repo.getAssignmentById(id);

export async function updateAssignment(id, patch) {
  // validate new driver if employee_id changed
  if (patch.employee_id !== undefined) {
    const u = await findUser(patch.employee_id);
    if (!u) throw Object.assign(new Error('User not found'), { status: 404 });
    if (u.role !== 'driver') throw Object.assign(new Error('User is not a driver'), { status: 400 });
  }
  // validate new vehicle if vehicle_id changed
  if (patch.vehicle_id !== undefined) {
    const v = await query('SELECT id FROM bus WHERE id = $1', [patch.vehicle_id]);
    if (!v.rowCount) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
  }
  // route is just a string; no extra check
  return repo.updateAssignmentById(id, patch);
}

export const deleteAssignment = (id) => repo.deleteAssignmentById(id);
