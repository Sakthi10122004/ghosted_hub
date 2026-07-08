// ─────────────────────────────────────────────────────────────────
// Ghosted Hub — Platform Constants
// ─────────────────────────────────────────────────────────────────

/** Application branding */
export const APP_NAME = "Ghosted Hub" as const;
export const APP_TAGLINE = "The operating system for the Ghosted program." as const;
export const APP_DESCRIPTION =
  "A collaborative Project Lifecycle Management Platform that enables T4GC and OASIS to manage the complete lifecycle of nonprofit website projects." as const;

/** User roles with display labels */
export const USER_ROLES = {
  SUPER_ADMIN: { label: "Super Admin", color: "red" },
  ORGANIZER: { label: "Organizer", color: "purple" },
  MENTOR: { label: "Mentor", color: "blue" },
  TEAM_LEAD: { label: "Team Lead", color: "green" },
  STUDENT: { label: "Student", color: "cyan" },
  NONPROFIT_REP: { label: "Nonprofit Representative", color: "amber" },
} as const;

/** Cohort status flow (ordered) */
export const COHORT_STATUS_FLOW = [
  "DRAFT",
  "REGISTRATION",
  "SELECTION",
  "DISCOVERY",
  "DEVELOPMENT",
  "REVIEW",
  "TRAINING",
  "DEPLOYMENT",
  "COMPLETED",
  "ARCHIVED",
] as const;

/** Project status flow (ordered) */
export const PROJECT_STATUS_FLOW = [
  "CREATED",
  "DISCOVERY",
  "DEVELOPMENT",
  "INTERNAL_REVIEW",
  "REVISION",
  "NONPROFIT_REVIEW",
  "TRAINING",
  "FINAL_DELIVERABLES",
  "DEPLOYMENT_DECISION",
  "COMPLETED",
  "ARCHIVED",
] as const;

/** Application status flow */
export const APPLICATION_STATUS_FLOW = {
  STUDENT: ["APPLIED", "REVIEWED", "ACCEPTED", "REJECTED", "ASSIGNED", "COMPLETED", "WITHDRAWN"],
  NONPROFIT: ["APPLIED", "SCREENING", "INTERVIEW", "ACCEPTED", "REJECTED", "ASSIGNED", "COMPLETED", "WITHDRAWN"],
} as const;

/** Task status labels with Kanban column order */
export const TASK_STATUSES = [
  { value: "BACKLOG", label: "Backlog", color: "slate" },
  { value: "TODO", label: "To Do", color: "blue" },
  { value: "IN_PROGRESS", label: "In Progress", color: "amber" },
  { value: "IN_REVIEW", label: "In Review", color: "purple" },
  { value: "COMPLETED", label: "Completed", color: "green" },
] as const;

/** Task priority labels */
export const TASK_PRIORITIES = [
  { value: "LOW", label: "Low", color: "slate" },
  { value: "MEDIUM", label: "Medium", color: "blue" },
  { value: "HIGH", label: "High", color: "amber" },
  { value: "URGENT", label: "Urgent", color: "red" },
] as const;

/** Review categories with labels */
export const REVIEW_CATEGORIES = [
  { value: "DESIGN", label: "Design" },
  { value: "ACCESSIBILITY", label: "Accessibility" },
  { value: "PERFORMANCE", label: "Performance" },
  { value: "GHOST_VALIDATION", label: "Ghost Validation" },
  { value: "SEO", label: "SEO" },
  { value: "SECURITY", label: "Security" },
  { value: "RESPONSIVENESS", label: "Responsiveness" },
  { value: "CODE_QUALITY", label: "Code Quality" },
] as const;

/** Deliverable types with labels */
export const DELIVERABLE_TYPES = [
  { value: "THEME_ZIP", label: "Theme ZIP" },
  { value: "CONTENT_EXPORT", label: "Content Export" },
  { value: "ROUTES_YAML", label: "routes.yaml" },
  { value: "REDIRECTS_YAML", label: "redirects.yaml" },
  { value: "GSCAN_REPORT", label: "GScan Report" },
  { value: "README", label: "README" },
  { value: "DOCUMENTATION", label: "Documentation" },
  { value: "ASSETS", label: "Assets" },
  { value: "LICENSE", label: "License" },
  { value: "OTHER", label: "Other" },
] as const;

/** Deployment options */
export const DEPLOYMENT_OPTIONS = [
  { value: "OASIS_HOSTING", label: "OASIS Hosting" },
  { value: "SELF_HOSTING", label: "Self Hosting" },
  { value: "THIRD_PARTY_HOSTING", label: "Third-party Hosting" },
] as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
