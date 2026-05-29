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
    openvoiceos: 'https://openvoiceos.org',
  },
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Products', href: '/products' },
    { label: 'Games', href: '/games' },
    { label: 'Projects', href: '/projects' },
    { label: 'Resources', href: '/resources' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
} as const;

export type Site = typeof site;
