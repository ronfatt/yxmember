import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().min(8).optional()
}).refine((data) => data.email || data.phone, { message: "Email or phone required" });

export const testimonialSchema = z.object({
  category: z.string().min(2),
  title: z.string().min(2),
  content: z.string().min(10),
  media_urls: z.array(z.string().url()).optional(),
  is_anonymous: z.boolean().default(false),
  consent_public: z.boolean()
});

export const roomBookingSchema = z.object({
  room_slot_id: z.string().uuid(),
  party_size: z.number().int().min(1).max(10),
  notes: z.string().optional()
});

export const mentorBookingSchema = z.object({
  mentor_id: z.string().uuid(),
  availability_id: z.string().uuid().optional(),
  start_at: z.string(),
  end_at: z.string(),
  location_text: z.string().min(2),
  notes: z.string().optional(),
  deposit_required: z.boolean().default(false),
  deposit_amount_cents: z.number().int().min(0).default(0)
});

export const appointmentQuoteSchema = z.object({
  service_id: z.string().uuid(),
  points_requested: z.number().int().min(0).default(0)
});

export const appointmentCreateSchema = z.object({
  mentor_id: z.string().uuid(),
  service_id: z.string().uuid(),
  start_at: z.string().datetime(),
  end_at: z.string().datetime(),
  session_mode: z.enum(["online", "offline"]),
  points_requested: z.number().int().min(0).default(0),
  intake: z.object({
    intention: z.string().min(8).max(300),
    themes: z.array(z.string()).default([]),
    share_birthday: z.boolean().default(false),
    allow_recording: z.boolean().default(false),
    desired_outcome: z.string().min(4).max(160)
  })
});

export const appointmentAdminActionSchema = z.object({
  appointment_id: z.string().uuid()
});

export const appointmentCancelSchema = appointmentAdminActionSchema.extend({
  reason: z.string().min(2).max(240).optional()
});

export const enrollmentSchema = z.object({
  course_session_id: z.string().uuid()
});

export const productOrderSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  points_requested: z.number().int().min(0).default(0)
});
