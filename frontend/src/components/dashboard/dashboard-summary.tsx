'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getDashboardSummary } from '@/lib/api/dashboard';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarDays, Stethoscope, TrendingUp, UsersRound } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const fallbackSummary = {
  totals: {
    doctors: 0,
    patients: 0,
  },
  patientsPerDoctor: [],
  patientsByCondition: [],
  dateBasedStats: [],
};

export function DashboardSummary() {
  const { data } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  const summary = data ?? fallbackSummary;
  const visitRecords = summary.dateBasedStats.reduce((total, item) => total + item.count, 0);
  const activeCases = summary.patientsByCondition.reduce((total, item) => total + item.count, 0);
  const stats = [
    { label: 'Total Doctors', value: summary.totals.doctors, icon: Stethoscope },
    { label: 'Total Patients', value: summary.totals.patients, icon: UsersRound },
    { label: 'Visit Records', value: visitRecords, icon: CalendarDays },
    { label: 'Active Cases', value: activeCases, icon: TrendingUp },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className="text-muted-foreground size-4" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Patients Per Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.patientsPerDoctor}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="doctorName" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--muted)' }} />
                  <Bar dataKey="patientCount" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Date Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Patients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.dateBasedStats.length > 0 ? (
                  summary.dateBasedStats.map((item) => (
                    <TableRow key={item.date}>
                      <TableCell>{format(new Date(item.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-muted-foreground" colSpan={2}>
                      No patient data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
