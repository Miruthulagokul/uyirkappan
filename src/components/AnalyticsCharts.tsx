import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsData } from '@/lib/types';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

const COLORS = ['#0EA5E9', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const AnalyticsCharts = ({ data }: AnalyticsChartsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Trips Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.tripsOverTime')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.tripsOverTime}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="trips" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 4 }} name="Trips" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.revenueByType')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.tripsByType}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#22C55E" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="count" fill="#0EA5E9" radius={[4, 4, 0, 0]} name="Trips" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Response Time Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.responseTime')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.responseTimeTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} unit=" min" />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)} min`} />
              <Area type="monotone" dataKey="avgMinutes" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} name="Avg Response Time" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trip Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.tripDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.tripsByStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
                label={({ status, count }) => `${status}: ${count}`}
              >
                {data.tripsByStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.peakHours')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.peakHours}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={v => `${v}:00`} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={v => `${v}:00`} />
              <Bar dataKey="trips" fill="#8B5CF6" radius={[2, 2, 0, 0]} name="Trips" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hospital Load */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.hospitalLoad')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.hospitalLoad} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="hospital" type="category" tick={{ fontSize: 10 }} width={120} />
              <Tooltip />
              <Bar dataKey="patients" fill="#EF4444" radius={[0, 4, 4, 0]} name="Patients" />
              <Bar dataKey="capacity" fill="#E2E8F0" radius={[0, 4, 4, 0]} name="Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
