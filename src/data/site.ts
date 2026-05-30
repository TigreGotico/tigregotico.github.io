export const site = {
  name: 'TigreGótico',
  legalName: 'TigreGótico Lda',
  url: 'https://tigregotico.github.io',
  lang: 'en',
  locale: 'en_US',
  title: 'TigreGótico — Privacy-First Voice Technology',
  description:
    'FOSS AI and voice technology specialists. Creators of the HiveMind stack and core contributors to OpenVoiceOS, building privacy-first, GDPR-compliant voice solutions.',
  email: 'jarbasai@mailfence.com',
  defaultOgImage: '/og-default.png',
  socials: {
    github: 'https://github.com/TigreGotico',
    huggingface: 'https://huggingface.co/TigreGotico',
    linkedin: 'https://www.linkedin.com/company/tigregotico',
    openvoiceos: 'https://openvoiceos.org',
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Open Source', href: '/projects' },
    { label: 'Services', href: '/services' },
    { label: 'Resources', href: '/resources' },
    { label: 'Games', href: '/games' },
    { label: 'Contact', href: '/contact' },
  ],
} as const;

export type Site = typeof site;
