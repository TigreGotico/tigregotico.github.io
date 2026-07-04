// UI strings for the site locales. Prose lives in src/content/pages/<locale>/;
// this module holds interface chrome and shared helpers.
//
// Portuguese is European Portuguese (pt-PT) throughout.

export type Locale = 'en' | 'pt' | 'es' | 'de' | 'nl' | 'fr';

export const locales: Locale[] = ['en', 'pt', 'es', 'de', 'nl', 'fr'];

/** Endonym shown in the language switcher. */
export const languageNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  de: 'Deutsch',
  nl: 'Nederlands',
  fr: 'Français',
};

/** Locales that have fully translated blog posts (others fall back to English). */
export const blogLocales: Locale[] = ['en', 'pt'];

/** Pages that exist in every locale (path without base, no trailing slash). */
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
    chooseLanguage: 'Choose language',
    nav: { home: 'Home', about: 'About', blog: 'Blog', projects: 'Open Source', services: 'Services', games: 'Games', contact: 'Contact' },
    footer: {
      tagline: 'Privacy-first voice technology and FOSS AI — built to run on your own hardware.',
      explore: 'Explore', projects: 'Projects', connect: 'Connect', voicesDemo: 'Voices Demo',
      privacy: 'Privacy', foss: 'Free and open-source software.', appearance: 'Appearance', vat: 'VAT',
    },
    a11y: { skip: 'Skip to content', primaryNav: 'Primary', mobileNav: 'Primary (mobile)', openMenu: 'Open navigation menu', closeMenu: 'Close navigation menu' },
  },
  pt: {
    lang: 'pt-PT',
    locale: 'pt_PT',
    chooseLanguage: 'Escolher idioma',
    nav: { home: 'Início', about: 'Sobre', blog: 'Blogue', projects: 'Código Aberto', services: 'Serviços', games: 'Jogos', contact: 'Contacto' },
    footer: {
      tagline: 'Tecnologia de voz centrada na privacidade e IA em código aberto — feita para correr no seu próprio hardware.',
      explore: 'Explorar', projects: 'Projetos', connect: 'Ligações', voicesDemo: 'Demo de Vozes',
      privacy: 'Privacidade', foss: 'Software livre e de código aberto.', appearance: 'Aspeto', vat: 'NIF',
    },
    a11y: { skip: 'Saltar para o conteúdo', primaryNav: 'Principal', mobileNav: 'Principal (móvel)', openMenu: 'Abrir menu de navegação', closeMenu: 'Fechar menu de navegação' },
  },
  es: {
    lang: 'es',
    locale: 'es_ES',
    chooseLanguage: 'Elegir idioma',
    nav: { home: 'Inicio', about: 'Nosotros', blog: 'Blog', projects: 'Código Abierto', services: 'Servicios', games: 'Juegos', contact: 'Contacto' },
    footer: {
      tagline: 'Tecnología de voz centrada en la privacidad e IA de código abierto — hecha para funcionar en tu propio hardware.',
      explore: 'Explorar', projects: 'Proyectos', connect: 'Conectar', voicesDemo: 'Demo de Voces',
      privacy: 'Privacidad', foss: 'Software libre y de código abierto.', appearance: 'Apariencia', vat: 'NIF',
    },
    a11y: { skip: 'Saltar al contenido', primaryNav: 'Principal', mobileNav: 'Principal (móvil)', openMenu: 'Abrir el menú de navegación', closeMenu: 'Cerrar el menú de navegación' },
  },
  de: {
    lang: 'de',
    locale: 'de_DE',
    chooseLanguage: 'Sprache wählen',
    nav: { home: 'Start', about: 'Über uns', blog: 'Blog', projects: 'Open Source', services: 'Leistungen', games: 'Spiele', contact: 'Kontakt' },
    footer: {
      tagline: 'Datenschutzorientierte Sprachtechnologie und quelloffene KI — gebaut, um auf Ihrer eigenen Hardware zu laufen.',
      explore: 'Entdecken', projects: 'Projekte', connect: 'Verbinden', voicesDemo: 'Stimmen-Demo',
      privacy: 'Datenschutz', foss: 'Freie und quelloffene Software.', appearance: 'Darstellung', vat: 'USt-IdNr.',
    },
    a11y: { skip: 'Zum Inhalt springen', primaryNav: 'Hauptnavigation', mobileNav: 'Hauptnavigation (mobil)', openMenu: 'Navigationsmenü öffnen', closeMenu: 'Navigationsmenü schließen' },
  },
  nl: {
    lang: 'nl',
    locale: 'nl_NL',
    chooseLanguage: 'Taal kiezen',
    nav: { home: 'Start', about: 'Over ons', blog: 'Blog', projects: 'Open Source', services: 'Diensten', games: 'Games', contact: 'Contact' },
    footer: {
      tagline: 'Privacy-first spraaktechnologie en open-source AI — gemaakt om op je eigen hardware te draaien.',
      explore: 'Verkennen', projects: 'Projecten', connect: 'Verbinden', voicesDemo: 'Stemmen-demo',
      privacy: 'Privacy', foss: 'Vrije en opensourcesoftware.', appearance: 'Weergave', vat: 'btw',
    },
    a11y: { skip: 'Naar inhoud springen', primaryNav: 'Hoofdnavigatie', mobileNav: 'Hoofdnavigatie (mobiel)', openMenu: 'Navigatiemenu openen', closeMenu: 'Navigatiemenu sluiten' },
  },
  fr: {
    lang: 'fr',
    locale: 'fr_FR',
    chooseLanguage: 'Choisir la langue',
    nav: { home: 'Accueil', about: 'À propos', blog: 'Blog', projects: 'Open Source', services: 'Services', games: 'Jeux', contact: 'Contact' },
    footer: {
      tagline: 'Technologie vocale axée sur la confidentialité et IA open source — conçue pour fonctionner sur votre propre matériel.',
      explore: 'Explorer', projects: 'Projets', connect: 'Nous suivre', voicesDemo: 'Démo des voix',
      privacy: 'Confidentialité', foss: 'Logiciel libre et open source.', appearance: 'Apparence', vat: 'TVA',
    },
    a11y: { skip: 'Aller au contenu', primaryNav: 'Principale', mobileNav: 'Principale (mobile)', openMenu: 'Ouvrir le menu de navigation', closeMenu: 'Fermer le menu de navigation' },
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

/** Prefix a site-relative path with the locale segment (all but 'en'). */
export function localePath(locale: Locale, href: string) {
  if (locale === 'en') return href;
  return href === '/' ? `/${locale}/` : `/${locale}${href}`;
}

/** Content-collection entry id for a prose page in the given locale. */
export function pageEntryId(locale: Locale, name: string) {
  return locale === 'en' ? name : `${locale}/${name}`;
}

/** Strip any locale sub-folder from a blog entry id to get its clean slug. */
export function blogSlug(id: string) {
  return id.replace(/^(pt|es|de|nl|fr)\//, '');
}

/** URL (without base) for a blog post in the given locale. */
export function blogPath(locale: Locale, slug: string) {
  return locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`;
}
