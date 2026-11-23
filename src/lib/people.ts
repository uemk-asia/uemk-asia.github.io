import { site } from '../config/site';
import { statSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { peoplePage, type PeopleSectionConfig } from './data';

export type Person = CollectionEntry<'people'>;
export type Affiliation = Person['data']['affiliations'][number];
export type Education = Person['data']['education'][number];
export type PeopleSection = Omit<PeopleSectionConfig, 'members'> & { members: Person[] };

const PROFILE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** All published profiles. File names must be valid URL slugs. */
export async function getPeople() {
  const people = await getCollection('people');
  for (const person of people) {
    if (!PROFILE_ID.test(person.id)) {
      throw new Error(
        `Invalid profile file name "src/content/people/${person.id}.md": use lowercase letters, numbers and single hyphens, e.g. jane-doe.md`,
      );
    }
  }
  return people;
}

/**
 * Sections from src/data/people-sections.json, with member IDs replaced by
 * their Markdown profiles. Order follows the JSON file exactly.
 */
export async function getPeopleSections(): Promise<PeopleSection[]> {
  const byId = new Map((await getPeople()).map((person) => [person.id, person]));
  return peoplePage.sections.map((section) => ({
    ...section,
    members: section.members.map((id) => {
      const person = byId.get(id);
      if (!person) {
        const known = [...byId.keys()].sort().join(', ') || '(none)';
        throw new Error(
          `Invalid src/data/people-sections.json: section "${section.id}" lists member "${id}", but there is no src/content/people/${id}.md.\n  Available profiles: ${known}`,
        );
      }
      return person;
    }),
  }));
}

export const profileUrl = (person: Person) => `/people/${person.id}/`;

/**
 * Returns the photo path only if the file exists in public/, so a missing or
 * misspelled file shows the neutral avatar instead of a broken image.
 */
export function photoFor(person: Person) {
  const { photo } = person.data;
  if (!photo) return undefined;
  const publicDir = resolve('public');
  const file = resolve(publicDir, `.${photo}`);
  if (!file.startsWith(`${publicDir}${sep}`)) return undefined;
  try {
    if (statSync(file).isFile()) return photo;
  } catch {
    /* fall through */
  }
  console.warn(`[people] Photo not found for ${person.id}: public${photo} — showing the placeholder avatar.`);
  return undefined;
}

export const initials = (name: string) =>
  name
    .replace(/\b(Prof|Dr|Mr|Ms|Mrs)\.\s*/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/**
 * Years for a degree: "2018–2022", "2025–2027", "2025" or undefined.
 * An in-progress degree with no end year is shown as "2025 – Present".
 */
export function educationYears({ startYear, endYear, status }: Education) {
  if (startYear && endYear) return startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;
  if (startYear) return status === 'completed' ? `${startYear}` : `${startYear} – Present`;
  if (endYear) return `${endYear}`;
  return undefined;
}

/**
 * Years for a job or appointment. Ongoing roles have no end date, so they are
 * shown as "2019 – Present" (or just "Present" when the start year is unknown).
 */
export function affiliationYears({ startYear, endYear, status }: Affiliation) {
  if (startYear && endYear) return startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;
  if (endYear) return `Until ${endYear}`;
  if (status === 'former') return startYear ? `From ${startYear}` : 'Former';
  return startYear ? `${startYear} – Present` : 'Present';
}

export const educationStatusLabels: Record<NonNullable<Education['status']>, string> = {
  'in-progress': 'In progress',
  completed: 'Completed',
};

/**
 * The line shown under a person's name: their first current affiliation, else a
 * degree in progress, else the first affiliation or degree listed.
 */
const isOngoingAffiliation = (a: Affiliation) => a.status !== 'former' && !a.endYear;
const isOngoingEducation = (e: Education) => e.status === 'in-progress' || (!e.endYear && e.status !== 'completed');

/** Newest first: ongoing entries, then by end year (or start year), most recent first. Ties keep file order. */
function newestFirst<T extends { startYear?: number; endYear?: number }>(items: T[], ongoing: (item: T) => boolean): T[] {
  const latest = (item: T) => (ongoing(item) ? Infinity : (item.endYear ?? item.startYear ?? -Infinity));
  return [...items].sort((a, b) => latest(b) - latest(a) || (b.startYear ?? -Infinity) - (a.startYear ?? -Infinity) || 0);
}

export const sortedAffiliations = (person: Person) => newestFirst(person.data.affiliations ?? [], isOngoingAffiliation);
export const sortedEducation = (person: Person) => newestFirst(person.data.education ?? [], isOngoingEducation);

// Matches the host institution however it is written ("&" vs "and", punctuation, short form).
const normalize = (name: string) => name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
const hostNames = new Set([site.institution, site.institutionShort].map(normalize));
/** Whether an affiliation or education entry is at the host institution (UEM Kolkata). */
export const isAtHostInstitution = ({ institution }: { institution: string }) => hostNames.has(normalize(institution));

export function primaryAffiliation(person: Person): { position?: string; institution: string } | undefined {
  const affiliations = sortedAffiliations(person);
  const education = sortedEducation(person);
  const job = affiliations.find(isOngoingAffiliation);
  const study = education.find((e) => e.status === 'in-progress');
  const pick = job ?? study ?? affiliations[0] ?? education[0];
  if (!pick) return undefined;
  return { position: 'position' in pick ? pick.position : undefined, institution: pick.institution };
}
