import { z, ZodType } from "zod";
import { UserError } from "@/lib/errors";
import { StatusType } from "@/prisma/generated/prisma/enums";

export function validateWithZodSchema<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    // i messaggi degli schemi sono scritti per l'utente ("L'importo deve essere
    // maggiore di zero"): sono UserError, e vanno mostrati
    const errors = result.error.issues.map((error) => error.message);
    throw new UserError(errors.join(", "));
  }

  return result.data;
}

export const ticketSchema = z.object({
  status: z.enum(StatusType),
  orderNumber: z.string().min(5, "Order number required"),
  company: z.string().min(1, "Company name required"),

  companyTechnician: z.string().optional(),
  email: z.email("Email not valid").optional(),
  telephone: z.string().optional(),

  problemDescription: z.string().optional(),

  assignedToId: z.string().optional(),

  closingDescription: z.string().optional(),

  requiresPayment: z.boolean().default(false),
  wbs: z.string().optional(),

  isPlcChanged: z.boolean().default(false),
  newPlcFileName: z.string().optional(),

  isSafetyChanged: z.boolean().default(false),
  safetyDescription: z.string().optional(),
  oldSafetyId: z.string().optional(),
  newSafetyId: z.string().optional(),
});
