import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrafficLight } from '@/components/TrafficLight';
import { TrafficLightState } from '@/hooks/useTrafficLight';

interface HeaderProps {
  state: TrafficLightState;
  onRefresh?: () => void;
}

export function Header({ state, onRefresh }: HeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            SA-GreenSignal
          </h1>
          
          <TrafficLight 
            state={state} 
            size="md" 
            onClick={onRefresh}
          />
          
          <Link to="/admin">
            <Button variant="outline" size="sm">
              Admin Portal
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
