import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Zap, Users, ArrowRight, CheckCircle, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const { t } = useLanguage();

  const consultingServices = [
    {
      title: t('services.onboarding.title'),
      description: t('services.onboarding.description'),
      icon: Target,
    },
    {
      title: t('services.retainer.title'),
      description: t('services.retainer.description'),
      icon: Zap,
    },
    {
      title: t('services.hourly.title'),
      description: t('services.hourly.description'),
      icon: Users,
    },
    {
      title: t('services.integrations.title'),
      description: t('services.integrations.description'),
      icon: CheckCircle,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
    hover: {
      y: -8,
      transition: { duration: 0.3 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Introduction Section */}
        <section className="py-20">
          <motion.div
            className="max-w-6xl mx-auto px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="text-center mb-16"
              variants={itemVariants}
            >
              <motion.div
                className="mb-8"
                variants={itemVariants}
              >
                <motion.div
                  className="w-16 h-0.5 bg-primary mx-auto mb-4"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  whileHover={{ scaleX: 1.2, transition: { duration: 0.3 } }}
                ></motion.div>
                <motion.div
                  className="w-8 h-0.5 bg-primary/60 mx-auto"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  whileHover={{ scaleX: 1.3, transition: { duration: 0.3 } }}
                ></motion.div>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-8 tracking-tight"
                variants={itemVariants}
              >
                {t('services.title')}
              </motion.h1>

              <motion.div
                className="w-24 h-0.5 bg-primary mx-auto mb-8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              ></motion.div>

              <motion.p
                className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light tracking-wide"
                variants={itemVariants}
              >
                {t('services.page.intro')}
              </motion.p>
            </motion.div>
          </motion.div>
        </section>

        {/* FOSS Consulting Section */}
        <section className="py-20">
          <motion.div
            className="max-w-6xl mx-auto px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="text-center mb-16"
              variants={itemVariants}
            >
              <motion.h2
                className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 tracking-tight"
                variants={itemVariants}
              >
                {t('services.consulting.headline')}
              </motion.h2>
              <motion.p
                className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light"
                variants={itemVariants}
              >
                {t('services.consulting.intro')}
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 gap-8 mb-16"
              variants={containerVariants}
            >
              {consultingServices.map((service, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Card className="border-0 shadow-gothic bg-white dark:bg-gray-800 h-full">
                    <CardHeader>
                      <motion.div
                        className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <service.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl font-serif font-semibold text-foreground tracking-tight">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed font-light">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center"
              variants={itemVariants}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link to="/contact">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg font-medium tracking-wide shadow-gothic">
                    {t('hero.cta.primary')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* TTS Training Section */}
        <section className="py-20">
          <motion.div
            className="max-w-6xl mx-auto px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="text-center mb-16"
              variants={itemVariants}
            >
              <motion.div
                className="mb-8"
                variants={itemVariants}
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
                className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 tracking-tight"
                variants={itemVariants}
              >
                {t('services.tts.headline')}
              </motion.h2>

              <motion.div
                className="w-24 h-0.5 bg-primary mx-auto mb-8"
                variants={itemVariants}
                transition={{ duration: 0.6, delay: 0.4 }}
              ></motion.div>

              <motion.div
                className="max-w-4xl mx-auto mb-12"
                variants={itemVariants}
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-8"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mic className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>

              <motion.p
                className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light tracking-wide"
                variants={itemVariants}
              >
                {t('services.tts.description')}
              </motion.p>
            </motion.div>

            <motion.div
              className="text-center"
              variants={itemVariants}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link to="/contact">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg font-medium tracking-wide shadow-gothic">
                    {t('services.getstarted')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Website Building Section */}
        <section className="py-20">
          <motion.div
            className="max-w-6xl mx-auto px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="text-center mb-16"
              variants={itemVariants}
            >
              <motion.h2
                className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 tracking-tight"
                variants={itemVariants}
              >
                {t('services.website.headline')}
              </motion.h2>
              <motion.p
                className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light mb-8"
                variants={itemVariants}
              >
                {t('services.website.intro')}
              </motion.p>
              <motion.p
                className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light italic"
                variants={itemVariants}
              >
                {t('services.portfolio')}
              </motion.p>
            </motion.div>

            <motion.div
              className="text-center"
              variants={itemVariants}
            >
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link to="/contact">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg font-medium tracking-wide shadow-gothic">
                    {t('services.website.cta')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
