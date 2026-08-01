// UI strings for the site locales. Prose lives in src/content/pages/<locale>/;
// this module holds interface chrome and shared helpers.
//
// Portuguese is European Portuguese (pt-PT) throughout.

export type Locale = 'en' | 'pt' | 'es' | 'de' | 'nl' | 'fr' | 'it' | 'ru' | 'ar' | 'fa' | 'hi' | 'zh' | 'ko' | 'ja';

export const locales: Locale[] = ['en', 'pt', 'es', 'de', 'nl', 'fr', 'it', 'ru', 'ar', 'fa', 'hi', 'zh', 'ko', 'ja'];

/** Endonym shown in the language switcher. */
/** Text direction per locale. */
export const dir: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr', pt: 'ltr', es: 'ltr', de: 'ltr', nl: 'ltr', fr: 'ltr', it: 'ltr', ru: 'ltr', ar: 'rtl', fa: 'rtl', hi: 'ltr', zh: 'ltr', ko: 'ltr', ja: 'ltr',
};

export const languageNames: Record<Locale, string> = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  de: 'Deutsch',
  nl: 'Nederlands',
  fr: 'Français',
  it: 'Italiano',
  ru: 'Русский',
  ar: 'العربية',
  fa: 'فارسی',
  hi: 'हिन्दी',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
};

/** Locales that have fully translated blog posts (others fall back to English). */
export const blogLocales: Locale[] = ['en', 'pt', 'es', 'de', 'nl', 'fr', 'it', 'ru', 'ar', 'fa', 'hi', 'zh', 'ko', 'ja'];

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
      source: 'Site source code',
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
      source: 'Código-fonte do site',
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
      source: 'Código fuente del sitio',
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
      source: 'Quellcode der Website',
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
      source: 'Broncode van de site',
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
      source: 'Code source du site',
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
      source: 'Codice sorgente del sito',
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
      source: 'Исходный код сайта',
    },
    a11y: { skip: 'Перейти к содержимому', primaryNav: 'Основная', mobileNav: 'Основная (мобильная)', openMenu: 'Открыть меню навигации', closeMenu: 'Закрыть меню навигации' },
  },
  ar: {
    lang: 'ar',
    locale: 'ar_AR',
    chooseLanguage: 'اختر اللغة',
    nav: { home: 'الرئيسية', about: 'من نحن', blog: 'المدونة', projects: 'مفتوح المصدر', services: 'الخدمات', games: 'الألعاب', contact: 'اتصل بنا' },
    footer: {
      tagline: 'تقنية صوتية تحترم الخصوصية وذكاء اصطناعي مفتوح المصدر — مصمّمة للعمل على أجهزتك الخاصة.',
      explore: 'استكشف', projects: 'المشاريع', connect: 'تواصل', voicesDemo: 'عرض الأصوات',
      privacy: 'الخصوصية', foss: 'برمجيات حرّة ومفتوحة المصدر.', appearance: 'المظهر', vat: 'الرقم الضريبي',
      source: 'شفرة المصدر للموقع',
    },
    a11y: { skip: 'انتقل إلى المحتوى', primaryNav: 'الرئيسية', mobileNav: 'الرئيسية (للجوال)', openMenu: 'افتح قائمة التنقل', closeMenu: 'أغلق قائمة التنقل' },
  },
  fa: {
    lang: 'fa',
    locale: 'fa_IR',
    chooseLanguage: 'انتخاب زبان',
    nav: { home: 'خانه', about: 'درباره ما', blog: 'وبلاگ', projects: 'متن‌باز', services: 'خدمات', games: 'بازی‌ها', contact: 'تماس' },
    footer: {
      tagline: 'فناوری صوتی حریم‌خصوصی‌محور و هوش مصنوعی متن‌باز — ساخته‌شده برای اجرا روی سخت‌افزار خودتان.',
      explore: 'کاوش', projects: 'پروژه‌ها', connect: 'ارتباط', voicesDemo: 'نمایش صداها',
      privacy: 'حریم خصوصی', foss: 'نرم‌افزار آزاد و متن‌باز.', appearance: 'ظاهر', vat: 'شناسهٔ مالیاتی',
      source: 'کد منبع وب‌سایت',
    },
    a11y: { skip: 'پرش به محتوا', primaryNav: 'اصلی', mobileNav: 'اصلی (موبایل)', openMenu: 'باز کردن منوی ناوبری', closeMenu: 'بستن منوی ناوبری' },
  },
  hi: {
    lang: 'hi',
    locale: 'hi_IN',
    chooseLanguage: 'भाषा चुनें',
    nav: { home: 'होम', about: 'हमारे बारे में', blog: 'ब्लॉग', projects: 'ओपन सोर्स', services: 'सेवाएँ', games: 'खेल', contact: 'संपर्क' },
    footer: {
      tagline: 'गोपनीयता-प्रथम वॉइस तकनीक और FOSS AI — आपके अपने हार्डवेयर पर चलने के लिए बनाई गई।',
      explore: 'खोजें', projects: 'परियोजनाएँ', connect: 'जुड़ें', voicesDemo: 'आवाज़ डेमो',
      privacy: 'गोपनीयता', foss: 'मुक्त और ओपन-सोर्स सॉफ़्टवेयर।', appearance: 'रूप', vat: 'कर संख्या',
      source: 'साइट का सोर्स कोड',
    },
    a11y: { skip: 'सामग्री पर जाएँ', primaryNav: 'मुख्य', mobileNav: 'मुख्य (मोबाइल)', openMenu: 'नेविगेशन मेन्यू खोलें', closeMenu: 'नेविगेशन मेन्यू बंद करें' },
  },
  zh: {
    lang: 'zh',
    locale: 'zh_CN',
    chooseLanguage: '选择语言',
    nav: { home: '首页', about: '关于我们', blog: '博客', projects: '开源', services: '服务', games: '游戏', contact: '联系' },
    footer: {
      tagline: '隐私优先的语音技术与开源 AI —— 专为在你自己的硬件上运行而打造。',
      explore: '探索', projects: '项目', connect: '联系我们', voicesDemo: '语音演示',
      privacy: '隐私', foss: '自由与开源软件。', appearance: '外观', vat: '税号',
      source: '网站源代码',
    },
    a11y: { skip: '跳到内容', primaryNav: '主导航', mobileNav: '主导航（移动）', openMenu: '打开导航菜单', closeMenu: '关闭导航菜单' },
  },
  ko: {
    lang: 'ko',
    locale: 'ko_KR',
    chooseLanguage: '언어 선택',
    nav: { home: '홈', about: '소개', blog: '블로그', projects: '오픈 소스', services: '서비스', games: '게임', contact: '문의' },
    footer: {
      tagline: '프라이버시 우선 음성 기술과 오픈소스 AI — 여러분의 하드웨어에서 실행되도록 만들어졌습니다.',
      explore: '둘러보기', projects: '프로젝트', connect: '연결', voicesDemo: '음성 데모',
      privacy: '개인정보', foss: '자유 오픈소스 소프트웨어.', appearance: '테마', vat: '사업자번호',
      source: '사이트 소스 코드',
    },
    a11y: { skip: '본문으로 건너뛰기', primaryNav: '주요', mobileNav: '주요 (모바일)', openMenu: '내비게이션 메뉴 열기', closeMenu: '내비게이션 메뉴 닫기' },
  },
  ja: {
    lang: 'ja',
    locale: 'ja_JP',
    chooseLanguage: '言語を選択',
    nav: { home: 'ホーム', about: '会社概要', blog: 'ブログ', projects: 'オープンソース', services: 'サービス', games: 'ゲーム', contact: 'お問い合わせ' },
    footer: {
      tagline: 'プライバシー重視の音声技術とオープンソースAI — ご自身のハードウェアで動作するように作られています。',
      explore: '見る', projects: 'プロジェクト', connect: 'つながる', voicesDemo: '音声デモ',
      privacy: 'プライバシー', foss: '自由でオープンソースなソフトウェア。', appearance: '外観', vat: '税番号',
      source: 'サイトのソースコード',
    },
    a11y: { skip: 'コンテンツへスキップ', primaryNav: 'メイン', mobileNav: 'メイン（モバイル）', openMenu: 'ナビゲーションメニューを開く', closeMenu: 'ナビゲーションメニューを閉じる' },
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
  return id.replace(/^(pt|es|de|nl|fr|it|ru|ar|fa|hi|zh|ko|ja)\//, '');
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
  ar: { allPosts: 'كل المقالات', minRead: 'دقيقة قراءة', newer: 'الأحدث', older: 'الأقدم', more: 'مزيد من المقالات' },
  fa: { allPosts: 'همهٔ مقاله‌ها', minRead: 'دقیقه مطالعه', newer: 'جدیدتر', older: 'قدیمی‌تر', more: 'مقاله‌های بیشتر' },
  hi: { allPosts: 'सभी लेख', minRead: 'मिनट पढ़ें', newer: 'नया', older: 'पुराना', more: 'और लेख' },
  zh: { allPosts: '全部文章', minRead: '分钟阅读', newer: '较新', older: '较旧', more: '更多文章' },
  ko: { allPosts: '전체 글', minRead: '분 읽기', newer: '최신', older: '이전', more: '더 많은 글' },
  ja: { allPosts: 'すべての記事', minRead: '分で読めます', newer: '新しい', older: '古い', more: 'もっと読む' },
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
  ar: { selfHosted: 'استضافة ذاتية', selfHostedTitle: 'يعمل على أجهزتك الخاصة — دون سحابة إلزامية', viewRepo: 'عرض المستودع', featured: 'مميّز', comingSoon: 'قريبًا', comingSoonLong: 'قريبًا — ليس عامًّا بعد' },
  fa: { selfHosted: 'خودمیزبان', selfHostedTitle: 'روی سخت‌افزار خودتان اجرا می‌شود — بدون ابر اجباری', viewRepo: 'مشاهدهٔ مخزن', featured: 'برگزیده', comingSoon: 'به‌زودی', comingSoonLong: 'به‌زودی — هنوز عمومی نشده' },
  hi: { selfHosted: 'स्व-होस्टेड', selfHostedTitle: 'आपके अपने हार्डवेयर पर चलता है — कोई अनिवार्य क्लाउड नहीं', viewRepo: 'रिपॉज़िटरी देखें', featured: 'विशेष', comingSoon: 'जल्द आ रहा है', comingSoonLong: 'जल्द आ रहा है — अभी सार्वजनिक नहीं' },
  zh: { selfHosted: '自托管', selfHostedTitle: '在你自己的硬件上运行 —— 无强制云', viewRepo: '查看仓库', featured: '精选', comingSoon: '即将推出', comingSoonLong: '即将推出 —— 尚未公开' },
  ko: { selfHosted: '자체 호스팅', selfHostedTitle: '여러분의 하드웨어에서 실행 — 필수 클라우드 없음', viewRepo: '저장소 보기', featured: '추천', comingSoon: '출시 예정', comingSoonLong: '출시 예정 — 아직 비공개' },
  ja: { selfHosted: 'セルフホスト', selfHostedTitle: 'ご自身のハードウェアで動作 — 必須のクラウドなし', viewRepo: 'リポジトリを見る', featured: '注目', comingSoon: '近日公開', comingSoonLong: '近日公開 — まだ非公開' },
};

/** Footer note on native languages + machine translation, per locale. */
export const langNote: Record<Locale, string> = {
  en: "English and Portuguese are our native languages; every other translation is machine-generated. Write to us in any language — we'll use machine translation if needed.",
  pt: 'O português e o inglês são as nossas línguas nativas; todas as outras traduções são geradas automaticamente. Escreva-nos em qualquer língua — usaremos tradução automática se necessário.',
  es: 'Esta página está traducida automáticamente; nuestras lenguas nativas son el portugués y el inglés. Escríbanos en cualquier idioma: usaremos traducción automática si es necesario.',
  de: 'Diese Seite wurde maschinell übersetzt; unsere Muttersprachen sind Portugiesisch und Englisch. Schreiben Sie uns in einer beliebigen Sprache — wir nutzen bei Bedarf maschinelle Übersetzung.',
  nl: 'Deze pagina is machinaal vertaald; onze moedertalen zijn Portugees en Engels. Schrijf ons in elke taal — we gebruiken indien nodig machinevertaling.',
  fr: "Cette page est traduite automatiquement ; nos langues natives sont le portugais et l'anglais. Écrivez-nous dans n'importe quelle langue — nous utiliserons la traduction automatique si nécessaire.",
  it: 'Questa pagina è tradotta automaticamente; le nostre lingue native sono il portoghese e l’inglese. Scrivici in qualsiasi lingua — useremo la traduzione automatica se necessario.',
  ru: 'Эта страница переведена машинно; наши родные языки — португальский и английский. Пишите нам на любом языке — при необходимости мы воспользуемся машинным переводом.',
  ar: 'هذه الصفحة مُترجَمة آليًا؛ لغتانا الأصليتان هما البرتغالية والإنجليزية. راسِلنا بأي لغة — وسنستخدم الترجمة الآلية عند الحاجة.',
  fa: 'این صفحه به‌صورت ماشینی ترجمه شده است؛ زبان‌های مادری ما پرتغالی و انگلیسی هستند. به هر زبانی برای ما بنویسید — در صورت نیاز از ترجمهٔ ماشینی استفاده می‌کنیم.',
  hi: 'यह पृष्ठ मशीन-अनुवादित है; हमारी मातृभाषाएँ पुर्तगाली और अंग्रेज़ी हैं। हमें किसी भी भाषा में लिखें — आवश्यकता होने पर हम मशीन अनुवाद का उपयोग करेंगे।',
  zh: '本页面为机器翻译；我们的母语是葡萄牙语和英语。请用任何语言联系我们 —— 需要时我们会使用机器翻译。',
  ko: '이 페이지는 기계 번역되었습니다. 저희의 모국어는 포르투갈어와 영어입니다. 어떤 언어로든 연락 주세요 — 필요하면 기계 번역을 사용합니다.',
  ja: 'このページは機械翻訳です。私たちの母語はポルトガル語と英語です。どの言語でもお問い合わせください — 必要に応じて機械翻訳を使用します。',
};

/** Games page banner: most game repos are private for now. */
export const gamesComingSoon: Record<Locale, string> = {
  en: "Our games are in active development — most aren't public yet. pyFrotz is available today; the rest are coming soon.",
  pt: 'Os nossos jogos estão em desenvolvimento ativo — a maioria ainda não é pública. O pyFrotz já está disponível; os restantes estão para breve.',
  es: 'Nuestros juegos están en desarrollo activo: la mayoría aún no son públicos. pyFrotz ya está disponible; el resto llegará pronto.',
  de: 'Unsere Spiele befinden sich in aktiver Entwicklung — die meisten sind noch nicht öffentlich. pyFrotz ist bereits verfügbar; der Rest folgt in Kürze.',
  nl: 'Onze games zijn volop in ontwikkeling — de meeste zijn nog niet openbaar. pyFrotz is nu beschikbaar; de rest komt binnenkort.',
  fr: "Nos jeux sont en développement actif — la plupart ne sont pas encore publics. pyFrotz est disponible dès aujourd'hui ; le reste arrive bientôt.",
  it: 'I nostri giochi sono in fase di sviluppo attivo — la maggior parte non è ancora pubblica. pyFrotz è già disponibile; il resto arriverà presto.',
  ru: 'Наши игры в активной разработке — большинство ещё не опубликованы. pyFrotz уже доступен; остальное скоро появится.',
  ar: 'ألعابنا قيد التطوير النشط — معظمها ليس عامًّا بعد. pyFrotz متاح اليوم؛ والبقية قريبًا.',
  fa: 'بازی‌های ما در حال توسعهٔ فعال هستند — بیشترشان هنوز عمومی نشده‌اند. pyFrotz هم‌اکنون در دسترس است؛ بقیه به‌زودی می‌آیند.',
  hi: 'हमारे खेल सक्रिय विकास में हैं — अधिकांश अभी सार्वजनिक नहीं हैं। pyFrotz आज उपलब्ध है; बाकी जल्द आ रहे हैं।',
  zh: '我们的游戏正在积极开发中 —— 大多数尚未公开。pyFrotz 现已可用；其余即将推出。',
  ko: '저희 게임은 활발히 개발 중입니다 — 대부분 아직 비공개입니다. pyFrotz는 지금 이용 가능하며, 나머지는 곧 공개됩니다.',
  ja: '私たちのゲームは活発に開発中です — ほとんどはまだ非公開です。pyFrotz は現在利用可能で、残りは近日公開予定です。',
};
