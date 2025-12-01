import {
  createAssignment,
  listAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment
} from '../services/assignments.service.js';

export async function listAssignmentsController(req, res, next) {
  try { res.json(await listAssignments(req.query)); }
  catch (e) { next(e); }
}

export async function getAssignmentController(req, res, next) {
  try {
    const { id } = req.params;
    const data = await getAssignment(Number(id));
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (e) { next(e); }
}

export async function createAssignmentController(req, res, next) {
  try { res.status(201).json(await createAssignment(req.body)); }
  catch (e) {
    if (e.code === '23P01') return res.status(409).json({ message: 'Overlapping assignment' }); // if you add exclusion
    if (e.code === '23505') return res.status(409).json({ message: 'Duplicate assignment' });
    next(e);
  }
}

export async function updateAssignmentController(req, res, next) {
  try {
    const { id } = req.params;
    const data = await updateAssignment(Number(id), req.body);
    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (e) { next(e); }
}

export async function deleteAssignmentController(req, res, next) {
  try {
    const { id } = req.params;
    await deleteAssignment(Number(id));
    res.status(204).send();
  } catch (e) { next(e); }
}
