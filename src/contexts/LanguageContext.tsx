import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.products': 'Products',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'Privacy-First Voice Technology',
    'hero.subtitle': ' ',
    'hero.description': ' ',
    'hero.cta.primary': 'Explore Our FOSS Consulting Services',
    'hero.cta.secondary': 'Discover Our Products',
    
    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'We are FOSS AI/Voice tech specialists committed to providing a reliable, privacy-focused alternative to proprietary systems. Our services empower your business to build voice technology solutions without compromising on user privacy, security, or ethical data practices.',
    'services.consulting.title': 'FOSS Voice Tech & AI Consulting',
    'services.consulting.description': 'Get expert guidance directly from the team that maintains the OVOS stack. We\'ll help you integrate privacy-first voice assistants into your products, ensuring GDPR compliance and full control over your data.',
    'services.plugins.title': 'OpenVoiceOS Plugins & Products',
    'services.plugins.description': 'Enhance your OVOS projects with our exclusive plugins and show your support for open source with official OVOS merchandise. Every purchase contributes directly to the maintenance of the OVOS non-profit.',
    'services.website.title': 'Website Building',
    'services.website.description': 'Your website is your digital home. We create custom, responsive websites that reflect your brand, with a FOSS-first approach and a deep understanding of modern web technologies. We built the official OpenVoiceOS website, a testament to our quality.',
    
    // Services Page
    'services.page.intro': 'We are FOSS AI/Voice tech specialists committed to providing a reliable, privacy-focused alternative to proprietary systems. Our services empower your business to build voice technology solutions without compromising on user privacy, security, or ethical data practices.',
    'services.consulting.headline': 'Ensure Privacy and Compliance with Expert FOSS Consulting',
    'services.consulting.intro': 'As the lead maintainers of the OpenVoiceOS and HiveMind stack, we offer an unparalleled depth of knowledge and a commitment to open-source excellence. Our consulting services are designed to help you navigate the complexities of voice AI development while ensuring your project remains secure and GDPR-compliant.',
    'services.onboarding.title': 'Onboarding & Integration Package',
    'services.onboarding.description': 'A foundational service to get your project off the ground. We provide full technical onboarding, guided integration into your existing systems, and a clear roadmap to a working prototype.',
    'services.retainer.title': 'Ongoing Technical Retainer',
    'services.retainer.description': 'For long-term projects, our retainer model provides dedicated, on-demand support. This includes regular consultations, technical problem-solving, and direct access to our core development team.',
    'services.hourly.title': 'Hourly Support Packs',
    'services.hourly.description': 'Need a quick hand? Our flexible hourly packs are perfect for troubleshooting, minor feature implementation, or simply getting expert advice when you need it most.',
    'services.integrations.title': 'Integrations',
    'services.integrations.description': 'We specialize in the OVOS stack, but our expertise extends to other popular open-source platforms, including Home Assistant, for seamless smart home integrations.',
    'services.website.headline': 'Professional Web Development with a FOSS-First Approach',
    'services.website.intro': 'Your online presence is a reflection of your brand. We design and develop custom websites and web applications with an emphasis on performance, security, and a privacy-first mindset.',
    'services.portfolio': 'We are proud to have developed and maintained the official OpenVoiceOS website, a live example of our commitment to clean code, responsive design, and open-source principles.',
    'services.website.cta': 'Let\'s Build Your Website',
    
    // TTS Training Service
    'services.tts.headline': 'Custom TTS Voice Training',
    'services.tts.description': 'Want a unique voice for your project? We offer a service to train a custom, high-quality, and fully offline Text-to-Speech (TTS) voice model for your application. Whether you have a ready-to-use dataset for a specific language or want to clone a reference audio, our service provides fast, privacy-first TTS models perfect for projects like OpenVoiceOS and Home Assistant. The result is a seamless and private voice experience that runs locally on your device, giving you full control over your data.',
    'services.getstarted': 'Get Started',
    
    // Products Page
    'products.plugins.headline': 'Unlock More Power with OpenVoiceOS Plugins',
    'products.plugins.intro': 'Our plugins are built to extend the functionality of OVOS and enhance your projects. We believe in the open-source spirit, which is why our plugins are offered on a unique "freemium" model: you pay to download the plugin, but it\'s still licensed under the BSD license, giving you full freedom to use and modify it.',
    'products.merch.headline': 'Show Your Support with Official OVOS Gear',
    'products.merch.intro': 'Every sticker and magnet you purchase is a direct investment in the open-source community. Your support helps us continue maintaining and improving the OpenVoiceOS stack for everyone.',
    
    // About Page
    'about.story': 'Founded with a deep passion for open source and a firm belief in digital privacy, TigreGóticoLda emerged to provide a professional backbone for the OpenVoiceOS and HiveMind stack. While OpenVoiceOS is a non-profit foundation, our company exists to ensure the long-term sustainability and expert maintenance of its core technologies.',
    'about.expertise': 'Our company is built on a foundation of unique knowledge: we are the lead developers and maintainers of the OpenVoiceOS and HiveMind voice stack. This isn\'t just a business for us—it\'s a mission. Our expertise is unparalleled because we\'ve been with this technology from its inception, making us the most reliable partners for your voice tech projects.',
    'about.mission': 'To empower businesses and individuals with privacy-focused, open-source voice technology solutions and professional services, championing a future of ethical and transparent AI.',
    
    // Contact
    'contact.title': 'Get in Touch',
    'contact.subtitle': '',
    'contact.description': 'Whether you need a quote for a custom project, have a question about our products, or just want to discuss a FOSS collaboration, we\'re ready to listen.',
    'contact.form.name': 'Full Name',
    'contact.form.email': 'Email Address',
    'contact.form.company': 'Company',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',
    
    // Footer
    'footer.rights': '© 2025 TigreGóticoLda. All rights reserved.',
    'footer.consulting': 'Privacy-First Voice Technology and FOSS AI Solutions',
    
    // Featured Projects
    'projects.title': 'Featured Projects',
    'projects.subtitle': 'Showcasing our commitment to open-source innovation and collaborative excellence',
    'projects.ilenia.headline': 'Driving Innovation with Open-Source Partnerships',
    'projects.ilenia.introduction': 'We collaborate with leading organizations to advance the capabilities of FOSS voice technology. A key example is our work with the ILENIA project, where we added support for Spanish, Galician, Basque, and Catalan to OpenVoiceOS, including full support for their speech models. This partnership highlights our ability to deliver robust, multi-lingual solutions that empower global communities.',
    'projects.ilenia.link': 'https://proyectoilenia.es',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.services': 'Serviços',
    'nav.products': 'Produtos',
    'nav.about': 'Sobre',
    'nav.contact': 'Contacto',
    
    // Hero Section
    'hero.title': 'Tecnologia de Voz com Prioridade na Privacidade e Soluções de IA FOSS.',
    'hero.subtitle': '',
    'hero.description': 'Num mundo de assistentes de voz ávidos de dados, oferecemos uma alternativa melhor. A TigreGóticoLda fornece serviços profissionais construídos nos princípios da privacidade, código aberto e soberania de dados. Como mantenedores principais do OpenVoiceOS e HiveMind stack, temos a experiência única para ajudá-lo a construir soluções de tecnologia de voz seguras e compatíveis com GDPR.',
    'hero.cta.primary': 'Explore Nossos Serviços de Consultoria FOSS',
    'hero.cta.secondary': 'Descubra Nossos Produtos',
    
    // Services
    'services.title': 'Nossos Serviços',
    'services.subtitle': 'Somos especialistas em IA/Voz FOSS comprometidos em fornecer uma alternativa confiável e focada na privacidade aos sistemas proprietários. Nossos serviços capacitam seu negócio a construir soluções de tecnologia de voz sem comprometer a privacidade, segurança ou práticas éticas de dados do usuário.',
    'services.consulting.title': 'Consultoria em Tecnologia de Voz e IA FOSS',
    'services.consulting.description': 'Obtenha orientação especializada diretamente da equipe que mantém o stack OVOS. Ajudaremos você a integrar assistentes de voz com prioridade na privacidade em seus produtos, garantindo conformidade com GDPR e controle total sobre seus dados.',
    'services.plugins.title': 'Plugins e Produtos OpenVoiceOS',
    'services.plugins.description': 'Melhore seus projetos OVOS com nossos plugins exclusivos e mostre seu apoio ao código aberto com mercadorias oficiais OVOS. Cada compra contribui diretamente para a manutenção da organização sem fins lucrativos OVOS.',
    'services.website.title': 'Construção de Websites',
    'services.website.description': 'Seu website é sua casa digital. Criamos websites personalizados e responsivos que refletem sua marca, com uma abordagem FOSS-first e um profundo entendimento das tecnologias web modernas. Construímos o website oficial do OpenVoiceOS, um testemunho de nossa qualidade.',
    
    // Services Page
    'services.page.intro': 'Somos especialistas em IA/Voz FOSS comprometidos em fornecer uma alternativa confiável e focada na privacidade aos sistemas proprietários. Nossos serviços capacitam seu negócio a construir soluções de tecnologia de voz sem comprometer a privacidade, segurança ou práticas éticas de dados do usuário.',
    'services.consulting.headline': 'Garanta Privacidade e Conformidade com Consultoria FOSS Especializada',
    'services.consulting.intro': 'Como principais mantenedores do OpenVoiceOS e HiveMind stack, oferecemos uma profundidade incomparável de conhecimento e um compromisso com a excelência de código aberto. Nossos serviços de consultoria são projetados para ajudá-lo a navegar pelas complexidades do desenvolvimento de IA de voz enquanto garante que seu projeto permaneça seguro e compatível com GDPR.',
    'services.onboarding.title': 'Pacote de Integração e Onboarding',
    'services.onboarding.description': 'Um serviço fundamental para colocar seu projeto em funcionamento. Fornecemos onboarding técnico completo, integração guiada em seus sistemas existentes e um roteiro claro para um protótipo funcional.',
    'services.retainer.title': 'Retainer Técnico Contínuo',
    'services.retainer.description': 'Para projetos de longo prazo, nosso modelo de retainer fornece suporte dedicado sob demanda. Isso inclui consultas regulares, resolução de problemas técnicos e acesso direto à nossa equipe principal de desenvolvimento.',
    'services.hourly.title': 'Pacotes de Suporte por Hora',
    'services.hourly.description': 'Precisa de uma mão rápida? Nossos pacotes por hora flexíveis são perfeitos para solução de problemas, implementação de recursos menores ou simplesmente obter conselhos especializados quando você mais precisa.',
    'services.integrations.title': 'Integrações',
    'services.integrations.description': 'Especializamo-nos no stack OVOS, mas nossa experiência se estende a outras plataformas populares de código aberto, incluindo Home Assistant, para integrações perfeitas de casa inteligente.',
    'services.website.headline': 'Desenvolvimento Web Profissional com Abordagem FOSS-First',
    'services.website.intro': 'Sua presença online é uma reflexão de sua marca. Projetamos e desenvolvemos websites e aplicações web personalizadas com ênfase em desempenho, segurança e uma mentalidade com prioridade na privacidade.',
    'services.portfolio': 'Temos orgulho de ter desenvolvido e mantido o website oficial do OpenVoiceOS, um exemplo vivo de nosso compromisso com código limpo, design responsivo e princípios de código aberto.',
    'services.website.cta': 'Vamos Construir Seu Website',
    
    // TTS Training Service
    'services.tts.headline': 'Treinamento de Voz TTS Personalizada',
    'services.tts.description': 'Quer uma voz única para seu projeto? Oferecemos um serviço para treinar um modelo de voz Text-to-Speech (TTS) personalizado, de alta qualidade e totalmente offline para sua aplicação. Seja você tem um conjunto de dados pronto para uso para um idioma específico ou quer clonar um áudio de referência, nosso serviço fornece modelos TTS rápidos e com prioridade na privacidade, perfeitos para projetos como OpenVoiceOS e Home Assistant. O resultado é uma experiência de voz perfeita e privada que roda localmente em seu dispositivo, dando-lhe controle total sobre seus dados.',
    'services.getstarted': 'Começar',
    
    // Products Page
    'products.plugins.headline': 'Desbloqueie Mais Poder com Plugins OpenVoiceOS',
    'products.plugins.intro': 'Nossos plugins são construídos para estender a funcionalidade do OVOS e melhorar seus projetos. Acreditamos no espírito do código aberto, por isso nossos plugins são oferecidos em um modelo único "freemium": você paga para baixar o plugin, mas ainda é licenciado sob a licença BSD, dando-lhe total liberdade para usar e modificá-lo.',
    'products.merch.headline': 'Mostre Seu Apoio com Equipamentos Oficiais OVOS',
    'products.merch.intro': 'Cada sticker e ímã que você compra é um investimento direto na comunidade de código aberto. Seu apoio nos ajuda a continuar mantendo e melhorando o stack OpenVoiceOS para todos.',
    
    // About Page
    'about.story': 'Fundada com uma profunda paixão pelo código aberto e uma firme crença na privacidade digital, a TigreGóticoLda surgiu para fornecer uma espinha dorsal profissional para o OpenVoiceOS e HiveMind stack. Enquanto o OpenVoiceOS é uma fundação sem fins lucrativos, nossa empresa existe para garantir a sustentabilidade de longo prazo e manutenção especializada de suas tecnologias principais.',
    'about.expertise': 'Nossa empresa é construída sobre uma fundação de conhecimento único: somos os principais desenvolvedores e mantenedores do stack de voz OpenVoiceOS e HiveMind. Isso não é apenas um negócio para nós—é uma missão. Nossa experiência é incomparável porque estivemos com essa tecnologia desde sua concepção, tornando-nos os parceiros mais confiáveis para seus projetos de tecnologia de voz.',
    'about.mission': 'Capacitar empresas e indivíduos com soluções de tecnologia de voz focadas na privacidade e código aberto e serviços profissionais, defendendo um futuro de IA ética e transparente.',
    
    // Contact
    'contact.title': 'Entre em Contato',
    'contact.subtitle': '',
    'contact.description': 'Seja você precisa de uma cotação para um projeto personalizado, tem uma pergunta sobre nossos produtos ou apenas quer discutir uma colaboração FOSS, estamos prontos para ouvir.',
    'contact.form.name': 'Nome Completo',
    'contact.form.email': 'Endereço de Email',
    'contact.form.company': 'Empresa',
    'contact.form.message': 'Mensagem',
    'contact.form.submit': 'Enviar Mensagem',
    
    // Footer
        // Footer
    'footer.rights': '© 2025 TigreGóticoLda. Todos os direitos reservados.',
    'footer.consulting': 'Tecnologia de Voz com Prioridade na Privacidade e Soluções de IA FOSS',
    
    // Featured Projects
    'projects.title': 'Projetos em Destaque',
    'projects.subtitle': 'Mostrando nosso compromisso com a inovação de código aberto e excelência colaborativa',
    'projects.ilenia.headline': 'Impulsionando a Inovação com Parcerias de Código Aberto',
    'projects.ilenia.introduction': 'Colaboramos com organizações líderes para avançar as capacidades da tecnologia de voz FOSS. Um exemplo chave é nosso trabalho com o projeto ILENIA, onde adicionamos suporte para espanhol, galego, basco e catalão ao OpenVoiceOS, incluindo suporte completo para seus modelos de fala. Esta parceria destaca nossa capacidade de entregar soluções multilíngues robustas que capacitam comunidades globais.',
    'projects.ilenia.link': 'https://proyectoilenia.es',
  }
};


const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Detect browser language or use stored preference
    const stored = localStorage.getItem('tigregotico-language') as Language;
    const browserLang = navigator.language.startsWith('pt') ? 'pt' : 'en';
    setLanguage(stored || browserLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('tigregotico-language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};