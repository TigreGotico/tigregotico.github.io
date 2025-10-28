import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone, ExternalLink, Rss } from 'lucide-react';
import { FaGithub, FaHeart } from 'react-icons/fa';
import { SiHuggingface } from 'react-icons/si';
import { HiSpeakerWave } from 'react-icons/hi2';

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

  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-border/50">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 lg:mb-16">
          {/* Company Section */}
          <motion.div
            className="space-y-4 lg:space-y-6 col-span-1 sm:col-span-2 lg:col-span-1 text-center sm:text-left"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center sm:justify-start space-x-3 mb-4 lg:mb-6"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 border border-primary/10">
                <span className="text-primary-foreground font-serif font-bold text-base lg:text-lg">TG</span>
              </div>
              <div>
                <span className="font-serif font-semibold text-lg lg:text-xl text-foreground block">TigreGótico</span>
                <span className="text-muted-foreground text-xs font-medium tracking-wide">FOSS Voice Technology</span>
              </div>
            </motion.div>
            <p className="text-muted-foreground leading-relaxed text-sm max-w-md mx-auto sm:mx-0">
              {t('footer.consulting')}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="space-y-4 lg:space-y-6"
            variants={itemVariants}
          >
            <h3 className="font-serif font-semibold text-base lg:text-lg text-foreground">
              {t('footer.quicklinks')}
            </h3>
            <div className="space-y-2 lg:space-y-3">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/services', label: t('nav.services') },
                { to: '/resources', label: t('nav.resources') },
                { to: '/about', label: t('nav.about') },
                { to: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <motion.div
                  key={link.to}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={link.to}
                    className="block text-muted-foreground hover:text-foreground transition-colors text-sm py-1"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors text-sm py-1 rounded-lg hover:bg-muted/20 px-2 -mx-2"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Rss className="w-4 h-4" />
                <span>Blog RSS Feed</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Open Source */}
          <motion.div
            className="space-y-4 lg:space-y-6"
            variants={itemVariants}
          >
            <h3 className="font-serif font-semibold text-base lg:text-lg text-foreground">
              {t('footer.opensource')}
            </h3>
            <div className="space-y-3 lg:space-y-4">
              <motion.a
                href="https://github.com/TigreGotico"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-3 p-2 lg:p-3 rounded-lg hover:bg-muted/30 transition-colors group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <FaGithub className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-foreground text-sm font-medium block truncate mb-1">GitHub</span>
                  <span className="text-muted-foreground text-xs truncate block leading-snug">Open Source Projects</span>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
              </motion.a>
              
              <motion.a
                href="https://huggingface.co/TigreGotico"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-3 p-2 lg:p-3 rounded-lg hover:bg-muted/30 transition-colors group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <SiHuggingface className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-foreground text-sm font-medium block truncate mb-1">Hugging Face</span>
                  <span className="text-muted-foreground text-xs truncate block leading-snug">AI Models & Datasets</span>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
              </motion.a>

              <motion.a
                href="https://openvoiceos.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-3 p-2 lg:p-3 rounded-lg hover:bg-muted/30 transition-colors group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <HiSpeakerWave className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-foreground text-sm font-medium block truncate mb-1">OpenVoiceOS</span>
                  <span className="text-muted-foreground text-xs truncate block leading-snug">Voice Assistant Platform</span>
                </div>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
              </motion.a>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            className="space-y-4 lg:space-y-6"
            variants={itemVariants}
          >
            <h3 className="font-serif font-semibold text-base lg:text-lg text-foreground">
              {t('footer.contact')}
            </h3>
            <div className="space-y-4 lg:space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="text-muted-foreground text-sm leading-relaxed min-w-0 flex-1">
                  <p className="font-medium text-foreground mb-1">Address</p>
                  <p className="break-words leading-snug">Praceta António Sérgio, nº317 4ºEsquerdo</p>
                  <p className="leading-snug">4450-048 Matosinhos, Portugal</p>
                </div>
              </div>
              
              <motion.a
                href="mailto:contact@tigregotico.com"
                className="flex items-start space-x-3 rounded-lg hover:bg-muted/30 transition-colors group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-foreground text-sm font-medium block mb-1">Email</span>
                  <span className="text-muted-foreground text-xs break-all leading-snug">contact@tigregotico.com</span>
                </div>
              </motion.a>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-foreground text-sm font-medium block mb-1">Phone</span>
                  <span className="text-muted-foreground text-xs leading-snug">+351 xx xxx xxxx</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="pt-6 lg:pt-8 border-t border-border/30"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left">
            <motion.div
              className="flex items-center justify-center space-x-2 text-muted-foreground text-xs sm:text-sm"
              variants={itemVariants}
            >
              <span>{t('footer.madewith')}</span>
              <FaHeart className="w-3 h-3 text-red-500 flex-shrink-0" />
              <span>{t('footer.foss')}</span>
            </motion.div>
            
            <motion.p
              className="text-muted-foreground text-xs sm:text-sm"
              variants={itemVariants}
            >
              {t('footer.rights')}
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;