import { Badge } from '@/components/ui/badge';
import { BookingStatus } from '@/lib/types';
import { useTranslation } from 'react-i18next';

const statusColors: Record<BookingStatus, string> = {
  REQUESTED: 'bg-warning text-warning-foreground',
  OFFERING: 'bg-primary text-primary-foreground',
  ACCEPTED: 'bg-accent text-accent-foreground',
  ENROUTE: 'bg-primary text-primary-foreground',
  AT_PICKUP: 'bg-secondary text-secondary-foreground',
  TO_HOSPITAL: 'bg-accent text-accent-foreground',
  COMPLETED: 'bg-accent text-accent-foreground',
  CANCELED: 'bg-danger text-danger-foreground',
};

export const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const { t } = useTranslation();

  return (
    <Badge className={`${statusColors[status]} border-0`}>
      {t(`tracking.status.${status}`)}
    </Badge>
  );
};
