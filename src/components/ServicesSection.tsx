import { useLanguage } from '@/contexts/LanguageContext';
import { Target, Zap, Users } from 'lucide-react';

const ServicesSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Target,
      title: t('services.strategy.title'),
      description: t('services.strategy.description'),
    },
    {
      icon: Zap,
      title: t('services.digital.title'),
      description: t('services.digital.description'),
    },
    {
      icon: Users,
      title: t('services.management.title'),
      description: t('services.management.description'),
    },
  ];

  return (
    <section id="services" className="py-32 bg-gradient-subtle">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="mb-8">
            <div className="w-16 h-0.5 bg-primary mx-auto mb-4"></div>
            <div className="w-8 h-0.5 bg-primary/60 mx-auto"></div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-gothic font-bold text-foreground mb-8 tracking-gothic">
            {t('services.title')}
          </h2>
          
          <div className="w-24 h-0.5 bg-primary mx-auto mb-8"></div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group text-center"
            >
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-primary rounded-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500">
                  <service.icon className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-gothic font-semibold text-foreground mb-6 tracking-gothic">
                {service.title}
              </h3>
              
              <div className="w-12 h-0.5 bg-primary/30 mx-auto mb-6"></div>
              
              <p className="text-muted-foreground leading-relaxed font-light tracking-wide">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;