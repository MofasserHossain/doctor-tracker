type DashboardTotals = {
  doctors: number;
  patients: number;
};

type PatientsPerDoctor = {
  doctorId: string;
  doctorName: string;
  specialization: string;
  patientCount: number;
};

type PatientsByCondition = {
  condition: string;
  count: number;
};

type DateBasedStat = {
  date: string;
  count: number;
};

export type DashboardSummary = {
  totals: DashboardTotals;
  patientsPerDoctor: PatientsPerDoctor[];
  patientsByCondition: PatientsByCondition[];
  dateBasedStats: DateBasedStat[];
};

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};
