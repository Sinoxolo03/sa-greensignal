import { Header } from '@/components/Header';
import { RedPhaseContent } from '@/components/RedPhaseContent';
import { OrangePhaseContent } from '@/components/OrangePhaseContent';
import { GreenPhaseContent } from '@/components/GreenPhaseContent';
import { useTrafficLight } from '@/hooks/useTrafficLight';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const { state, loading, refetch } = useTrafficLight();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header state={state} onRefresh={refetch} />
      <Separator />
      
      <main className="pb-12">
        {state === 'red' && <RedPhaseContent />}
        {state === 'orange' && <OrangePhaseContent />}
        {state === 'green' && <GreenPhaseContent />}
      </main>
    </div>
  );
};

export default Index;
