import { useState } from 'react';
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="mb-8">
              <div className="w-16 h-0.5 bg-primary mx-auto mb-4"></div>
              <div className="w-8 h-0.5 bg-primary/60 mx-auto"></div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-gothic font-bold text-foreground mb-8 tracking-gothic">
              {t('contact.title')}
            </h1>
            
            <div className="w-24 h-0.5 bg-primary mx-auto mb-8"></div>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4 font-light">
              {t('contact.subtitle')}
            </p>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed font-light tracking-wide">
              {t('contact.description')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <Card className="shadow-gothic border-0 bg-white">
              <CardContent className="p-10">
                <div className="text-center mb-8">
                  <div className="w-12 h-0.5 bg-primary mx-auto mb-4"></div>
                  <div className="w-6 h-0.5 bg-primary/60 mx-auto"></div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-foreground font-medium tracking-wide">
                        {t('contact.form.name')}
                      </Label>
                      <Input 
                        id="name" 
                        name="name"
                        required 
                        className="mt-3 focus:ring-primary border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-foreground font-medium tracking-wide">
                        {t('contact.form.company')}
                      </Label>
                      <Input 
                        id="company" 
                        name="company"
                        className="mt-3 focus:ring-primary border-border"
                      />
                    </div>
                  </div>

                  <div>
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
                  </div>

                  <div>
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
                  </div>

                  <div className="text-center pt-4">
                    <div className="w-16 h-0.5 bg-primary/30 mx-auto mb-6"></div>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-gradient-primary hover:opacity-90 text-white font-medium py-6 px-12 text-base shadow-gothic tracking-wide"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Send className="mr-3 w-5 h-5" />
                          {t('contact.form.submit')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Email</h3>
                    <p className="text-muted-foreground">contact@tigregotico.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-warm rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Phone</h3>
                    <p className="text-muted-foreground">+351 xx xxx xxxx</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Office</h3>
                    <p className="text-muted-foreground">
                      sample addreess<br />
                      Portugal
                    </p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <Card className="bg-terracotta-light border-0">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-terracotta-dark mb-4">
                    Business Hours
                  </h3>
                  <div className="space-y-2 text-sm text-terracotta-dark">
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;