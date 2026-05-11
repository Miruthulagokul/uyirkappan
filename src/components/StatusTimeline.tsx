import { BookingStatus } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: BookingStatus;
}

const statusOrder: BookingStatus[] = [
  'REQUESTED',
  'OFFERING',
  'ACCEPTED',
  'ENROUTE',
  'AT_PICKUP',
  'TO_HOSPITAL',
  'COMPLETED',
];

export const StatusTimeline = ({ currentStatus }: StatusTimelineProps) => {
  const { t } = useTranslation();

  if (currentStatus === 'CANCELED') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
        <Circle className="h-5 w-5" />
        <span className="font-medium">{t('tracking.status.CANCELED')}</span>
      </div>
    );
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {statusOrder.map((status, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        const isLast = index === statusOrder.length - 1;

        return (
          <div key={status} className="flex gap-3">
            {/* Timeline Line + Dot */}
            <div className="flex flex-col items-center">
              {isPast ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              ) : isCurrent ? (
                <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                  <div className="absolute h-6 w-6 animate-ping rounded-full bg-primary opacity-20" />
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <Circle className="h-6 w-6 shrink-0 text-muted-foreground/30" />
              )}
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[24px] ${isPast ? 'bg-green-500' : isCurrent ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
              )}
            </div>

            {/* Label */}
            <div className={`pb-4 ${isFuture ? 'opacity-40' : ''}`}>
              <div className={`text-sm font-medium ${isCurrent ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                {t(`tracking.status.${status}`)}
              </div>
              {isCurrent && (
                <div className="text-xs text-muted-foreground mt-0.5">Current status</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
