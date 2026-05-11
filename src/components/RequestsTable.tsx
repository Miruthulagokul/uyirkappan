import { Booking } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { EtaPill } from '@/components/EtaPill';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RequestsTableProps {
  bookings: Booking[];
}

export const RequestsTable = ({ bookings }: RequestsTableProps) => {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead>Fare</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map(booking => (
            <TableRow key={booking.id}>
              <TableCell className="font-mono text-sm font-medium">{booking.code}</TableCell>
              <TableCell>
                <div className="text-sm font-medium">{booking.patientName}</div>
                <div className="text-xs text-muted-foreground">{booking.patientPhone}</div>
              </TableCell>
              <TableCell>
                <StatusBadge status={booking.status} />
              </TableCell>
              <TableCell>
                <Badge variant="outline">{booking.ambulanceType}</Badge>
              </TableCell>
              <TableCell className="max-w-[150px] truncate text-sm">{booking.hospital.name}</TableCell>
              <TableCell>
                {booking.status !== 'COMPLETED' && booking.status !== 'CANCELED' ? (
                  <EtaPill seconds={booking.eta} />
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="font-mono text-sm font-semibold">₹{booking.fare.toFixed(0)}</TableCell>
              <TableCell className="text-sm">
                {booking.ambulance?.driver?.name || '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" asChild>
                  <Link to={`/track/${booking.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {bookings.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                No bookings found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
