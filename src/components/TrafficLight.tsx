import { cn } from '@/lib/utils';
import { TrafficLightState } from '@/hooks/useTrafficLight';

interface TrafficLightProps {
  state: TrafficLightState;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function TrafficLight({ state, size = 'md', onClick, className }: TrafficLightProps) {
  const sizeClasses = {
    sm: 'w-12 gap-1.5 p-2',
    md: 'w-20 gap-2 p-3',
    lg: 'w-28 gap-3 p-4',
  };

  const lightSizes = {
    sm: 'w-7 h-7',
    md: 'w-12 h-12',
    lg: 'w-18 h-18',
  };

  return (
    <div
      className={cn(
        'traffic-light-container flex flex-col items-center cursor-pointer transition-transform hover:scale-105',
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {/* Red Light */}
      <div
        className={cn(
          'rounded-full transition-all duration-300',
          lightSizes[size],
          state === 'red' 
            ? 'bg-traffic-red shadow-lg shadow-traffic-red/50' 
            : 'bg-traffic-red-faded'
        )}
      />
      
      {/* Orange Light */}
      <div
        className={cn(
          'rounded-full transition-all duration-300',
          lightSizes[size],
          state === 'orange' 
            ? 'bg-traffic-orange shadow-lg shadow-traffic-orange/50' 
            : 'bg-traffic-orange-faded'
        )}
      />
      
      {/* Green Light */}
      <div
        className={cn(
          'rounded-full transition-all duration-300',
          lightSizes[size],
          state === 'green' 
            ? 'bg-traffic-green shadow-lg shadow-traffic-green/50' 
            : 'bg-traffic-green-faded'
        )}
      />
    </div>
  );
}
