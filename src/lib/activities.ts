import { getCollection, type CollectionEntry } from 'astro:content';

export type Activity = CollectionEntry<'activities'>;

const time = (a: Activity) => a.data.date?.getTime() ?? Number.POSITIVE_INFINITY;

/**
 * Activities split into the groups shown on the Activities page:
 * current (ongoing + upcoming, soonest first), planned, and past
 * (completed + cancelled, most recent first).
 */
export async function getActivityGroups() {
  const all = await getCollection('activities');

  const current = all
    .filter((a) => a.data.status === 'ongoing' || a.data.status === 'upcoming')
    .sort((a, b) => {
      // Ongoing activities come before upcoming ones.
      if (a.data.status !== b.data.status) return a.data.status === 'ongoing' ? -1 : 1;
      return time(a) - time(b);
    });
  const planned = all.filter((a) => a.data.status === 'planned').sort((a, b) => time(a) - time(b));
  const past = all
    .filter((a) => a.data.status === 'completed' || a.data.status === 'cancelled')
    .sort((a, b) => time(b) - time(a));

  return { all, current, planned, past };
}

/** Featured, not-yet-finished activities for the home page. */
export async function getFeaturedActivities(limit = 3) {
  const { current, planned } = await getActivityGroups();
  return [...current, ...planned].filter((a) => a.data.featured).slice(0, limit);
}

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

export function formatDateRange(start?: Date, end?: Date) {
  if (!start) return undefined;
  return end ? dateFormat.formatRange(start, end) : dateFormat.format(start);
}

export const statusLabels: Record<Activity['data']['status'], string> = {
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  planned: 'Planned',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
