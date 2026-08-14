'use client';

import { TableSkeletonRows } from '@/components/shared/table-skeleton-rows';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, toTitleCase } from '@/lib/format';
import { useDashboardSummaryQuery } from '@/lib/services/dashboard';
import type { DashboardSummary } from '@/types/domain';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const fallbackSummary: DashboardSummary = {
  totals: {
    doctors: 0,
    patients: 0,
  },
  patientsPerDoctor: [],
  patientsByCondition: [],
  dateBasedStats: [],
};

const datePageSize = 6;
const dateSeriesColor = '#0f766e';
const chartColors = [
  '#0f766e',
  '#0d9488',
  '#0891b2',
  '#0284c7',
  '#2563eb',
  '#4f46e5',
  '#0369a1',
  '#047857',
  '#14b8a6',
  '#475569',
];
const conditionColors: Record<string, string> = {
  stable: dateSeriesColor,
  observation: '#0891b2',
  recovering: '#2563eb',
  critical: '#4f46e5',
};
const doctorNameMaxWords = 3;
const doctorNameMaxLength = 18;
const tooltipStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--card-foreground)',
};

const getConditionColor = (condition: string, index: number) => {
  return conditionColors[condition] ?? chartColors[index % chartColors.length];
};

const formatDoctorAxisName = (value: string) => {
  const limitedWords = value.trim().split(/\s+/).slice(0, doctorNameMaxWords).join(' ');

  if (limitedWords.length <= doctorNameMaxLength) {
    return limitedWords;
  }

  return `${limitedWords.slice(0, doctorNameMaxLength - 1).trim()}...`;
};

function BarChartSkeleton() {
  const heights = ['80%', '72%', '58%', '66%', '52%', '61%', '48%', '57%', '44%', '50%'];

  return (
    <div className="flex h-72 items-end gap-3 px-4 pt-6 pb-12">
      {heights.map((height, index) => (
        <Skeleton
          key={`doctor-bar-skeleton-${index.toString()}`}
          className="min-w-8 flex-1 rounded-t-md"
          style={{ height }}
        />
      ))}
    </div>
  );
}

function ConditionSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
      <Skeleton className="mx-auto size-36 rounded-full" />
      <div className="grid gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={`condition-skeleton-${index.toString()}`}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-9 rounded-4xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaChartSkeleton() {
  return (
    <div className="grid h-72 content-end gap-3 px-4 pt-6 pb-10">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function DashboardSummary() {
  const [datePage, setDatePage] = useState(1);
  const summaryQuery = useDashboardSummaryQuery();

  const summary = summaryQuery.data ?? fallbackSummary;
  const isSummaryLoading = summaryQuery.isLoading;
  const visitRecords = summary.dateBasedStats.reduce((total, item) => total + item.count, 0);
  const activeCases = summary.patientsByCondition.reduce((total, item) => total + item.count, 0);
  const doctorChartData = useMemo(
    () =>
      summary.patientsPerDoctor.map((item, index) => ({
        ...item,
        fill: chartColors[index % chartColors.length],
      })),
    [summary.patientsPerDoctor],
  );
  const conditionChartData = useMemo(
    () =>
      summary.patientsByCondition.map((item, index) => ({
        ...item,
        label: toTitleCase(item.condition),
        fill: getConditionColor(item.condition, index),
      })),
    [summary.patientsByCondition],
  );
  const dateChartData = useMemo(
    () =>
      summary.dateBasedStats.map((item) => ({
        ...item,
        formattedDate: formatDate(item.date),
      })),
    [summary.dateBasedStats],
  );
  const datePageCount = Math.max(1, Math.ceil(dateChartData.length / datePageSize));
  const currentDatePage = Math.min(datePage, datePageCount);
  const dateStartIndex = (currentDatePage - 1) * datePageSize;
  const paginatedDateStats = dateChartData.slice(dateStartIndex, dateStartIndex + datePageSize);
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
              {isSummaryLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <p className="text-3xl font-semibold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Patients Per Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <BarChartSkeleton />
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doctorChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      angle={-45}
                      axisLine={false}
                      dataKey="doctorName"
                      height={96}
                      interval={0}
                      textAnchor="end"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatDoctorAxisName(String(value))}
                      tickLine={false}
                      tickMargin={10}
                    />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: 'color-mix(in srgb, var(--muted) 70%, transparent)' }}
                      formatter={(value) => [`${value} patients`, 'Patients']}
                    />
                    <Bar dataKey="patientCount" name="Patients" radius={[6, 6, 0, 0]}>
                      {doctorChartData.map((item) => (
                        <Cell key={item.doctorId} fill={item.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Condition Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isSummaryLoading ? (
              <ConditionSkeleton />
            ) : (
              <div className="grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={conditionChartData}
                        dataKey="count"
                        nameKey="label"
                        innerRadius={42}
                        outerRadius={76}
                        paddingAngle={3}
                      >
                        {conditionChartData.map((item) => (
                          <Cell key={item.condition} fill={item.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name) => [`${value} patients`, String(name)]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-2">
                  {conditionChartData.length > 0 ? (
                    conditionChartData.map((item) => (
                      <div
                        key={item.condition}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ background: item.fill }}
                          />
                          {item.label}
                        </span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No condition data available.</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Date Statistics</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Daily patient visit activity grouped by visit date.
              </p>
            </div>
            {isSummaryLoading ? (
              <Skeleton className="h-5 w-24 rounded-4xl" />
            ) : (
              <Badge variant="outline">{dateChartData.length} date groups</Badge>
            )}
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              {isSummaryLoading ? (
                <>
                  <AreaChartSkeleton />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </>
              ) : (
                <>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dateChartData}>
                        <defs>
                          <linearGradient id="dateVisits" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor={dateSeriesColor} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={dateSeriesColor} stopOpacity={0.04} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="formattedDate"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          minTickGap={24}
                        />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(value) => [`${value} patients`, 'Daily patients']}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Daily patients"
                          stroke={dateSeriesColor}
                          strokeWidth={2.5}
                          fill="url(#dateVisits)"
                          activeDot={{ r: 5, strokeWidth: 0, fill: dateSeriesColor }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: dateSeriesColor }}
                      />
                      Daily patients
                    </span>
                    <span className="font-medium">{visitRecords} total visit records</span>
                  </div>
                </>
              )}
            </div>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Patients</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSummaryLoading ? (
                    <TableSkeletonRows columnCount={2} rows={datePageSize} />
                  ) : null}
                  {!isSummaryLoading && paginatedDateStats.length > 0
                    ? paginatedDateStats.map((item) => (
                        <TableRow key={item.date}>
                          <TableCell>{item.formattedDate}</TableCell>
                          <TableCell className="text-right font-medium">{item.count}</TableCell>
                        </TableRow>
                      ))
                    : null}
                  {!isSummaryLoading && paginatedDateStats.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-muted-foreground" colSpan={2}>
                        No patient data available.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
              <div className="border-t px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-muted-foreground text-xs">
                    Page {currentDatePage} of {datePageCount}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      aria-label="Previous date statistics page"
                      disabled={currentDatePage <= 1}
                      size="icon-sm"
                      type="button"
                      variant="outline"
                      onClick={() => setDatePage((page) => Math.max(1, page - 1))}
                    >
                      <ChevronLeft aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label="Next date statistics page"
                      disabled={currentDatePage >= datePageCount}
                      size="icon-sm"
                      type="button"
                      variant="outline"
                      onClick={() => setDatePage((page) => Math.min(datePageCount, page + 1))}
                    >
                      <ChevronRight aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
