import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-gothic"></div>
      
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Gothic ornamental element */}
          <div className="mb-12">
            <div className="w-16 h-0.5 bg-white/60 mx-auto mb-4"></div>
            <div className="w-8 h-0.5 bg-white/40 mx-auto"></div>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-gothic font-bold text-white mb-8 leading-tight tracking-gothic">
            {t('hero.title')}
            <span className="block text-white/80 font-light mt-2">{t('hero.subtitle')}</span>
          </h1>
          
          <div className="w-24 h-0.5 bg-white/60 mx-auto mb-12"></div>
          
          <p className="text-lg md:text-xl text-white/90 mb-16 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/contact">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 px-12 py-6 text-base font-medium tracking-wide shadow-gothic transition-all duration-300 hover:scale-105 border-0"
              >
                {t('hero.cta.primary')}
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg"
              className="bg-transparent text-white border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm px-12 py-6 text-base font-medium tracking-wide transition-all duration-300"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('hero.cta.secondary')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;