import { Settings } from 'lucide-react';
import { TrafficLight } from '@/components/TrafficLight';
import { TrafficLightState } from '@/hooks/useTrafficLight';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TrafficLightControlProps {
  state: TrafficLightState;
  onStateChange: (state: TrafficLightState) => void;
}

const stateLabels: Record<TrafficLightState, string> = {
  red: 'RED - History',
  orange: 'ORANGE - Marketing',
  green: 'GREEN - Jobs',
};

export function TrafficLightControl({ state, onStateChange }: TrafficLightControlProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold">Traffic Light Control</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-[150px]">
              Change the system state visible to all users
            </p>
          </div>

          <TrafficLight state={state} size="md" />

          <div className="flex-1">
            <Select value={state} onValueChange={(v) => onStateChange(v as TrafficLightState)}>
              <SelectTrigger className="w-full border-primary">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${
                      state === 'red' ? 'bg-traffic-red' : 
                      state === 'orange' ? 'bg-traffic-orange' : 
                      'bg-traffic-green'
                    }`} />
                    <span>{stateLabels[state]}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-traffic-red" />
                    <span>RED - History</span>
                  </div>
                </SelectItem>
                <SelectItem value="orange">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-traffic-orange" />
                    <span>ORANGE - Marketing</span>
                  </div>
                </SelectItem>
                <SelectItem value="green">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-traffic-green" />
                    <span>GREEN - Jobs</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}