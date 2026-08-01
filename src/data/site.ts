export const site = {
  name: 'TigreGótico',
  legalName: 'TigreGótico Lda',
  url: 'https://tigregotico.pt',
  lang: 'en',
  locale: 'en_US',
  title: 'TigreGótico — Privacy-First Voice Technology',
  description:
    'FOSS AI and voice technology specialists. Creators of the HiveMind stack and core contributors to OpenVoiceOS, building privacy-first, GDPR-compliant voice solutions.',
  email: 'contact@tigregotico.pt',
  nif: 'PT517914190',
  address: {
    lines: ['Praceta António Sérgio, nº 317, 4º Esquerdo', '4450-048 Matosinhos', 'Portugal'],
    locality: 'Matosinhos',
    postalCode: '4450-048',
    country: 'PT',
  },
  defaultOgImage: '/og-default.png',
  repo: 'https://github.com/TigreGotico/tigregotico.github.io',
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
    { label: 'Games', href: '/games' },
    { label: 'Contact', href: '/contact' },
  ],
} as const;

export type Site = typeof site;
