import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Heart, Code } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      title: 'Privacy First',
      description: 'We believe digital privacy is a fundamental right, not a luxury.',
    },
    {
      icon: Code,
      title: 'Open Source',
      description: 'All our work is built on open-source principles and freely available.',
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Pushing the boundaries of voice technology while maintaining ethical standards.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Supporting and growing the open-source voice technology community.',
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

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16">
        {/* Header Section */}
        <section className="py-20 bg-gradient-subtle">
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
                ></motion.div>
                <motion.div
                  className="w-8 h-0.5 bg-primary/60 mx-auto"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                ></motion.div>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-gothic font-bold text-foreground mb-8 tracking-gothic"
                variants={itemVariants}
              >
                {t('nav.about')}
              </motion.h1>

              <motion.div
                className="w-24 h-0.5 bg-primary mx-auto mb-8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              ></motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Our Story Section */}
        <section className="py-20">
          <motion.div
            className="max-w-4xl mx-auto px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="text-center mb-12"
              variants={itemVariants}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-gothic font-bold text-foreground mb-6 tracking-gothic"
                variants={itemVariants}
              >
                Our Story
              </motion.h2>
              <motion.div
                className="w-16 h-0.5 bg-primary mx-auto"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
            >
              <Card className="border-0 shadow-gothic bg-white">
                <CardContent className="p-8 md:p-12">
                  <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide">
                    {t('about.story')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* Our Expertise Section */}
        <section className="py-20 bg-gradient-subtle">
          <motion.div
            className="max-w-4xl mx-auto px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="text-center mb-12"
              variants={itemVariants}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-gothic font-bold text-foreground mb-6 tracking-gothic"
                variants={itemVariants}
              >
                Our Expertise
              </motion.h2>
              <motion.div
                className="w-16 h-0.5 bg-primary mx-auto"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
            >
              <Card className="border-0 shadow-gothic bg-white">
                <CardContent className="p-8 md:p-12">
                  <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide">
                    {t('about.expertise')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* Mission Statement Section */}
        <section className="py-20">
          <motion.div
            className="max-w-4xl mx-auto px-6 lg:px-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              className="text-center mb-12"
              variants={itemVariants}
            >
              <motion.h2
                className="text-3xl md:text-4xl font-gothic font-bold text-foreground mb-6 tracking-gothic"
                variants={itemVariants}
              >
                Mission Statement
              </motion.h2>
              <motion.div
                className="w-16 h-0.5 bg-primary mx-auto"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
            >
              <Card className="border-0 shadow-gothic bg-white">
                <CardContent className="p-8 md:p-12">
                  <blockquote className="text-xl md:text-2xl text-foreground font-light italic text-center leading-relaxed tracking-wide">
                    "{t('about.mission')}"
                  </blockquote>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-subtle">
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
                className="text-3xl md:text-4xl font-gothic font-bold text-foreground mb-6 tracking-gothic"
                variants={itemVariants}
              >
                Our Values
              </motion.h2>
              <motion.div
                className="w-16 h-0.5 bg-primary mx-auto"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.div>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
            >
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Card className="border-0 shadow-gothic bg-white text-center h-full">
                    <CardContent className="p-6">
                      <motion.div
                        className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-6"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <value.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-gothic font-semibold text-foreground mb-4 tracking-gothic">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed font-light">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
