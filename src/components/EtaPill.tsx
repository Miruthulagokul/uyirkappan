import { Clock } from 'lucide-react';
import { formatETA } from '@/lib/routing';

export const EtaPill = ({ seconds }: { seconds: number }) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-mono font-semibold text-primary">
      <Clock className="h-4 w-4" />
      <span>{formatETA(seconds)}</span>
    </div>
  );
};
