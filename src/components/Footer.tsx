import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useLanguage();

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const linkVariants = {
    hover: { x: 5, transition: { duration: 0.2 } },
  };

  return (
    <footer className="bg-primary text-white py-20">
      <motion.div
        className="max-w-6xl mx-auto px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div
          className="text-center mb-12"
          variants={itemVariants}
        >
          <motion.div
            className="w-16 h-0.5 bg-white/40 mx-auto mb-4"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          ></motion.div>
          <motion.div
            className="w-8 h-0.5 bg-white/20 mx-auto mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          ></motion.div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Company Info */}
          <motion.div
            className="text-center md:text-left"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center md:justify-start space-x-3 mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-white font-gothic font-bold text-lg tracking-gothic">TG</span>
              </motion.div>
              <span className="font-gothic font-semibold text-2xl tracking-gothic">TigreGótico</span>
            </motion.div>
            <motion.p
              className="text-white/70 leading-relaxed font-light tracking-wide"
              variants={itemVariants}
            >
              {t('footer.consulting')}
            </motion.p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="text-center"
            variants={itemVariants}
          >
            <motion.h3
              className="font-gothic font-semibold text-lg mb-6 tracking-gothic"
              variants={itemVariants}
            >
              Quick Links
            </motion.h3>
            <div className="space-y-3">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/services', label: t('nav.services') },
                { to: '/products', label: t('nav.products') },
                { to: '/about', label: t('nav.about') },
                { to: '/contact', label: t('nav.contact') },
              ].map((link, index) => (
                <motion.div
                  key={link.to}
                  variants={itemVariants}
                  custom={index}
                >
                  <motion.div
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    <Link
                      to={link.to}
                      className="block text-white/70 hover:text-white transition-colors font-light tracking-wide"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="text-center md:text-right"
            variants={itemVariants}
          >
            <motion.h3
              className="font-gothic font-semibold text-lg mb-6 tracking-gothic"
              variants={itemVariants}
            >
              Contact
            </motion.h3>
            <motion.div
              className="space-y-2 text-white/70 font-light tracking-wide"
              variants={itemVariants}
            >
              <p>Sample Address</p>
              <p>something something</p>
              <p>contact@tigregotico.com</p>
              <p>+351 xx xxx xxxx</p>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="text-center"
          variants={itemVariants}
        >
          <motion.div
            className="w-24 h-0.5 bg-white/20 mx-auto mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          ></motion.div>
          <motion.p
            className="text-white/50 font-light tracking-wide"
            variants={itemVariants}
          >
            {t('footer.rights')}
          </motion.p>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;