# UEMK ASIA website

A static Astro website for the Alignment & Safety Initiative for AI at UEM Kolkata. It uses TypeScript and Tailwind CSS and is deployed with GitHub Pages. There is no backend or on-site collection of personal information.

## Local development

Use Node.js 22.23.4 or later (Node 24 is used in GitHub Actions) and npm:

```sh
npm ci
npm run dev
```

Open the local address printed by Astro. Before opening a pull request, run:

```sh
npm run check
npm run build
npm run check:links
```

The link checker requests external URLs in the built pages. Some sites block automated requests; inspect any failures manually. Also check the pages on a phone-sized screen and with a keyboard.

## Editing JSON content

The files in `src/data/` are JSON arrays or objects (people's profiles are Markdown; see below). Keep the quotation marks, commas and brackets valid. Entries appear in the order written unless otherwise noted. The build validates required fields, URLs, dates and duplicate IDs, and reports the file and field when data is invalid. IDs use lowercase letters, numbers and hyphens; keep them stable when editing titles. Do not publish unapproved people, photographs, events or claims.

### People

Each person has one Markdown file in `src/content/people/`. That file is the only place their details are stored. The file name becomes the profile URL: `src/content/people/jane-doe.md` is published at `/people/jane-doe/`. File names use lowercase letters, numbers and hyphens. Files starting with `_` are ignored. `_template.md` lists every supported field with comments.

**Adding a person**

1. Copy `src/content/people/_template.md` to a new file such as `jane-doe.md`.
2. Fill in the frontmatter. Only `name` and `role` are required; delete optional fields you do not use.
3. Write the approved biography as Markdown below the frontmatter. Leave it empty if there is none.
4. To list the person on `/people/`, add the file name without `.md` to a section's `members` array in `src/data/people-sections.json`.

A profile that is not listed in any section still gets its own page but does not appear in the directory. A listed name with no matching file stops the build, and the error lists the available profiles.

```markdown
---
name: Jane Doe
role: Organizer
photo: /images/organizers/jane-doe.webp
affiliations:             # jobs/appointments (optional)
  - institution: University of Engineering & Management, Kolkata
    position: Teaching Assistant
    department: Computer Science and Engineering
    startYear: 2025         # no endYear -> "2025 – Present"
    status: current         # current | former
education:                # degrees (optional)
  - institution: University of Engineering & Management, Kolkata
    degree: B.Tech
    field: Computer Science and Engineering
    startYear: 2023
    endYear: 2027
    status: in-progress     # in-progress | completed
interests: [Interpretability, Evaluations]
publications:
  - title: Paper title
    authors: J. Doe, A. Author
    venue: Conference
    year: 2026
    url: https://example.org/paper
links:
  linkedin: https://www.linkedin.com/in/example
---

## About

Approved biography in Markdown.
```

This example illustrates the structure only. Publish real details only with the person's permission.

**What each field controls**

- **`affiliations`** (jobs and appointments: `position`, `department`) and **`education`** (degrees: `degree`, `field`) are both optional. Each forms its own sidebar section ("Affiliations", then "Education") and appears only when it has entries; Only `institution` is required in an entry.
- **Years:** for an ongoing affiliation give only `startYear`; it is shown as "2019 – Present" (or just "Present" without a year). Past roles take `endYear` or `status: former`. Education shows `startYear–endYear` (the expected end year for a degree in progress) and its status.
- **Header line** under the name shows the first current affiliation; if there is none, the first in-progress degree; otherwise the most recent entry. Entries in each list are sorted newest first (ongoing ones at the top), whatever order they are written in. People-page cards show only the entries at University of Engineering & Management, Kolkata (matched against `institution` in `src/config/site.ts`); the full list is on the profile page. Someone with no UEM Kolkata entry shows their most recent entry on the card.
- **Changing a role or affiliation:** edit `role`, `affiliations` or `education` in the person's file.
- **Interests** (`interests`, a list of short phrases) appear as a bulleted "Interests" section directly below the biography.
- **Optional sections:** `interests`, `projects`, `publications`, `awards` and `talks` appear only when they have entries. Each project, publication, award or talk needs a `title`; `url`, `year` and the other listed fields are optional.
- **`email`** (optional) is shown on the profile under "Contact & links". The site footer lists the email of everyone who appears on the People page and has one (except sections with `"showInFooter": false` in `people-sections.json`, such as Faculty Advisors), under "Reach out to the organizers over email". Add an email only with the person's permission.
- **`links`** supports `website`, `github`, `linkedin`, `scholar` and `orcid`, which must be full `https://` URLs.
- **`description`** is optional and sets the page's search and social-preview description.

**Photos**

1. Put an approved, compressed, square JPG, PNG, WebP or AVIF in `public/images/organizers/`. About 400–500 px is enough.
2. Set `photo: /images/organizers/<file>`.

If `photo` is omitted or the file is missing, a neutral initials avatar is shown, so no broken image appears; the build prints a warning for missing files. Only publish photographs with consent.

**Sections and ordering**

`src/data/people-sections.json` controls only grouping and order.

- `pageTitle` and `introduction` set the page heading.
- Sections appear in the order written. People appear in the order of each section's `members` array.
- `"showInFooter": false` on a section keeps its members' emails out of the site footer's contact list (they still show on profile pages). It defaults to `true`.
- To add a new category, add an object with a unique `id`, a `title`, an optional `description` and `members`. No component changes are needed.
- An empty section is hidden unless it has an `emptyPlaceholder` text.

`/organizers/` is a static redirect to `/people/` (configured in `astro.config.mjs`), so old links keep working.

### Curriculum

Edit `src/data/curriculum.json`. The current content is an illustrative draft. Do not add credits, instructors, dates or approvals unless the organizers have confirmed them.

- `pageTitle`, `description` and an optional `notice` set the page heading.
- `semesters` is an ordered array. Each semester has a `year` (e.g. `2027`). The **Year** dropdown lists every distinct year in order of first appearance, and the first one is selected by default. Under it, the semester switcher shows the semesters of the selected year. Adding a semester object adds a tab with no code changes, and a semester with a new `year` adds that year to the dropdown. A semester with no modules shows a "still being prepared" message.
- **Semester fields:** each semester needs a unique `id` (used in links such as `/curriculum/#semester-2`), a `year`, a `label` (the tab text, e.g. `Semester - Fall 27`) and a `title`. Optional fields are `description`, `dates` (free text, e.g. `Monday 11 January – Friday 28 May 2027`), `schedule` (recurring sessions, each with `title`, `frequency` and optional `duration` and `description`; shown as "How the semester runs"), `scheduleNote` (e.g. "Days and times to be announced"), `preparation` (work before the semester: `title`, optional `timing` and `description`, and `modules` in the same format as below, numbered "Preparation 1, 2…"), `objectives` (a list of strings), `modules` and `additionalResources`.
- **Module fields:** each module needs a unique `id` and a `title`. Optional fields are `description`, `weeks` (e.g. `Weeks 1–2 · 11–22 Jan`), `badge` (a short tag such as `Prerequisite` or `Recommended`), `topics` (strings), `readings`, `assignments` and `resources`.
- **Readings and resources** have `title`, plus optional `url`, `author` and `note`. **Assignments** have `title`, plus optional `description` and `url`.
- **Ordering:** reorder semesters, modules, readings or objectives by moving them in the array. Module numbers are assigned automatically.

```json
{
  "id": "semester-3",
  "year": 2028,
  "label": "Semester - Spring 28",
  "title": "Research Directions",
  "description": "A short summary.",
  "objectives": ["What participants should be able to do."],
  "modules": [
    {
      "id": "example-module",
      "title": "Example Module",
      "topics": ["Topic"],
      "readings": [{ "title": "Reading", "url": "https://example.org/", "author": "Author" }],
      "assignments": [{ "title": "Exercise", "description": "What to do." }]
    }
  ]
}
```

IDs must be unique across all semesters, preparation modules and modules. URLs must be `http(s)`. Invalid data stops the build with the file and field path.

### Events

Edit `src/data/events.json`. Each event requires a unique `id`, `title`, `date` in `YYYY-MM-DD` format, and `summary`; `location` and an external `url` are optional. Add only confirmed events. For example:

```json
[
  {
    "id": "example-event",
    "title": "Example Event",
    "date": "2027-01-15",
    "summary": "A short description of the confirmed event.",
    "location": "Online",
    "url": "https://example.org/event"
  }
]
```

Events are sorted by date at build time, with upcoming events first and past events separately below. An event remains upcoming throughout its calendar date in Kolkata. The GitHub Actions workflow rebuilds daily after midnight Kolkata time, so deployed classifications update without a content edit; scheduled GitHub Actions can be delayed or disabled in inactive repositories. For an immediate update, run the workflow manually. Include the time and time zone in `location` or `summary` if relevant.

### Resources and homepage

Edit `src/data/resources.json` to add, rename, remove, or reorder the five top-level sections. Each section has a unique `id`, `title`, optional `description`, and optional `resources` and `groups` arrays. A group has the same fields except it cannot contain further groups. Sections, groups, and cards render in the order written; their IDs must be unique across the page because they are also anchor targets.

Each resource needs a unique `id`, `title`, `description`, and HTTP or HTTPS `url`. Optional `level`, `type` (or `format`), `organization` (or `source`), and Boolean `featured` fields control its labels. For example:

```json
{
  "id": "technical-topic",
  "title": "Technical Topic",
  "description": "A short introduction to this direction.",
  "groups": [
    {
      "id": "example-direction",
      "title": "Example Direction",
      "description": "What the direction studies.",
      "resources": [
        {
          "id": "example-guide",
          "title": "Example Guide",
          "description": "A short description of the guide.",
          "url": "https://example.org/guide",
          "level": "Beginner",
          "type": "Guide",
          "organization": "Example Organization",
          "featured": true
        }
      ],
      "related": ["another-resource-id"]
    }
  ]
}
```

The example `related` ID must refer to a real card elsewhere in the same JSON file. Use `related` for a short link to an existing card instead of duplicating the same resource. The build rejects missing references and duplicate IDs. Check descriptions and links before publishing. For fellowships, link to official pages, avoid deadlines or claims that applications are open, and ask visitors to check the current cycle. Inclusion does not imply a partnership.

Edit `src/data/home.json` for the introduction, mission and About text. Edit `src/config/site.ts` for the approved logo path, verified contact details, approved social links and navigation. Empty contact fields remain hidden. The earlier draft pages and content files are retained for reference; the current homepage and directory use the JSON files above.

## Project structure

- `src/data/` — editable homepage, events, resources, curriculum and people-section JSON.
- `src/content/people/` — one Markdown file per person (single source of truth for profiles).
- `src/content.config.ts` — profile frontmatter schema.
- `src/lib/data.ts` — JSON schemas, validation, event sorting and date formatting.
- `src/lib/people.ts` — profile loading, section grouping and photo fallback.
- `src/pages/` — routes: Home, People (`people/index.astro`, `people/[slug].astro`), Curriculum, Resources and the 404 page.
- `src/components/` and `src/layouts/` — reusable interface and shared page layout.
- `src/styles/` — design tokens and global styles.
- `public/` — static icons, social preview and approved images.
- `.github/workflows/deploy.yml` — pull-request checks and GitHub Pages deployment.

The favicon and social preview use a typographic identity. To regenerate PNG assets after editing `public/favicon.svg` or the preview template, run `npm run assets` and commit the resulting files. Replace them with approved brand assets when available.

## Deployment

The site is fully static: every page, including each profile page and the `/organizers/` redirect, is generated at build time into `dist/`. Before publishing, validate and preview locally:

```sh
npm run check     # type and content validation
npm run build     # builds dist/; invalid content stops the build
npm run preview   # serves dist/ locally for a final look
```

In the repository's **Settings → Pages**, select **GitHub Actions** as the build and deployment source. Push a branch and open a pull request; the workflow checks and builds it. After review, merge into `main`: the workflow builds again and deploys `dist/` to GitHub Pages. The site is configured for the root of `https://uemk-asia.github.io/`. Confirm that the Actions run succeeds and visit the deployed URL after merging. Repository permissions and Pages settings must permit the workflow to deploy.
