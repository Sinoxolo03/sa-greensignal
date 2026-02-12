import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'orange' | 'red';
  highlight?: boolean;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'blue',
  highlight = false,
  className 
}: StatCardProps) {
  const variantClasses = {
    blue: 'bg-stat-blue',
    green: 'bg-stat-green',
    orange: 'bg-stat-orange',
    red: 'bg-stat-red',
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-traffic-green',
    orange: 'text-traffic-orange',
    red: 'text-primary',
  };

  return (
    <div 
      className={cn(
        'rounded-xl border bg-card p-6 transition-all',
        highlight && 'border-primary border-2',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('rounded-lg p-3', variantClasses[variant])}>
          <Icon className={cn('h-6 w-6', iconColors[variant])} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
