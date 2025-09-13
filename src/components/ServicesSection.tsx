import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Target, Zap, Users } from 'lucide-react';

const ServicesSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Target,
      title: t('services.consulting.title'),
      description: t('services.consulting.description'),
    },
    {
      icon: Zap,
      title: t('services.plugins.title'),
      description: t('services.plugins.description'),
    },
    {
      icon: Users,
      title: t('services.website.title'),
      description: t('services.website.description'),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    hover: {
      y: -8,
      transition: { duration: 0.2 },
    },
  };

  return (
    <section id="services" className="py-20 lg:py-32 bg-gradient-subtle">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            className="mb-8"
            variants={itemVariants}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-16 h-0.5 bg-primary mx-auto mb-4"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scaleX: 1.2, transition: { duration: 0.3 } }}
            ></motion.div>
            <motion.div
              className="w-8 h-0.5 bg-primary/60 mx-auto"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scaleX: 1.3, transition: { duration: 0.3 } }}
            ></motion.div>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-8 tracking-tight"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('services.title')}
          </motion.h2>

          <motion.div
            className="w-24 h-0.5 bg-primary mx-auto mb-8"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.4 }}
          ></motion.div>

          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light"
            variants={itemVariants}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {t('services.subtitle')}
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="group text-center"
              variants={cardVariants}
              whileHover="hover"
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <motion.div
                className="mb-8"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <service.icon className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>

              <motion.h3
                className="text-xl font-serif font-semibold text-foreground mb-6 tracking-tight"
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {service.title}
              </motion.h3>

              <motion.div
                className="w-12 h-0.5 bg-primary/30 mx-auto mb-6"
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.4 }}
              ></motion.div>

              <motion.p
                className="text-muted-foreground leading-relaxed font-light tracking-wide"
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {service.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;