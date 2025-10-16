import { z } from 'zod';

export const createBusSchema = {
  body: z.object({
    no_plate: z.string().min(3),
    brand: z.string().optional(),
    model: z.string().optional(),
    number_of_seats: z.number().int().positive().optional(),
    fuel_type: z.string().optional(),
    fuel_tank_capacity: z.number().optional(),
    wheel_count: z.number().int().optional(),
    engine_cc: z.number().int().optional(),
    year_of_manufacture: z.number().int().optional(),
    is_active: z.boolean().optional()
  })
};

export const updateBusSchema = {
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.object({
    no_plate: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    number_of_seats: z.number().int().optional(),
    fuel_type: z.string().optional(),
    fuel_tank_capacity: z.number().optional(),
    wheel_count: z.number().int().optional(),
    engine_cc: z.number().int().optional(),
    year_of_manufacture: z.number().int().optional(),
    is_active: z.boolean().optional()
  })
};
