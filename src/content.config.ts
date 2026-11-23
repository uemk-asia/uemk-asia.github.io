/**
 * Content schemas. These define which fields each content file may contain;
 * a build will fail with a clear message if a file does not match.
 *
 * - People:     src/content/people/*.md      (files starting with _ are ignored)
 * - Activities: src/content/activities/*.md   (files starting with _ are ignored)
 * - Resources:  src/content/resources.yaml
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().trim().min(1, 'Must not be empty');
const year = z.number().int('Use a whole year, e.g. 2022').min(1900).max(2100);
// The example template leaves unused links as "". Treat that as "not provided".
const optionalUrl = z
  .union([z.literal(''), z.url({ protocol: /^https?$/, error: 'Use a full http(s):// URL' })])
  .optional()
  .transform((value) => value || undefined);

const yearOrder = <T extends { startYear?: number; endYear?: number }>(item: T) =>
  !item.startYear || !item.endYear || item.endYear >= item.startYear;
const yearOrderError = { message: 'endYear must not be earlier than startYear', path: ['endYear'] };

/** A degree or programme of study. Shown under "Education". */
const education = z
  .object({
    institution: text,
    /** e.g. "B.Tech", "M.S.", "Ph.D." */
    degree: text.optional(),
    /** Major, department or field of study. */
    field: text.optional(),
    startYear: year.optional(),
    /** Graduation year, or expected graduation year while in progress. */
    endYear: year.optional(),
    status: z.enum(['in-progress', 'completed'], { error: 'Use "in-progress" or "completed"' }).optional(),
  })
  .refine(yearOrder, yearOrderError);

/** A job, faculty position or other appointment. Shown under "Affiliations". */
const affiliation = z
  .object({
    institution: text,
    /** e.g. "Professor & Assistant HOD", "Research Intern". */
    position: text.optional(),
    /** Department or group. */
    department: text.optional(),
    startYear: year.optional(),
    /** Leave out while the role is ongoing; it is then shown as "<startYear> – Present". */
    endYear: year.optional(),
    status: z.enum(['current', 'former'], { error: 'Use "current" or "former"' }).optional(),
  })
  .refine(yearOrder, yearOrderError);

// Shared fields for projects, publications, awards and talks.
const titled = { title: text, url: optionalUrl, year: year.optional() };

const people = defineCollection({
  // One Markdown file per person; the filename becomes the profile URL.
  // Files starting with "_" (such as _template.md) are not published.
  loader: glob({ pattern: '[^_]*.md', base: './src/content/people' }),
  schema: z.object({
    name: text,
    /** Public-facing role in UEMK ASIA. */
    role: text,
    /** Local path inside public/, e.g. /images/organizers/name.jpg. Only with consent. */
    photo: text
      .regex(/^\/(?!\/)[^?#]+\.(jpe?g|png|webp|avif)$/i, 'Use a local image path such as /images/organizers/name.jpg')
      .optional(),
    /** Optional meta description for the profile page. */
    description: text.optional(),
    education: z.array(education).default([]),
    affiliations: z.array(affiliation).default([]),
    /** Public contact email, shown on the profile and in the site footer. Only add with permission. */
    email: z.email('Use a valid email address, e.g. name@uem.edu.in').optional(),
    interests: z.array(text).default([]),
    projects: z.array(z.object({ ...titled, description: text.optional() })).default([]),
    publications: z.array(z.object({ ...titled, authors: text.optional(), venue: text.optional() })).default([]),
    awards: z.array(z.object({ ...titled, issuer: text.optional() })).default([]),
    talks: z.array(z.object({ ...titled, event: text.optional() })).default([]),
    links: z
      .object({
        website: optionalUrl,
        github: optionalUrl,
        linkedin: optionalUrl,
        scholar: optionalUrl,
        orcid: optionalUrl,
      })
      .prefault({}),
  }),
});

export const activityTypes = [
  'Reading group',
  'Workshop',
  'Seminar',
  'Guest lecture',
  'Research discussion',
  'Student project',
  'Community event',
  'Announcement',
] as const;

export const activityStatuses = ['upcoming', 'ongoing', 'planned', 'completed', 'cancelled'] as const;

const activities = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/activities' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(activityTypes),
    summary: z.string(),
    /**
     * upcoming  – scheduled, has a date
     * ongoing   – currently running (e.g. a weekly reading group)
     * planned   – being prepared, details not final
     * completed – already happened
     * cancelled – will not take place
     */
    status: z.enum(activityStatuses),
    date: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    /** e.g. "Room 301, UEM Kolkata", "Online (Google Meet)", "Hybrid" */
    location: z.string().optional(),
    registrationUrl: z.url().optional(),
    /** Show on the home page (only upcoming/ongoing/planned items are shown). */
    featured: z.boolean().default(false),
  }),
});

export const resourceCategories = [
  'Introduction to AI Safety',
  'Technical AI Alignment',
  'Interpretability and Evaluations',
  'AI Governance',
  'Research Papers',
  'External Learning Opportunities',
] as const;

const resources = defineCollection({
  loader: file('src/content/resources.yaml'),
  schema: z.object({
    title: z.string(),
    category: z.enum(resourceCategories),
    description: z.string(),
    url: z.url(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
    /** e.g. "Course", "Paper", "Book", "Website", "Video", "Program", "Tool" */
    format: z.string().optional(),
    /** Optional author/organization credit. */
    source: z.string().optional(),
  }),
});

export const collections = { people, activities, resources };
