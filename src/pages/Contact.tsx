import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });

    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

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

  const contactCardVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
    hover: {
      x: 5,
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />

      <main className="pt-24 pb-16">
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="text-center mb-20"
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
              {t('contact.title')}
            </motion.h1>

            <motion.div
              className="w-24 h-0.5 bg-primary mx-auto mb-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            ></motion.div>

            <motion.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-light"
              variants={itemVariants}
            >
              {t('contact.description')}
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <motion.div
              variants={itemVariants}
            >
              <Card className="shadow-gothic border-0 bg-white">
                <CardContent className="p-10">
                  <motion.div
                    className="text-center mb-8"
                    variants={itemVariants}
                  >
                    <motion.div
                      className="w-12 h-0.5 bg-primary mx-auto mb-4"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      viewport={{ once: true }}
                    ></motion.div>
                    <motion.div
                      className="w-6 h-0.5 bg-primary/60 mx-auto"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      viewport={{ once: true }}
                    ></motion.div>
                  </motion.div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <motion.div
                      className="grid grid-cols-2 gap-6"
                      variants={itemVariants}
                    >
                      <motion.div variants={itemVariants}>
                        <Label htmlFor="name" className="text-foreground font-medium tracking-wide">
                          {t('contact.form.name')}
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          required
                          className="mt-3 focus:ring-primary border-border"
                        />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Label htmlFor="company" className="text-foreground font-medium tracking-wide">
                          {t('contact.form.company')}
                        </Label>
                        <Input
                          id="company"
                          name="company"
                          className="mt-3 focus:ring-primary border-border"
                        />
                      </motion.div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Label htmlFor="email" className="text-foreground font-medium tracking-wide">
                        {t('contact.form.email')}
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="mt-3 focus:ring-primary border-border"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Label htmlFor="message" className="text-foreground font-medium tracking-wide">
                        {t('contact.form.message')}
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        className="mt-3 focus:ring-primary resize-none border-border"
                      />
                    </motion.div>

                    <motion.div
                      className="text-center pt-4"
                      variants={itemVariants}
                    >
                      <motion.div
                        className="w-16 h-0.5 bg-primary/30 mx-auto mb-6"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        viewport={{ once: true }}
                      ></motion.div>
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-gradient-primary hover:opacity-90 text-white font-medium py-6 px-12 text-base shadow-gothic tracking-wide"
                        >
                          {isSubmitting ? (
                            <motion.div
                              className="flex items-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.div
                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              ></motion.div>
                              Sending...
                            </motion.div>
                          ) : (
                            <>
                              <Send className="mr-3 w-5 h-5" />
                              {t('contact.form.submit')}
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              variants={containerVariants}
            >
              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: 'Email',
                    content: 'contact@tigregotico.com',
                    bgColor: 'bg-gradient-primary',
                  },
                  {
                    icon: Phone,
                    title: 'Phone',
                    content: '+351 xx xxx xxxx',
                    bgColor: 'bg-gradient-warm',
                  },
                  {
                    icon: MapPin,
                    title: 'Office',
                    content: 'sample addreess\nPortugal',
                    bgColor: 'bg-gradient-primary',
                  },
                ].map((contact, index) => (
                  <motion.div
                    key={index}
                    variants={contactCardVariants}
                    whileHover="hover"
                    custom={index}
                  >
                    <div className="flex items-start space-x-4">
                      <motion.div
                        className={`w-12 h-12 ${contact.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <contact.icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{contact.title}</h3>
                        <p className="text-muted-foreground whitespace-pre-line">{contact.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Hours */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="bg-terracotta-light border-0">
                  <CardContent className="p-6">
                    <motion.h3
                      className="text-lg font-semibold text-terracotta-dark mb-4"
                      variants={itemVariants}
                    >
                      Business Hours
                    </motion.h3>
                    <motion.div
                      className="space-y-2 text-sm text-terracotta-dark"
                      variants={itemVariants}
                    >
                      <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span>9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span>10:00 AM - 2:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span>Closed</span>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Contact;