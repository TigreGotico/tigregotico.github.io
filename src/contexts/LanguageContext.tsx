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
    'nav.contact': 'Contact',
    
    // Hero Section
    'hero.title': 'TigreGotico',
    'hero.subtitle': 'Voice & AI',
    'hero.description': 'We design and build advanced voice agents, conversational AI, and pioneering open-voice operating systems.',
    'hero.cta.primary': 'Get Started',
    'hero.cta.secondary': 'Learn More',
    
    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Expert Solutions for Modern Business Challenges',
    'services.strategy.title': 'Strategic Consulting',
    'services.strategy.description': 'Comprehensive business strategy development and implementation guidance for sustainable growth.',
    'services.digital.title': 'Digital Transformation',
    'services.digital.description': 'End-to-end digital solutions to modernize your business operations and customer experience.',
    'services.management.title': 'Change Management',
    'services.management.description': 'Expert guidance through organizational changes with minimal disruption and maximum efficiency.',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Ready to Transform Your Business?',
    'contact.description': 'Get in touch with our expert consultants to discuss how we can help your organization achieve its goals.',
    'contact.form.name': 'Full Name',
    'contact.form.email': 'Email Address',
    'contact.form.company': 'Company',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',
    
    // Footer
    'footer.rights': '© 2024 TigreGotico. All rights reserved.',
    'footer.consulting': 'Premium European Consulting Services',
  },
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.services': 'Serviços',
    'nav.contact': 'Contacto',
    
    // Hero Section
    'hero.title': 'TigreGotico',
    'hero.subtitle': 'Voz e IA',
    'hero.description': 'Desenvolvemos e construímos agentes de voz avançados, IA conversacional e sistemas operativos de voz pioneiros.',
    'hero.cta.primary': 'Começar',
    'hero.cta.secondary': 'Saiba Mais',
    
    // Services
    'services.title': 'Os Nossos Serviços',
    'services.subtitle': 'Soluções Especializadas para os Desafios Empresariais Modernos',
    'services.strategy.title': 'Consultoria Estratégica',
    'services.strategy.description': 'Desenvolvimento de estratégia empresarial abrangente e orientação para implementação visando crescimento sustentável.',
    'services.digital.title': 'Transformação Digital',
    'services.digital.description': 'Soluções digitais completas para modernizar as operações do seu negócio e a experiência do cliente.',
    'services.management.title': 'Gestão da Mudança',
    'services.management.description': 'Orientação especializada durante mudanças organizacionais com mínima disrupção e máxima eficiência.',
    
    // Contact
    'contact.title': 'Contacte-nos',
    'contact.subtitle': 'Prontos para Transformar o Seu Negócio?',
    'contact.description': 'Entre em contacto com os nossos consultores especializados para discutir como podemos ajudar a sua organização a alcançar os seus objetivos.',
    'contact.form.name': 'Nome Completo',
    'contact.form.email': 'Endereço de Email',
    'contact.form.company': 'Empresa',
    'contact.form.message': 'Mensagem',
    'contact.form.submit': 'Enviar Mensagem',
    
    // Footer
    'footer.rights': '© 2024 TigreGotico. Todos os direitos reservados.',
    'footer.consulting': 'Serviços de Consultoria Europeia Premium',
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