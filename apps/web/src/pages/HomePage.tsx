import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/molecules/SearchBar';
import { InstitutionCard } from '../components/molecules/InstitutionCard';
import { Button, Badge } from '@admitly/ui';
import { mockInstitutions, mockPrograms } from '../lib/mockData';
import { GraduationCap, Search, BarChart3, Bell } from 'lucide-react';

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

  // Platform statistics
  const stats = [
    { label: 'Institutions', value: mockInstitutions.length.toString(), icon: GraduationCap },
    { label: 'Programs', value: mockPrograms.length.toString(), icon: Search },
    { label: 'Active Applications', value: '1,234', icon: BarChart3 },
    { label: 'Application Deadlines', value: '48', icon: Bell },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="mb-4">
              Nigeria's #1 Student Data Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Discover Your Perfect Educational Path
            </h1>
            <p className="text-xl text-muted-foreground">
              Search, compare, and plan your journey across 200+ Nigerian institutions. Find the
              right program that matches your goals and budget.
            </p>
            <div className="pt-6">
              <SearchBar
                placeholder="Search institutions, programs, or courses..."
                onSearch={handleSearch}
                initialValue={searchQuery}
                className="max-w-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center space-y-2">
                  <Icon className="h-8 w-8 mx-auto text-primary" />
                  <div className="text-3xl font-bold">{stat.value}+</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Institutions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Institutions</h2>
              <p className="text-muted-foreground mt-2">
                Top-rated institutions with verified data
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/institutions">View All</a>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredInstitutions.map((institution) => (
              <InstitutionCard key={institution.id} institution={institution} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Admitly?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make informed decisions about your education
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
              <p className="text-muted-foreground">
                Find programs instantly with our intelligent search engine. Filter by location,
                cost, duration, and more.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compare Programs</h3>
              <p className="text-muted-foreground">
                Side-by-side comparison of tuition, requirements, duration, and career prospects.
              </p>
            </div>
            <div className="bg-background p-6 rounded-lg border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deadline Alerts</h3>
              <p className="text-muted-foreground">
                Never miss an application deadline with real-time notifications and calendar sync.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of students planning their educational future with Admitly
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="/register">Sign Up Free</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/institutions">Browse Institutions</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

HomePage.displayName = 'HomePage';
