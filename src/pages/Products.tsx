import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, ShoppingCart, Star, Code, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Products = () => {
  const { t } = useLanguage();

  const plugins = [
    {
      name: 'Advanced TTS Plugin',
      description: 'Enhanced text-to-speech with multiple voice options and offline support.',
      price: '€9.99',
      icon: Star,
    },
    {
      name: 'Smart Home Integration',
      description: 'Seamlessly connect OVOS with popular smart home platforms.',
      price: '€14.99',
      icon: Code,
    },
    {
      name: 'Privacy Guardian',
      description: 'Advanced privacy controls and data protection features.',
      price: '€7.99',
      icon: Heart,
    },
  ];

  const merchandise = [
    {
      name: 'OVOS Sticker Pack',
      description: 'Show your support with high-quality vinyl stickers.',
      price: '€5.99',
      icon: Heart,
    },
    {
      name: 'OpenVoiceOS T-Shirt',
      description: 'Comfortable cotton tee with the OVOS logo.',
      price: '€19.99',
      icon: ShoppingCart,
    },
    {
      name: 'Developer Mug',
      description: 'Keep your coffee hot while coding for open source.',
      price: '€12.99',
      icon: Code,
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
        {/* OVOS Plugins Section */}
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
                ></motion.div>
                <motion.div
                  className="w-8 h-0.5 bg-primary/60 mx-auto"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                ></motion.div>
              </motion.div>

              <motion.h1
                className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-8 tracking-tight"
                variants={itemVariants}
              >
                {t('nav.products')}
              </motion.h1>

              <motion.div
                className="w-24 h-0.5 bg-primary mx-auto mb-8"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              ></motion.div>
            </motion.div>

            <motion.div
              className="text-center mb-16"
              variants={itemVariants}
            >
              <motion.h2
                className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 tracking-tight"
                variants={itemVariants}
              >
                {t('products.plugins.headline')}
              </motion.h2>
              <motion.p
                className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light"
                variants={itemVariants}
              >
                {t('products.plugins.intro')}
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 mb-16"
              variants={containerVariants}
            >
              {plugins.map((plugin, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Card className="border-0 shadow-gothic bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 h-full">
                    <CardHeader>
                      <motion.div
                        className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <plugin.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl font-serif font-semibold text-foreground tracking-tight mb-2">
                        {plugin.name}
                      </CardTitle>
                      <div className="text-2xl font-bold text-primary mb-4">
                        {plugin.price}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed font-light mb-6">
                        {plugin.description}
                      </p>
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button className="w-full bg-gradient-primary hover:opacity-90 text-white">
                          <Download className="mr-2 w-4 h-4" />
                          Download Plugin
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* OVOS Merchandise Section */}
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
                className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6 tracking-tight"
                variants={itemVariants}
              >
                {t('products.merch.headline')}
              </motion.h2>
              <motion.p
                className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light"
                variants={itemVariants}
              >
                {t('products.merch.intro')}
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
            >
              {merchandise.map((item, index) => (
                <motion.div
                  key={index}
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Card className="border-0 shadow-gothic bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 h-full">
                    <CardHeader>
                      <motion.div
                        className="w-12 h-12 bg-gradient-warm rounded-xl flex items-center justify-center mb-4"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <item.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <CardTitle className="text-xl font-serif font-semibold text-foreground tracking-tight mb-2">
                        {item.name}
                      </CardTitle>
                      <div className="text-2xl font-bold text-terracotta-dark mb-4">
                        {item.price}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed font-light mb-6">
                        {item.description}
                      </p>
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button variant="outline" className="w-full border-terracotta-dark text-terracotta-dark hover:bg-terracotta-dark hover:text-white">
                          <ShoppingCart className="mr-2 w-4 h-4" />
                          Add to Cart
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              variants={itemVariants}
            >
              <motion.p
                className="text-muted-foreground font-light mb-6"
                variants={itemVariants}
              >
                All merchandise purchases directly support OpenVoiceOS development
              </motion.p>
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Link to="/contact">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg font-medium tracking-wide shadow-gothic">
                    Contact for Bulk Orders
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

export default Products;
