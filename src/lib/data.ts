import { z } from 'astro/zod';
import peopleSectionsData from '../data/people-sections.json';
import curriculumData from '../data/curriculum.json';
import resourcesData from '../data/resources.json';
import eventsData from '../data/events.json';
import homeData from '../data/home.json';

const text = z.string().trim().min(1, 'Must not be empty');
const id = text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens');
const url = z.url().refine((value) => {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}, 'Use an HTTP or HTTPS URL');
// Blank optional strings (e.g. "description": "") are treated as not provided.
const optionalText = z.string().trim().optional().transform((value) => value || undefined);
// People profiles live in src/content/people/*.md; this file only groups and orders them.
const peopleSection = z.object({
  id, title: text, description: optionalText,
  emptyPlaceholder: optionalText,
  members: z.array(id).default([]),
  /** Whether members' emails are listed in the site footer's contact section. */
  showInFooter: z.boolean().default(true),
});
const peopleSections = z.object({ pageTitle: text, introduction: optionalText, sections: z.array(peopleSection) });
const reading = z.object({ title: text, url: url.optional(), author: text.optional(), note: text.optional() });
const assignment = z.object({ title: text, description: text.optional(), url: url.optional() });
const curriculumModule = z.object({
  id, title: text, description: text.optional(),
  /** When the module runs, e.g. "Weeks 1–2 · 11–22 Jan". */
  weeks: optionalText,
  /** Short tag shown next to the title, e.g. "Required" or "Recommended". */
  badge: optionalText,
  topics: z.array(text).default([]),
  readings: z.array(reading).default([]),
  assignments: z.array(assignment).default([]),
  resources: z.array(reading).default([]),
});
// A recurring session, e.g. the weekly discussion or a monthly workshop.
const session = z.object({ title: text, frequency: text, duration: optionalText, description: optionalText });
// Optional work to do before the semester starts (prerequisites, preparatory courses).
const preparation = z.object({
  title: text, timing: optionalText, description: optionalText,
  modules: z.array(curriculumModule).default([]),
});
const semester = z.object({
  id, year: z.number().int('Use a whole year, e.g. 2027').min(2000).max(2100), label: text, title: text, description: text.optional(),
  /** Free text, e.g. "Monday 11 January – Friday 28 May 2027". */
  dates: optionalText,
  schedule: z.array(session).default([]),
  /** Shown under the schedule, e.g. "Day and time to be announced." */
  scheduleNote: optionalText,
  preparation: preparation.optional(),
  objectives: z.array(text).default([]),
  modules: z.array(curriculumModule).default([]),
  additionalResources: z.array(reading).default([]),
});
const curriculumSchema = z.object({ pageTitle: text, description: text, notice: text.optional(), semesters: z.array(semester) });
const resource = z.object({
  id, title: text, description: text, url,
  level: text.optional(), format: text.optional(), type: text.optional(),
  source: text.optional(), organization: text.optional(), featured: z.boolean().optional(),
});
const resourceGroup = z.object({
  id, title: text, description: text.optional(),
  resources: z.array(resource).default([]), related: z.array(id).default([]),
});
const resourceSection = resourceGroup.extend({ groups: z.array(resourceGroup).default([]) });
const date = text.refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, 'Use a valid date in YYYY-MM-DD format');
const event = z.object({
  id, title: text, date, summary: text,
  location: text.optional(), url: url.optional(),
});
const home = z.object({ eyebrow: text, eyebrowInstitution: text, headline: text, introduction: text, mission: text, about: text });

function validate<T>(name: string, schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((issue) => `  ${issue.path.length ? issue.path.join('.') : '(root)'}: ${issue.message}`).join('\n');
    throw new Error(`Invalid src/data/${name}.json:\n${details}`);
  }
  return result.data;
}
function uniqueIds(name: string, ids: string[]) {
  const seen = new Set<string>();
  for (const item of ids) {
    if (seen.has(item)) throw new Error(`Invalid src/data/${name}.json: duplicate id "${item}"`);
    seen.add(item);
  }
}
export const peoplePage = validate('people-sections', peopleSections, peopleSectionsData);
export const curriculum = validate('curriculum', curriculumSchema, curriculumData);
export const resourceGroups = validate('resources', z.array(resourceSection), resourcesData);
export const events = validate('events', z.array(event), eventsData);
export const homepage = validate('home', home, homeData);
uniqueIds('people-sections', peoplePage.sections.map((section) => section.id));
for (const section of peoplePage.sections) uniqueIds('people-sections', section.members);
// Semester and module IDs are both used as anchors on the curriculum page.
uniqueIds('curriculum', curriculum.semesters.flatMap((item) => [item.id, ...[...(item.preparation?.modules ?? []), ...item.modules].map((module) => module.id)]));
const allResourceGroups = resourceGroups.flatMap((section) => [section, ...section.groups]);
export const allResources = allResourceGroups.flatMap((group) => group.resources);
// All IDs share an HTML anchor namespace, including sections, groups and cards.
uniqueIds('resources', [...allResourceGroups.map((group) => group.id), ...allResources.map((item) => item.id)]);
const resourceIds = new Set(allResources.map((item) => item.id));
for (const group of allResourceGroups) {
  for (const ref of group.related) {
    if (!resourceIds.has(ref)) throw new Error(`Invalid src/data/resources.json: group "${group.id}" refers to unknown resource "${ref}"`);
  }
}
uniqueIds('events', events.map((item) => item.id));
export type PeopleSectionConfig = z.infer<typeof peopleSection>;
export type Semester = z.infer<typeof semester>;
export type CurriculumModule = z.infer<typeof curriculumModule>;
export type Reading = z.infer<typeof reading>;
export type Resource = z.infer<typeof resource>;
export type Event = z.infer<typeof event>;

// Compare calendar dates in Kolkata, not the build runner's time zone.
export function groupEvents(now = new Date()) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  return { upcoming: sorted.filter((item) => item.date >= today), past: sorted.filter((item) => item.date < today).reverse() };
}
export function formatEventDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}
