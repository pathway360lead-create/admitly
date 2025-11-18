import * as React from 'react';
import { Circle } from 'lucide-react';
import { cn } from '../lib/utils';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onValueChange?: (value: string) => void;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, onValueChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onValueChange && e.target.value) {
        onValueChange(e.target.value);
      }
      props.onChange?.(e);
    };

    return (
      <div className="relative inline-flex items-center">
        <input
          type="radio"
          ref={ref}
          value={value}
          className="peer sr-only"
          onChange={handleChange}
          {...props}
        />
        <div
          className={cn(
            'h-4 w-4 shrink-0 rounded-full border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'peer-checked:border-primary',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
            'flex items-center justify-center',
            className
          )}
        >
          <Circle
            className={cn(
              'h-2 w-2 fill-primary text-primary opacity-0 peer-checked:opacity-100',
              'transition-opacity'
            )}
          />
        </div>
      </div>
    );
  }
);
Radio.displayName = 'Radio';

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, children, value, onValueChange, name, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('grid gap-2', className)} role="radiogroup" {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Radio) {
            return React.cloneElement(child as React.ReactElement<RadioProps>, {
              name,
              checked: child.props.value === value,
              onValueChange,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
RadioGroup.displayName = 'RadioGroup';

export { Radio, RadioGroup };
