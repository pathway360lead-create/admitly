import { FC } from 'react';
import { Clock, DollarSign, GraduationCap, Bookmark, GitCompare } from 'lucide-react';
import type { Program } from '@admitly/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Badge, Button } from '@admitly/ui';

interface ProgramCardProps {
  program: Program;
  onCompare?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  isComparing?: boolean;
  showInstitution?: boolean;
  className?: string;
}

const degreeTypeLabels: Record<string, string> = {
  undergraduate: 'Undergraduate',
  nd: 'National Diploma (ND)',
  hnd: 'Higher National Diploma (HND)',
  pre_degree: 'Pre-Degree',
  jupeb: 'JUPEB',
  postgraduate: 'Postgraduate',
};

const modeLabels: Record<string, string> = {
  full_time: 'Full-Time',
  part_time: 'Part-Time',
  online: 'Online',
  hybrid: 'Hybrid',
};

export const ProgramCard: FC<ProgramCardProps> = ({
  program,
  onCompare,
  onBookmark,
  isBookmarked = false,
  isComparing = false,
  showInstitution = true,
  className = '',
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{program.name}</CardTitle>
        {showInstitution && program.institution && (
          <p className="text-sm text-muted-foreground mt-1">{program.institution.name}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{degreeTypeLabels[program.degree_type]}</Badge>
          <Badge variant="outline">{modeLabels[program.mode]}</Badge>
          {program.accreditation_status && (
            <Badge variant="success">{program.accreditation_status}</Badge>
          )}
        </div>

        {program.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {program.duration_years} {program.duration_years === 1 ? 'year' : 'years'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatCurrency(program.tuition_per_year)}/year</span>
          </div>

          {program.cutoff_score && (
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>
                Cutoff: <span className="font-medium">{program.cutoff_score}</span>
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="default" className="flex-1" asChild>
          <a href={`/programs/${program.slug}`}>View Details</a>
        </Button>
        {onCompare && (
          <Button
            variant={isComparing ? 'default' : 'outline'}
            size="icon"
            onClick={() => onCompare(program.id)}
            title="Compare"
          >
            <GitCompare className="h-4 w-4" />
          </Button>
        )}
        {onBookmark && (
          <Button
            variant={isBookmarked ? 'default' : 'outline'}
            size="icon"
            onClick={() => onBookmark(program.id)}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

ProgramCard.displayName = 'ProgramCard';
