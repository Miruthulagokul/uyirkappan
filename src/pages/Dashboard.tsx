import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/DashboardLayout';
import { KPICard } from '@/components/KPICard';
import { LiveFleetMap } from '@/components/LiveFleetMap';
import { RequestsTable } from '@/components/RequestsTable';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import {
  DashboardMetrics, Booking, Ambulance, Driver, Hospital, AnalyticsData,
} from '@/lib/types';
import {
  Activity, Clock, CheckCircle, IndianRupee, Truck, Users,
  Building2, TrendingUp, Star, Phone, Shield,
} from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [m, b, a, d, h, an] = await Promise.all([
          api.getDashboardMetrics(),
          api.getRecentBookings(),
          api.getAllAmbulances(),
          api.getAllDrivers(),
          api.getAllHospitals(),
          api.getAnalytics(),
        ]);
        setMetrics(m);
        setBookings(b);
        setAmbulances(a);
        setDrivers(d);
        setHospitals(h);
        setAnalytics(an);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  if (loading) {
    return (
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* ─── Overview ──────────────────────────────────── */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('dashboard.overview')}</h2>

          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title={t('dashboard.activeTrips')}
              value={metrics.activeTrips}
              icon={Activity}
              trend={{ value: 12, label: 'vs yesterday' }}
            />
            <KPICard
              title={t('dashboard.avgEta')}
              value={`${metrics.avgEta}`}
              suffix="min"
              icon={Clock}
              trend={{ value: -5, label: 'improvement' }}
            />
            <KPICard
              title={t('dashboard.completionRate')}
              value={`${metrics.completionRate}%`}
              icon={CheckCircle}
              trend={{ value: 2.1, label: 'vs last week' }}
            />
            <KPICard
              title={t('dashboard.todayRevenue')}
              value={`₹${metrics.todayRevenue.toLocaleString()}`}
              icon={IndianRupee}
              trend={{ value: 8, label: 'vs yesterday' }}
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard title={t('dashboard.todayTrips')} value={metrics.todayTrips} icon={TrendingUp} />
            <KPICard title={t('dashboard.onlineFleet')} value={`${metrics.onlineAmbulances}/${metrics.totalAmbulances}`} icon={Truck} />
            <KPICard title={t('dashboard.drivers')} value={`${metrics.onlineDrivers}/${metrics.totalDrivers}`} suffix="online" icon={Users} />
            <KPICard title={t('dashboard.registeredHospitals')} value={metrics.registeredHospitals} icon={Building2} />
          </div>

          {/* Live Map */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.fleetStatus')}</CardTitle>
            </CardHeader>
            <CardContent>
              <LiveFleetMap />
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentRequests')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestsTable bookings={bookings} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Fleet ─────────────────────────────────────── */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('dashboard.fleet')}</h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-green-500">{ambulances.filter(a => a.status === 'ONLINE').length}</div>
                <div className="text-sm text-muted-foreground">Online</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-yellow-500">{ambulances.filter(a => a.status === 'BUSY').length}</div>
                <div className="text-sm text-muted-foreground">Busy</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-slate-400">{ambulances.filter(a => a.status === 'OFFLINE').length}</div>
                <div className="text-sm text-muted-foreground">Offline</div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.ambulanceId')}</TableHead>
                  <TableHead>{t('dashboard.type')}</TableHead>
                  <TableHead>{t('dashboard.status')}</TableHead>
                  <TableHead>{t('dashboard.driverName')}</TableHead>
                  <TableHead>{t('dashboard.trips')}</TableHead>
                  <TableHead>{t('dashboard.lastActive')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ambulances.map(amb => (
                  <TableRow key={amb.id}>
                    <TableCell className="font-mono font-medium">{amb.registration}</TableCell>
                    <TableCell><Badge variant="outline">{amb.type}</Badge></TableCell>
                    <TableCell>
                      <Badge className={
                        amb.status === 'ONLINE' ? 'bg-green-500/10 text-green-600 border-green-200' :
                        amb.status === 'BUSY' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-200' :
                        'bg-slate-500/10 text-slate-600 border-slate-200'
                      }>
                        {amb.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{amb.driver?.name || '—'}</TableCell>
                    <TableCell className="font-mono">{amb.totalTrips || 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {amb.lastActive ? new Date(amb.lastActive).toLocaleString() : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ─── Drivers ───────────────────────────────────── */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('dashboard.drivers')}</h2>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.name')}</TableHead>
                  <TableHead>{t('dashboard.phone')}</TableHead>
                  <TableHead>{t('dashboard.verification')}</TableHead>
                  <TableHead>{t('dashboard.rating')}</TableHead>
                  <TableHead>{t('dashboard.trips')}</TableHead>
                  <TableHead>{t('dashboard.online')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map(driver => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-semibold text-primary">{driver.name[0]}</span>
                        </div>
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{driver.licenseNumber}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{driver.phone}</TableCell>
                    <TableCell>
                      <Badge className={
                        driver.verificationStatus === 'VERIFIED' ? 'bg-green-500/10 text-green-600' :
                        driver.verificationStatus === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600' :
                        'bg-red-500/10 text-red-600'
                      }>
                        <Shield className="mr-1 h-3 w-3" />
                        {driver.verificationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-mono font-semibold">{driver.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{driver.totalTrips}</TableCell>
                    <TableCell>
                      <div className={`h-3 w-3 rounded-full ${driver.isOnline ? 'bg-green-500' : 'bg-slate-400'}`} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ─── Hospitals ─────────────────────────────────── */}
      {activeTab === 'hospitals' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('dashboard.hospitals')}</h2>

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.name')}</TableHead>
                  <TableHead>{t('dashboard.capabilities')}</TableHead>
                  <TableHead>{t('dashboard.subscription')}</TableHead>
                  <TableHead>{t('dashboard.beds')}</TableHead>
                  <TableHead>{t('dashboard.patients')}</TableHead>
                  <TableHead>{t('dashboard.phone')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospitals.map(hospital => (
                  <TableRow key={hospital.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{hospital.name}</div>
                        <div className="text-xs text-muted-foreground">{hospital.location.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {hospital.capabilities.map(cap => (
                          <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        hospital.subscriptionPlan === 'PRO' ? 'bg-primary/10 text-primary' :
                        hospital.subscriptionPlan === 'BASIC' ? 'bg-green-500/10 text-green-600' :
                        'bg-slate-500/10 text-slate-600'
                      }>
                        {hospital.subscriptionPlan || 'FREE'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">{hospital.availableBeds}/{hospital.totalBeds}</span>
                    </TableCell>
                    <TableCell className="font-mono">{hospital.activePatients}</TableCell>
                    <TableCell className="font-mono text-sm">{hospital.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* ─── Analytics ─────────────────────────────────── */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{t('dashboard.analytics')}</h2>
          <AnalyticsCharts data={analytics} />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
