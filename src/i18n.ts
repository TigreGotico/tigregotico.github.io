// UI strings for the two site locales. Content prose lives in
// src/content/pages/ (English) and src/content/pages/pt/ (Portuguese);
// this module only holds interface chrome and page-template strings.
//
// Portuguese is European Portuguese (pt-PT) throughout.

export type Locale = 'en' | 'pt';

export const locales: Locale[] = ['en', 'pt'];

/** Pages that exist in both languages (path without base, no trailing slash). */
export const translatedPaths = [
  '/',
  '/about',
  '/services',
  '/games',
  '/contact',
  '/privacy',
  '/projects',
  '/blog',
];

export const ui = {
  en: {
    lang: 'en',
    locale: 'en_US',
    switcher: { label: 'Português', hint: 'Ver em português' },
    nav: {
      home: 'Home',
      about: 'About',
      blog: 'Blog',
      projects: 'Open Source',
      services: 'Services',
      games: 'Games',
      contact: 'Contact',
    },
    footer: {
      tagline:
        'Privacy-first voice technology and FOSS AI — built to run on your own hardware.',
      explore: 'Explore',
      projects: 'Projects',
      connect: 'Connect',
      voicesDemo: 'Voices Demo',
      privacy: 'Privacy',
      foss: 'Free and open-source software.',
      appearance: 'Appearance',
    },
    a11y: {
      skip: 'Skip to content',
      primaryNav: 'Primary',
      mobileNav: 'Primary (mobile)',
      openMenu: 'Open navigation menu',
      closeMenu: 'Close navigation menu',
    },
  },
  pt: {
    lang: 'pt-PT',
    locale: 'pt_PT',
    switcher: { label: 'English', hint: 'View in English' },
    nav: {
      home: 'Início',
      about: 'Sobre',
      blog: 'Blogue',
      projects: 'Código Aberto',
      services: 'Serviços',
      games: 'Jogos',
      contact: 'Contacto',
    },
    footer: {
      tagline:
        'Tecnologia de voz centrada na privacidade e IA em código aberto — feita para correr no seu próprio hardware.',
      explore: 'Explorar',
      projects: 'Projetos',
      connect: 'Ligações',
      voicesDemo: 'Demo de Vozes',
      privacy: 'Privacidade',
      foss: 'Software livre e de código aberto.',
      appearance: 'Aspeto',
    },
    a11y: {
      skip: 'Saltar para o conteúdo',
      primaryNav: 'Principal',
      mobileNav: 'Principal (móvel)',
      openMenu: 'Abrir menu de navegação',
      closeMenu: 'Fechar menu de navegação',
    },
  },
} as const;

/** Nav in display order, localized. */
export function navItems(locale: Locale) {
  const t = ui[locale].nav;
  return [
    { label: t.home, href: '/' },
    { label: t.about, href: '/about' },
    { label: t.blog, href: '/blog' },
    { label: t.projects, href: '/projects' },
    { label: t.services, href: '/services' },
    { label: t.games, href: '/games' },
    { label: t.contact, href: '/contact' },
  ];
}

/** Prefix a site-relative path with the locale segment (pt only). */
export function localePath(locale: Locale, href: string) {
  if (locale === 'en') return href;
  return href === '/' ? '/pt/' : `/pt${href}`;
}

/** Content-collection entry id for a prose page in the given locale. */
export function pageEntryId(locale: Locale, name: string) {
  return locale === 'en' ? name : `pt/${name}`;
}
