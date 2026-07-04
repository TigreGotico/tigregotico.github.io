// UI strings for the site locales. Prose lives in src/content/pages/<locale>/;
// this module holds interface chrome and shared helpers.
//
// Portuguese is European Portuguese (pt-PT) throughout.

export type Locale = 'en' | 'pt' | 'es' | 'de' | 'nl' | 'fr' | 'it' | 'ru';

export const locales: Locale[] = ['en', 'pt', 'es', 'de', 'nl', 'fr', 'it', 'ru'];

/** Endonym shown in the language switcher. */
export const languageNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  de: 'Deutsch',
  nl: 'Nederlands',
  fr: 'Français',
  it: 'Italiano',
  ru: 'Русский',
};

/** Locales that have fully translated blog posts (others fall back to English). */
export const blogLocales: Locale[] = ['en', 'pt', 'es', 'de', 'nl', 'fr', 'it', 'ru'];

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
  it: {
    lang: 'it',
    locale: 'it_IT',
    chooseLanguage: 'Scegli la lingua',
    nav: { home: 'Home', about: 'Chi siamo', blog: 'Blog', projects: 'Open Source', services: 'Servizi', games: 'Giochi', contact: 'Contatti' },
    footer: {
      tagline: 'Tecnologia vocale attenta alla privacy e IA open source — pensata per funzionare sul tuo hardware.',
      explore: 'Esplora', projects: 'Progetti', connect: 'Seguici', voicesDemo: 'Demo delle voci',
      privacy: 'Privacy', foss: 'Software libero e open source.', appearance: 'Aspetto', vat: 'P.IVA',
    },
    a11y: { skip: 'Vai al contenuto', primaryNav: 'Principale', mobileNav: 'Principale (mobile)', openMenu: 'Apri il menu di navigazione', closeMenu: 'Chiudi il menu di navigazione' },
  },
  ru: {
    lang: 'ru',
    locale: 'ru_RU',
    chooseLanguage: 'Выберите язык',
    nav: { home: 'Главная', about: 'О нас', blog: 'Блог', projects: 'Открытый код', services: 'Услуги', games: 'Игры', contact: 'Контакты' },
    footer: {
      tagline: 'Голосовые технологии с приоритетом приватности и открытый ИИ — работают на вашем собственном оборудовании.',
      explore: 'Обзор', projects: 'Проекты', connect: 'Связаться', voicesDemo: 'Демо голосов',
      privacy: 'Конфиденциальность', foss: 'Свободное ПО с открытым исходным кодом.', appearance: 'Оформление', vat: 'НДС',
    },
    a11y: { skip: 'Перейти к содержимому', primaryNav: 'Основная', mobileNav: 'Основная (мобильная)', openMenu: 'Открыть меню навигации', closeMenu: 'Закрыть меню навигации' },
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
  return id.replace(/^(pt|es|de|nl|fr|it|ru)\//, '');
}

/** URL (without base) for a blog post in the given locale. */
export function blogPath(locale: Locale, slug: string) {
  return locale === 'en' ? `/blog/${slug}` : `/${locale}/blog/${slug}`;
}

/** Blog post-page chrome, per locale. */
export const blogUI: Record<Locale, { allPosts: string; minRead: string; newer: string; older: string; more: string }> = {
  en: { allPosts: 'All posts', minRead: 'min read', newer: 'Newer', older: 'Older', more: 'More posts' },
  pt: { allPosts: 'Todos os artigos', minRead: 'min de leitura', newer: 'Mais recente', older: 'Mais antigo', more: 'Mais artigos' },
  es: { allPosts: 'Todos los artículos', minRead: 'min de lectura', newer: 'Más reciente', older: 'Más antiguo', more: 'Más artículos' },
  de: { allPosts: 'Alle Beiträge', minRead: 'Min. Lesezeit', newer: 'Neuer', older: 'Älter', more: 'Weitere Beiträge' },
  nl: { allPosts: 'Alle artikelen', minRead: 'min leestijd', newer: 'Nieuwer', older: 'Ouder', more: 'Meer artikelen' },
  fr: { allPosts: 'Tous les articles', minRead: 'min de lecture', newer: 'Plus récent', older: 'Plus ancien', more: "Plus d'articles" },
  it: { allPosts: 'Tutti gli articoli', minRead: 'min di lettura', newer: 'Più recente', older: 'Più vecchio', more: 'Altri articoli' },
  ru: { allPosts: 'Все статьи', minRead: 'мин чтения', newer: 'Новее', older: 'Старее', more: 'Ещё статьи' },
};

/** Project-card chrome, per locale. */
export const cardUI: Record<Locale, { selfHosted: string; selfHostedTitle: string; viewRepo: string; featured: string; comingSoon: string; comingSoonLong: string }> = {
  en: { selfHosted: 'Self-hosted', selfHostedTitle: 'Runs on your own hardware — no mandatory cloud', viewRepo: 'View repository', featured: 'Featured', comingSoon: 'Coming soon', comingSoonLong: 'Coming soon — not yet public' },
  pt: { selfHosted: 'Auto-hospedado', selfHostedTitle: 'Corre no seu próprio hardware — sem nuvem obrigatória', viewRepo: 'Ver repositório', featured: 'Destaque', comingSoon: 'Em breve', comingSoonLong: 'Em breve — ainda não público' },
  es: { selfHosted: 'Autoalojado', selfHostedTitle: 'Se ejecuta en tu propio hardware, sin nube obligatoria', viewRepo: 'Ver repositorio', featured: 'Destacado', comingSoon: 'Próximamente', comingSoonLong: 'Próximamente — aún no público' },
  de: { selfHosted: 'Selbst gehostet', selfHostedTitle: 'Läuft auf Ihrer eigenen Hardware — keine verpflichtende Cloud', viewRepo: 'Repository ansehen', featured: 'Empfohlen', comingSoon: 'Demnächst', comingSoonLong: 'Demnächst — noch nicht öffentlich' },
  nl: { selfHosted: 'Zelf gehost', selfHostedTitle: 'Draait op je eigen hardware — geen verplichte cloud', viewRepo: 'Repository bekijken', featured: 'Uitgelicht', comingSoon: 'Binnenkort', comingSoonLong: 'Binnenkort — nog niet openbaar' },
  fr: { selfHosted: 'Auto-hébergé', selfHostedTitle: 'Fonctionne sur votre propre matériel — aucun cloud obligatoire', viewRepo: 'Voir le dépôt', featured: 'En vedette', comingSoon: 'Bientôt disponible', comingSoonLong: 'Bientôt disponible — pas encore public' },
  it: { selfHosted: 'Self-hosted', selfHostedTitle: 'Funziona sul tuo hardware — nessun cloud obbligatorio', viewRepo: 'Vedi il repository', featured: 'In evidenza', comingSoon: 'Prossimamente', comingSoonLong: 'Prossimamente — non ancora pubblico' },
  ru: { selfHosted: 'Self-hosted', selfHostedTitle: 'Работает на вашем оборудовании — без обязательного облака', viewRepo: 'Открыть репозиторий', featured: 'Рекомендуемое', comingSoon: 'Скоро', comingSoonLong: 'Скоро — пока не опубликовано' },
};
