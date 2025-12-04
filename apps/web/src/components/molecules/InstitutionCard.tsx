import { FC } from 'react';
import { MapPin, Globe, CheckCircle2, Bookmark, GitCompare } from 'lucide-react';
import type { Institution } from '@admitly/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Badge, Button } from '@admitly/ui';

interface InstitutionCardProps {
  institution: Institution;
  onCompare?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  isComparing?: boolean;
  className?: string;
}

const institutionTypeLabels: Record<string, string> = {
  federal_university: 'Federal University',
  state_university: 'State University',
  private_university: 'Private University',
  polytechnic: 'Polytechnic',
  college_of_education: 'College of Education',
  specialized: 'Specialized Institution',
  jupeb_center: 'JUPEB Center',
};

export const InstitutionCard: FC<InstitutionCardProps> = ({
  institution,
  onCompare,
  onBookmark,
  isBookmarked = false,
  isComparing = false,
  className = '',
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {institution.logo_url ? (
              <img
                src={institution.logo_url}
                alt={`${institution.name} logo`}
                className="w-12 h-12 object-contain mb-2"
                onError={handleImageError}
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mb-2">
                <span className="text-xl font-bold text-primary">
                  {institution.name.charAt(0)}
                </span>
              </div>
            )}
            <CardTitle className="text-lg line-clamp-2">{institution.name}</CardTitle>
            {institution.short_name && (
              <p className="text-sm text-muted-foreground mt-1">{institution.short_name}</p>
            )}
          </div>
          {institution.verified && (
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{institutionTypeLabels[institution.type]}</Badge>
          {institution.verified && <Badge variant="success">Verified</Badge>}
        </div>

        {institution.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{institution.description}</p>
        )}

        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {institution.city}, {institution.state}
            </span>
          </div>
          {institution.website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <a
                href={institution.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline truncate"
              >
                {institution.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm font-medium">
            {institution.program_count} {institution.program_count === 1 ? 'Program' : 'Programs'}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="default" className="flex-1" asChild>
          <a href={`/institutions/${institution.slug}`}>View Details</a>
        </Button>
        {onCompare && (
          <Button
            variant={isComparing ? 'default' : 'outline'}
            size="icon"
            onClick={() => onCompare(institution.id)}
            title="Compare"
          >
            <GitCompare className="h-4 w-4" />
          </Button>
        )}
        {onBookmark && (
          <Button
            variant={isBookmarked ? 'default' : 'outline'}
            size="icon"
            onClick={() => onBookmark(institution.id)}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

InstitutionCard.displayName = 'InstitutionCard';
