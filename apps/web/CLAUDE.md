---
name: ghosted-ui-design
description: Visual and interaction design direction for the Ghosted Program Management Platform. Use this whenever building, redesigning, or reviewing any screen, component, or page in Ghosted — dashboards, project workspaces, review flows, file managers, forms, tables, notifications. Ghosted must never look like a generic admin panel, a government portal, or a stock shadcn/ui template. Trigger this skill before writing any UI code, before proposing layouts, and before reviewing existing screens for visual quality.
---

# Ghosted UI Design

Ghosted is enterprise software, but it is not allowed to look like enterprise software. The people using it — student teams, volunteer mentors, nonprofit staff who are not technical, and program organizers juggling dozens of projects — are not paid to tolerate a boring tool. The product being *delivered* by this program is a beautiful, modern Ghost CMS website. The platform that manages that work should carry the same design confidence, or it undermines the thing it exists to produce. If a screen could be mistaken for a generic SaaS admin template, it has failed.

This skill governs **how Ghosted looks and feels**. It does not change the domain rules in the system instructions (Projects remain the center of gravity, RBAC still applies, etc.) — it governs the visual and interaction layer on top of that architecture.

## The trap to avoid

Enterprise PLM/CRM tools default to a specific ugly: dense gray tables, blue-on-white buttons, sidebar + topbar + breadcrumb stacked on every page, cards with a border and a shadow and nothing else, and status shown only as a colored pill with no other visual language. That is the "government portal" look. It is also, coincidentally, close to what an unstyled shadcn/ui build looks like before anyone makes a decision. Shipping the defaults is the failure mode here, not a neutral starting point.

Equally, avoid overcorrecting into a marketing-site look. Ghosted is a working tool used for hours at a time. Motion, color, and personality serve legibility and speed — they are never allowed to slow someone down or get in the way of scanning a table of forty projects.

The brief for every Ghosted screen: **calm, confident, editorial-adjacent software** — closer to Linear, Arc, or a well-run Notion workspace than to Jira or a county tax portal. Quiet most of the time, opinionated in a few specific places.

## Design tokens for Ghosted

These are starting points, not a locked palette — adapt per the actual brief, but do not drift back toward shadcn defaults (`slate-*` neutrals with a single `blue-600` accent and zero personality).

**Color** — one deep ink neutral, one warm paper/off-white surface, one confident brand accent that is *not* the default shadcn blue or the AI-cliché terracotta, and 2–3 status colors that read instantly at a glance in a dense table:
- Ink: near-black with a hint of warmth, e.g. `#16151A`, for primary text — never pure `#000`.
- Surface: soft warm white or a very light neutral, e.g. `#FAF9F6` or `#F5F5F2` — never sterile pure white everywhere; let panels and the base page differ by a shade.
- Brand accent: pick one saturated, specific color and commit — an indigo-violet, a deep teal, a clay-red — something that could become "Ghosted [color]" in someone's head. Use it sparingly: primary actions, active nav state, key data points. Not on every icon and every border.
- Status colors: distinct hues for on-track / needs-attention / blocked / approved that work as small dots, thin left-borders, or pill backgrounds — not just red/yellow/green defaults; desaturate slightly so they sit inside the palette instead of looking like a traffic light bolted on.

**Type** — a real type pairing, not the default sans everywhere:
- A display/UI face with some character for page titles, project names, and section headers (a grotesque with personality, or a serif for an editorial feel on report/deliverable views) — used with restraint, not on body copy.
- A clean, highly legible UI sans for body text, table cells, forms, and labels.
- A monospace or utility face for IDs, timestamps, file sizes, version numbers — anywhere a number needs to feel precise.
Set a real type scale (not four sizes that all look similar). Headings should feel like headings.

**Layout** — the sidebar + topbar + card grid is fine as a skeleton, but it needs a signature: a distinctive way of showing project status at a glance (a progress rail, a stage tracker across the top of a project workspace, a visual timeline rather than a table row), generous whitespace instead of cramming, and consistent card/panel radius and elevation used deliberately rather than everywhere.

**Signature element** — every major surface in Ghosted should have one thing that makes it recognizably Ghosted:
- The Project workspace: a persistent lifecycle rail (Discovery → Build → Review → Launch → Closed) rendered as a real visual object, not a breadcrumb.
- The Organizer dashboard: an "attention" surface that visually separates what's blocked/overdue from what's simply informational — not just another stat-card row.
- The Review flow: the Submitted → Review → Needs Changes → Resubmitted → Approved cycle shown as a visible, traversable path, so a mentor can see history, not just current state.
- File objects: real preview thumbnails and version chips, not a generic paperclip-and-filename row.

## Interaction and motion

Use motion to communicate state change, not to decorate: a deliverable moving from "Needs Changes" to "Resubmitted" should visibly transition, not just re-render; a newly assigned review should arrive with a subtle entrance, not a hard cut. Keep it fast (150–250ms), keep it purposeful, and respect reduced-motion preferences. Never animate for its own sake — this is a tool people live in for hours, and gratuitous motion becomes fatigue.

Every dashboard, list, and table should answer, at a glance and without a click: **what's happening, what needs attention, what can I do next.** Design the empty, loading, and error states with the same care as the populated state — an empty project list is a chance to say "no projects match these filters" or "no projects yet — start one," not a blank white rectangle.

## Working process

1. **Ground it in the actual screen.** Before styling anything, name what this specific page's one job is (e.g., "let a mentor triage every pending review across their projects in under a minute"). Design decisions should trace back to that job.
2. **Pick the token set deliberately.** Choose the accent color, the type pairing, and the one signature element for this surface before writing markup. State the choice.
3. **Build with shadcn/ui as structure, not as the final look.** Use its components for accessibility and behavior (focus states, keyboard nav, composability), but override tokens, radii, spacing, and typography so it doesn't read as an unstyled shadcn app. If a screen would look identical with the Ghosted branding removed, it isn't done.
4. **Respect data density.** Organizers and mentors deal with hundreds of projects and thousands of files. Tables need real search, filters, sort, saved views, and bulk actions (per the platform's own standards) — personality lives in color, type, and the signature elements around the data, not in making the data itself harder to scan.
5. **Self-critique before shipping.** Would this screen be mistaken for a stock admin template with the labels swapped? Does the accent color appear with intention rather than everywhere? Is there exactly one bold move on this screen, with everything else quiet and disciplined around it?

## Non-negotiables

- Never ship the shadcn default palette (slate neutrals + default blue) unchanged as "the design."
- Never let a form become a long unbroken scroll — break into steps/sections with progress, per the platform's form standards, and give that stepper a real visual identity too.
- Never represent status with color alone — pair color with icon or label for accessibility.
- Never sacrifice keyboard access, focus visibility, or contrast for aesthetic effect.
- Never let motion or decoration slow down scanning a dense table or dashboard — this is a daily-use tool, not a landing page.
