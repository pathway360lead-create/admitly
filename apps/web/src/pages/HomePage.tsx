import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection, NewsFeed, StatsSection } from '../components/organisms';
import { InstitutionCard } from '../components/molecules/InstitutionCard';
import { Button } from '@admitly/ui';
import { mockInstitutions } from '../lib/mockData';
import { Search, BarChart3, Bell } from 'lucide-react';

export const HomePage: FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Featured institutions (top 4)
  const featuredInstitutions = mockInstitutions.slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* 1. Hero Section (New) */}
      <HeroSection onSearch={handleSearch} initialSearchValue={searchQuery} />

      {/* 2. The Feed (New) */}
      <NewsFeed />

      {/* 3. Stats (New - Interactive) */}
      <StatsSection />

      {/* 4. Featured Institutions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold font-heading">Featured Institutions</h2>
              <p className="text-muted-foreground mt-2 text-lg">
                Top-rated institutions with verified admission data
              </p>
            </div>
            <Button variant="outline" asChild className="group">
              <a href="/institutions">View All Institutions</a>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredInstitutions.map((institution) => (
              <InstitutionCard key={institution.id} institution={institution} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Features Section (Restyled) */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Why Students Trust Admitly</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We simplify the complex admission process with data-driven tools.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Smart Search', desc: 'Find programs matching your JAMB score and budget instantly.' },
              { icon: BarChart3, title: 'Compare Programs', desc: 'Side-by-side comparison of tuition, acceptance rates, and requirements.' },
              { icon: Bell, title: 'Deadline Alerts', desc: 'Never miss an admission form or scholarship deadline again.' }
            ].map((feature, i) => (
              <div key={i} className="bg-background p-8 rounded-2xl border border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-heading">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-bottom-right z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 text-center shadow-2xl overflow-hidden relative">
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-heading">Ready to Secure Your Admission?</h2>
              <p className="text-lg md:text-xl mb-10 opacity-90 font-light">
                Join over 20,000 students who found their perfect school using Admitly this year.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild className="h-12 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  <a href="/register">Create Free Account</a>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground" asChild>
                  <a href="/institutions">Browse Schools</a>
                </Button>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>
        </div>
      </section>
    </div>
  );
};

HomePage.displayName = 'HomePage';
