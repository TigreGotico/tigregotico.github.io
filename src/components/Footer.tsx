import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-white py-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-0.5 bg-white/40 mx-auto mb-4"></div>
          <div className="w-8 h-0.5 bg-white/20 mx-auto mb-8"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {/* Company Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-sm flex items-center justify-center">
                <span className="text-white font-gothic font-bold text-lg tracking-gothic">TG</span>
              </div>
              <span className="font-gothic font-semibold text-2xl tracking-gothic">TigreGótico</span>
            </div>
            <p className="text-white/70 leading-relaxed font-light tracking-wide">
              {t('footer.consulting')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h3 className="font-gothic font-semibold text-lg mb-6 tracking-gothic">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/" className="block text-white/70 hover:text-white transition-colors font-light tracking-wide">
                {t('nav.home')}
              </Link>
              <Link to="/#services" className="block text-white/70 hover:text-white transition-colors font-light tracking-wide">
                {t('nav.services')}
              </Link>
              <Link to="/contact" className="block text-white/70 hover:text-white transition-colors font-light tracking-wide">
                {t('nav.contact')}
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right">
            <h3 className="font-gothic font-semibold text-lg mb-6 tracking-gothic">Contact</h3>
            <div className="space-y-2 text-white/70 font-light tracking-wide">
              <p>Sample Address</p>
              <p>something something</p>
              <p>contact@tigregotico.com</p>
              <p>+351 xx xxx xxxx</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="w-24 h-0.5 bg-white/20 mx-auto mb-8"></div>
          <p className="text-white/50 font-light tracking-wide">
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;