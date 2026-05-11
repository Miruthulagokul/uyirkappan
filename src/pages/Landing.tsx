import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Activity, MapPin, Building2, Shield, Clock, Heart,
  Truck, Phone, ChevronRight, Zap, Users, Star,
} from 'lucide-react';
import { TopNav } from '@/components/TopNav';

const Landing = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Activity, title: t('landing.multiOffer'), description: t('landing.multiOfferDesc') },
    { icon: MapPin, title: t('landing.liveTracking'), description: t('landing.liveTrackingDesc') },
    { icon: Building2, title: t('landing.hospitalAware'), description: t('landing.hospitalAwareDesc') },
    { icon: Shield, title: t('landing.backupSystem'), description: t('landing.backupSystemDesc') },
    { icon: Clock, title: t('landing.etaPrediction'), description: t('landing.etaPredictionDesc') },
    { icon: Heart, title: t('landing.hospitalCoordination'), description: t('landing.hospitalCoordinationDesc') },
  ];

  const steps = [
    { number: '01', icon: Phone, title: t('landing.step1Title'), description: t('landing.step1Desc') },
    { number: '02', icon: Zap, title: t('landing.step2Title'), description: t('landing.step2Desc') },
    { number: '03', icon: MapPin, title: t('landing.step3Title'), description: t('landing.step3Desc') },
    { number: '04', icon: Building2, title: t('landing.step4Title'), description: t('landing.step4Desc') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main>
        {/* ─── Hero Section ──────────────────────────────── */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
              </span>
              24/7 Emergency Service
            </div>

            <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              {t('landing.hero')}
            </h1>
            <p className="mb-3 text-xl font-medium text-primary md:text-2xl">
              {t('landing.tagline')}
            </p>
            <p className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground md:text-lg">
              {t('landing.description')}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-xl bg-destructive px-8 py-6 text-lg hover:bg-destructive/90">
                <Link to="/emergency">
                  {t('landing.emergencySOS')}
                </Link>
              </Button>
              <Button asChild size="lg" className="rounded-xl px-8 py-6 text-lg">
                <Link to="/book">{t('landing.bookAmbulance')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-8 py-6 text-lg">
                <Link to="/auth">{t('landing.operatorLogin')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Stats Section ─────────────────────────────── */}
        <section className="border-y border-border bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-1 text-4xl font-bold text-primary font-mono">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-4xl font-bold text-primary font-mono">&lt;8 min</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-4xl font-bold text-primary font-mono">94%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-4xl font-bold text-primary font-mono">1,200+</div>
                <div className="text-sm text-muted-foreground">Lives Saved</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── How It Works ──────────────────────────────── */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="mb-12 text-center text-3xl font-bold">{t('landing.howItWorks')}</h2>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="mb-1 font-mono text-sm text-primary">{step.number}</div>
                <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ChevronRight className="absolute right-0 top-8 hidden h-6 w-6 text-muted-foreground/30 md:block -translate-x-4" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Features Grid ─────────────────────────────── */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Why Uyirkappan?</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── For Drivers & Hospitals ────────────────────── */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Drivers CTA */}
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{t('landing.forDrivers')}</h3>
                <p className="mb-6 text-muted-foreground">{t('landing.forDriversDesc')}</p>
                <Button asChild variant="outline">
                  <Link to="/partner">
                    {t('landing.joinAsDriver')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Hospitals CTA */}
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
                  <Building2 className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{t('landing.forHospitals')}</h3>
                <p className="mb-6 text-muted-foreground">{t('landing.forHospitalsDesc')}</p>
                <Button asChild variant="outline">
                  <Link to="/dashboard">
                    {t('landing.hospitalDashboard')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─── Testimonials ──────────────────────────────── */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">What People Say</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { name: 'Dr. Priya Menon', role: 'Apollo Hospital', text: 'Uyirkappan has transformed how we receive emergency patients. We are prepared before they arrive.' },
                { name: 'Rajesh K.', role: 'Ambulance Driver', text: 'The app gives me clear routes and fair earnings. I can serve more patients efficiently.' },
                { name: 'Lakshmi S.', role: 'Patient Family', text: 'When my father had a heart attack, the ambulance arrived in 6 minutes. Uyirkappan saved his life.' },
              ].map((testimonial, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="mb-3 flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">"{testimonial.text}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA Section ───────────────────────────────── */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Every millisecond can save a life.</h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Download the app or use the web platform to request emergency ambulance service instantly.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="rounded-xl px-8 py-6 text-lg">
                <Link to="/emergency">{t('landing.emergencySOS')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl border-primary-foreground/30 px-8 py-6 text-lg text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/book">{t('landing.bookAmbulance')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">உ</span>
                </div>
                <span className="text-lg font-bold">Uyirkappan</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time intelligent ambulance dispatch & emergency response platform.
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/emergency" className="hover:text-foreground">Emergency SOS</Link></li>
                <li><Link to="/book" className="hover:text-foreground">Book Ambulance</Link></li>
                <li><Link to="/partner" className="hover:text-foreground">Driver Portal</Link></li>
                <li><Link to="/dashboard" className="hover:text-foreground">Hospital Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Ambulance Types</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Basic Life Support (BLS)</li>
                <li>Advanced Life Support (ALS)</li>
                <li>Neonatal (NEO)</li>
                <li>ICU Ambulance</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Emergency: 108</li>
                <li>support@uyirkappan.in</li>
                <li>Chennai, Tamil Nadu</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Uyirkappan. Emergency services platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
