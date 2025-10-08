import { z } from 'zod';


export const createUserSchema = {
body: z.object({
name: z.string().min(2),
address: z.string().optional(),
mobile: z.string().optional(),
role: z.enum(['admin', 'accountant', 'driver']),
nic: z.string().optional(),
employe_number: z.string().optional(),
email: z.string().email(),
password: z.string().min(6),
is_active: z.boolean().optional()
})
};


export const updateUserSchema = {
params: z.object({ id: z.string().regex(/^\d+$/) }),
body: z.object({
name: z.string().min(2).optional(),
address: z.string().optional(),
mobile: z.string().optional(),
role: z.enum(['admin', 'accountant', 'driver']).optional(),
nic: z.string().optional(),
employe_number: z.string().optional(),
email: z.string().email().optional(),
password: z.string().min(6).optional(),
is_active: z.boolean().optional()
})
};