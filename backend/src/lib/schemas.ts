import z from 'zod';

export const numberSchema = z.string().regex(/^\d+$/).transform(Number);
