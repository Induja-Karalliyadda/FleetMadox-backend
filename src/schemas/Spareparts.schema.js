// src/schemas/Spareparts.schema.js
import { z } from 'zod';

// ==================== SPARE PART MASTER SCHEMAS ====================

export const createSparePartSchema = z.object({
    body: z.object({
        part_name: z
            .string({ required_error: 'Part name is required' })
            .min(1, 'Part name cannot be empty')
            .max(255, 'Part name cannot exceed 255 characters')
            .trim(),
        description: z
            .string()
            .max(1000, 'Description cannot exceed 1000 characters')
            .trim()
            .optional()
            .nullable(),
    }),
});

export const updateSparePartSchema = z.object({
    body: z.object({
        part_name: z
            .string()
            .min(1, 'Part name cannot be empty')
            .max(255, 'Part name cannot exceed 255 characters')
            .trim()
            .optional(),
        description: z
            .string()
            .max(1000, 'Description cannot exceed 1000 characters')
            .trim()
            .optional()
            .nullable(),
    }),
});

// ==================== VEHICLE SPARE PART SCHEMAS ====================

export const installSparePartSchema = z.object({
    body: z.object({
        spare_part_id: z
            .union([
                z.number().int().positive(),
                z.string().transform((val) => {
                    const num = parseInt(val, 10);
                    if (isNaN(num) || num <= 0) throw new Error('Invalid spare part ID');
                    return num;
                })
            ]),
        bus_id: z
            .union([
                z.number().int().positive(),
                z.string().transform((val) => {
                    const num = parseInt(val, 10);
                    if (isNaN(num) || num <= 0) throw new Error('Invalid bus ID');
                    return num;
                })
            ]),
        install_odometer: z
            .union([
                z.number().nonnegative(),
                z.string().transform((val) => {
                    const num = parseFloat(val);
                    if (isNaN(num) || num < 0) throw new Error('Invalid install odometer');
                    return num;
                })
            ]),
        install_date: z
            .string({ required_error: 'Install date is required' })
            .refine((val) => !isNaN(Date.parse(val)), {
                message: 'Invalid date format',
            }),
        installed_by: z
            .union([
                z.number().int().positive(),
                z.string().transform((val) => {
                    const num = parseInt(val, 10);
                    if (isNaN(num) || num <= 0) throw new Error('Invalid installer ID');
                    return num;
                })
            ]),
        cost: z
            .union([
                z.number().nonnegative(),
                z.string().transform((val) => {
                    const num = parseFloat(val);
                    if (isNaN(num) || num < 0) throw new Error('Invalid cost');
                    return num;
                })
            ]),
        distance_limit: z
            .union([
                z.number().positive(),
                z.string().transform((val) => {
                    const num = parseFloat(val);
                    if (isNaN(num) || num <= 0) throw new Error('Invalid distance limit');
                    return num;
                })
            ]),
        brand: z
            .string({ required_error: 'Brand is required' })
            .min(1, 'Brand cannot be empty')
            .max(255, 'Brand cannot exceed 255 characters')
            .trim(),
        is_active: z
            .union([
                z.boolean(),
                z.string().transform((val) => val === 'true')
            ])
            .optional()
            .default(true),
        boundary_limit: z
            .union([
                z.number().nonnegative(),
                z.string().transform((val) => {
                    const num = parseFloat(val);
                    if (isNaN(num) || num < 0) throw new Error('Invalid boundary limit');
                    return num;
                })
            ]),
    }).refine((data) => data.boundary_limit < data.distance_limit, {
        message: 'Boundary limit must be less than distance limit',
        path: ['boundary_limit'],
    }),
});

export const updateVehicleSparePartSchema = z.object({
    body: z.object({
        is_active: z
            .union([
                z.boolean(),
                z.string().transform((val) => val === 'true')
            ])
            .optional(),
        cost: z
            .union([
                z.number().nonnegative(),
                z.string().transform((val) => {
                    const num = parseFloat(val);
                    if (isNaN(num) || num < 0) throw new Error('Invalid cost');
                    return num;
                })
            ])
            .optional(),
        brand: z
            .string()
            .min(1, 'Brand cannot be empty')
            .max(255, 'Brand cannot exceed 255 characters')
            .trim()
            .optional(),
        distance_limit: z
            .union([
                z.number().positive(),
                z.string().transform((val) => {
                    const num = parseFloat(val);
                    if (isNaN(num) || num <= 0) throw new Error('Invalid distance limit');
                    return num;
                })
            ])
            .optional(),
        boundary_limit: z
            .union([
                z.number().nonnegative(),
                z.string().transform((val) => {
                    const num = parseFloat(val);
                    if (isNaN(num) || num < 0) throw new Error('Invalid boundary limit');
                    return num;
                })
            ])
            .optional(),
    }),
});