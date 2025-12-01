import { z } from 'zod';

// Accept many date inputs: ISO string, "YYYY-MM-DD HH:mm", Date, etc.
const anyDate = z.preprocess((v) => {
  if (v === null || v === undefined || v === '') return undefined;
  const d = (v instanceof Date) ? v : new Date(String(v));
  return isNaN(d.getTime()) ? undefined : d; // invalid -> undefined to fail z.date()
}, z.date());

export const createAssignmentSchema = {
  body: z.object({
    vehicle_id: z.coerce.number().int().positive(),
    employee_id: z.coerce.number().int().positive(),
    start_date: anyDate.optional(),
    end_date: anyDate.nullable().optional(),
    route: z.string().min(1).max(120).optional()
  })
};

// FIXED: Make the query schema more permissive - allow empty object
export const listAssignmentQuerySchema = {
  query: z.object({
    vehicle_id: z.coerce.number().int().positive().optional(),
    employee_id: z.coerce.number().int().positive().optional(),
    active: z.enum(['true', 'false']).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional()
  }).optional().default({})  // Allow empty query object
};

// Single-id param for /assignments/:id
export const idParamSchema = {
  params: z.object({
    id: z.coerce.number().int().positive()
  })
};

export const patchAssignmentSchema = {
  params: idParamSchema.params,
  body: z.object({
    start_date: anyDate.optional(),
    end_date: anyDate.nullable().optional(),
    vehicle_id: z.coerce.number().int().positive().optional(),
    employee_id: z.coerce.number().int().positive().optional(),
    route: z.string().min(1).max(120).optional()
  })
};