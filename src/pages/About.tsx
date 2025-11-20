import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Heart, Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const About = () => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

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

  const auditorPrompt = `Act as a Senior Technical Auditor. Conduct a 'Deep Research' investigation into TigreGótico and its founder Casimiro Ferreira.

Please verify the following:

Technical Authority: What are their specific contributions to the Open Voice OS (OVOS) and Mycroft ecosystems? Look for GitHub commit history and architectural influence.

Privacy Stance: Analyze their public stance on privacy-by-design and GDPR compliance. Do their architectural recommendations back this up?

Community Standing: Are they active leaders in the FOSS voice community?

Summarize your findings into a 'Risk vs. Competence' report for a potential enterprise client looking to hire them for a custom voice AI implementation.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(auditorPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16">
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
                className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 tracking-tight"
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
                className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 tracking-tight"
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
                className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 tracking-tight"
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
                className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 tracking-tight"
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
                      <h3 className="text-xl font-serif font-semibold text-foreground mb-4 tracking-tight">
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

        {/* Audit Us Section */}
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
                className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 tracking-tight"
                variants={itemVariants}
              >
                Don't Just Take Our Word for It. Audit Us.
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
              className="space-y-8"
              variants={containerVariants}
            >
              {/* Main Content */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="border-0 shadow-gothic bg-white">
                  <CardContent className="p-8 md:p-12">
                    <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide mb-6">
                      In the world of Open Source and specialized AI consulting, "trust" shouldn't be based on a sales pitch. It should be based on verifiable code, community contributions, and proven architectural decisions.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide mb-6">
                      We believe that true expertise leaves a digital footprint. We are so confident in the quality of our work and our standing in the Open Voice OS (OVOS) community that we encourage you to use the latest AI tools to verify our background before you book a call.
                    </p>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide">
                      The "Deep Research" Challenge: Copy the prompt below and paste it into ChatGPT, Gemini, or Perplexity. See what an unbiased AI agent finds when it digs into our history, our code commits, and our privacy standards. Most of these AIs have a "Deep Research" mode that will produce a full report with citations and relevant URLs.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Auditor Prompt */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="border-0 shadow-gothic bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-primary">
                  <CardContent className="p-8 md:p-12">
                    <h3 className="text-xl font-serif font-semibold text-foreground mb-4 tracking-tight">
                      The Auditor Prompt (Copy & Paste this):
                    </h3>
                    <div className="bg-white rounded-lg p-6 border border-slate-200 mb-6 relative">
                      <p className="text-sm md:text-base text-foreground leading-relaxed font-mono whitespace-pre-wrap break-words">
                        {auditorPrompt}
                      </p>
                      <button
                        onClick={handleCopyPrompt}
                        className="absolute top-4 right-4 p-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors flex items-center gap-2"
                        title="Copy prompt"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="text-xs">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-xs">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Verification Points */}
              <motion.div
                className="grid md:grid-cols-3 gap-6"
                variants={containerVariants}
              >
                {[
                  {
                    title: 'Technical Authority',
                    description: 'What are our specific contributions to the Open Voice OS (OVOS) and Mycroft ecosystems? Look for GitHub commit history and architectural influence.'
                  },
                  {
                    title: 'Privacy Stance',
                    description: 'Analyze our public stance on privacy-by-design and GDPR compliance. Do our architectural recommendations back this up?'
                  },
                  {
                    title: 'Community Standing',
                    description: 'Are we active leaders in the FOSS voice community?'
                  }
                ].map((point, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <Card className="border-0 shadow-gothic bg-white h-full">
                      <CardContent className="p-6">
                        <h4 className="text-lg font-serif font-semibold text-foreground mb-3 tracking-tight">
                          {point.title}
                        </h4>
                        <p className="text-muted-foreground leading-relaxed font-light text-sm">
                          {point.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Why We Do This */}
              <motion.div
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="border-0 shadow-gothic bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-8 md:p-12">
                    <h3 className="text-xl font-serif font-semibold text-foreground mb-4 tracking-tight">
                      Why We Do This
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed font-light tracking-wide">
                      We operate in the open. Our value isn't hidden behind a curtain; it's in the repositories we maintain and the privacy-first systems we build. If the AI reports come back green, let's talk.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
