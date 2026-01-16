const { z } = require('zod');

/**
 * TodayRoute Validation Schemas
 * Using Zod for runtime type validation
 */

// Oil/Water level enum
const levelEnum = z.enum(['full', 'adequate', 'low', 'critical']);

// Reading type enum
const readingTypeEnum = z.enum(['morning', 'evening']);

/**
 * Fitness Check Schemas
 */
const fitnessCheckSchema = z.object({
  assignmentId: z.number().int().positive().optional(),
  busId: z.number().int().positive().optional(),
  oilLevel: levelEnum,
  oilChecked: z.boolean(),
  waterLevel: levelEnum,
  waterChecked: z.boolean(),
  notes: z.string().max(500).optional(),
  checkDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
});

/**
 * Odometer Reading Schema
 */
const odometerReadingSchema = z.object({
  assignmentId: z.number().int().positive().optional(),
  busId: z.number().int().positive().optional(),
  readingType: readingTypeEnum,
  readingKm: z.number().positive('Reading must be greater than 0'),
  readingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
});

/**
 * Fuel Entry Schema
 */
const fuelEntrySchema = z.object({
  assignmentId: z.number().int().positive().optional(),
  busId: z.number().int().positive().optional(),
  odometerAtFueling: z.number().positive('Odometer reading must be greater than 0'),
  litersFilled: z.number().positive('Liters filled must be greater than 0'),
  pricePerLiter: z.number().positive('Price per liter must be greater than 0'),
  totalCost: z.number().positive().optional(),
  fuelStation: z.string().min(1, 'Fuel station is required').max(255),
  notes: z.string().max(500).optional(),
  fuelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional()
});

module.exports = {
  fitnessCheckSchema,
  odometerReadingSchema,
  fuelEntrySchema,
  levelEnum,
  readingTypeEnum
};
