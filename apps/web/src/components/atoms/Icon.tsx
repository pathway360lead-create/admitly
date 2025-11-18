import { FC } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  'aria-label'?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
};

export const Icon: FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  className,
  'aria-label': ariaLabel
}) => {
  return (
    <IconComponent
      className={cn(sizeMap[size], className)}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
};

Icon.displayName = 'Icon';
