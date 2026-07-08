// ─────────────────────────────────────────────────────────────────
// Ghosted Hub — Zod Validation Schemas
// ─────────────────────────────────────────────────────────────────
// Shared between frontend (form validation) and backend (DTO validation).
// ─────────────────────────────────────────────────────────────────

import { z } from "zod";

// ── Auth ───────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ── User ───────────────────────────────────────────────────────

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

// ── Cohort ─────────────────────────────────────────────────────

export const createCohortSchema = z.object({
  name: z.string().min(3, "Cohort name must be at least 3 characters").max(100),
  description: z.string().max(1000).optional(),
  registrationOpensAt: z.string().datetime().optional(),
  registrationClosesAt: z.string().datetime().optional(),
  sprintStartDate: z.string().datetime().optional(),
  sprintEndDate: z.string().datetime().optional(),
  maxTeams: z.number().int().positive().optional(),
  maxStudentsPerTeam: z.number().int().positive().max(10).optional(),
});

export const updateCohortSchema = createCohortSchema.partial();

// ── Nonprofit ──────────────────────────────────────────────────

export const createNonprofitSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  mission: z.string().max(1000).optional(),
  vision: z.string().max(1000).optional(),
  programs: z.string().max(2000).optional(),
  websiteUrl: z.string().url().optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  ein: z.string().max(20).optional(),
  foundedYear: z.number().int().min(1800).max(2100).optional(),
});

export const updateNonprofitSchema = createNonprofitSchema.partial();

// ── Team ───────────────────────────────────────────────────────

export const createTeamSchema = z.object({
  name: z.string().min(2).max(100),
  cohortId: z.string().cuid(),
  capacity: z.number().int().positive().max(10).optional(),
});

// ── Project ────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  cohortId: z.string().cuid(),
  teamId: z.string().cuid().optional(),
  nonprofitId: z.string().cuid(),
});

// ── Task ───────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"]).optional(),
  position: z.number().int().min(0).optional(),
});

// ── Review ─────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  category: z.enum([
    "DESIGN", "ACCESSIBILITY", "PERFORMANCE", "GHOST_VALIDATION",
    "SEO", "SECURITY", "RESPONSIVENESS", "CODE_QUALITY",
  ]),
});

export const submitReviewFeedbackSchema = z.object({
  status: z.enum(["APPROVED", "NEEDS_CHANGES"]),
  feedback: z.string().max(10000).optional(),
});

// ── Meeting ────────────────────────────────────────────────────

export const createMeetingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().positive().max(480).optional(),
  meetingUrl: z.string().url().optional(),
  agenda: z.string().max(5000).optional(),
  attendeeIds: z.array(z.string().cuid()).optional(),
});

// ── Message ────────────────────────────────────────────────────

export const createMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  isAnnouncement: z.boolean().optional(),
  parentId: z.string().cuid().optional(),
});

// ── Pagination ─────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ── Type Exports ───────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateCohortInput = z.infer<typeof createCohortSchema>;
export type UpdateCohortInput = z.infer<typeof updateCohortSchema>;
export type CreateNonprofitInput = z.infer<typeof createNonprofitSchema>;
export type UpdateNonprofitInput = z.infer<typeof updateNonprofitSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type SubmitReviewFeedbackInput = z.infer<typeof submitReviewFeedbackSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
