/**
 * Site-wide settings for the UEMK ASIA website.
 *
 * This is the one file to edit for contact details, the application form,
 * social links, and navigation. Leave a value empty ('' or []) until it has
 * been verified and approved by the organizers — the site hides anything
 * that is empty instead of showing a placeholder.
 */

export const site = {
  shortName: 'UEMK ASIA',
  fullName: 'Alignment & Safety Initiative for AI',
  institution: 'University of Engineering & Management, Kolkata',
  institutionShort: 'UEM Kolkata',
  url: 'https://uemk-asia.github.io',
  description:
    'UEMK ASIA (Alignment & Safety Initiative for AI) is an initiative at UEM Kolkata bringing together students, faculty, and researchers interested in AI safety and alignment.',
  repository: 'https://github.com/uemk-asia/uemk-asia.github.io',

  /**
   * Optional logo image (path inside public/, e.g. '/images/logo.svg').
   * When empty, the typographic "UEMK ASIA" wordmark is used instead.
   * Only use an approved logo.
   */
  logo: '',

  /** Verified contact email. Leave '' until an official address exists. */
  contactEmail: '',

  /**
   * Link to the approved external application form (e.g. Google Forms,
   * Microsoft Forms). Leave '' until the form is live. The website itself
   * never collects personal information.
   */
  joinFormUrl: '',

  /** Approved community and social links. Shown on the Join page and footer. */
  socials: [
    // { label: 'GitHub', url: 'https://github.com/uemk-asia' },
    // { label: 'LinkedIn', url: 'https://www.linkedin.com/company/...' },
  ] as { label: string; url: string }[],
};

export const nav = [
  { label: 'Curriculum', href: '/curriculum/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'People', href: '/people/' },
];

/**
 * Areas of interest listed on the About page.
 * Subject to organizer approval — edit freely.
 */
export const areasOfInterest = [
  {
    title: 'AI alignment',
    description:
      'How to build AI systems that reliably pursue the goals their developers and users intend.',
  },
  {
    title: 'Mechanistic interpretability',
    description:
      'Reverse-engineering the internal computations of neural networks to understand how they produce their outputs.',
  },
  {
    title: 'AI evaluations and robustness',
    description:
      'Measuring the capabilities and failure modes of AI systems, and making them dependable under unusual or adversarial conditions.',
  },
  {
    title: 'Responsible AI',
    description:
      'Fairness, transparency, privacy, and accountability in how AI systems are designed and deployed.',
  },
  {
    title: 'AI governance and safety',
    description:
      'The policies, standards, and institutions that shape how advanced AI is developed and used.',
  },
];

export const values = [
  {
    title: 'Intellectual openness',
    description: 'We welcome differing views and questions from every background and level of experience.',
  },
  {
    title: 'Research rigor',
    description: 'We value careful reasoning, honest uncertainty, and claims that are backed by evidence.',
  },
  {
    title: 'Responsible development',
    description: 'We consider the consequences of AI systems for the people and communities they affect.',
  },
  {
    title: 'Collaborative learning',
    description: 'We learn together, share what we know, and make the field more accessible to newcomers.',
  },
];
