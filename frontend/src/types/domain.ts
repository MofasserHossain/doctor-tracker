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
};

export type CurrentUserResponse = {
  user: AuthUser;
};

export type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type DoctorPayload = {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
};

export const patientConditions = ['stable', 'critical', 'recovering', 'observation'] as const;
export const patientStatuses = ['scheduled', 'admitted', 'discharged', 'follow-up'] as const;
export const patientGenders = ['male', 'female', 'other'] as const;

export type PatientCondition = (typeof patientConditions)[number];
export type PatientStatus = (typeof patientStatuses)[number];
type PatientGender = (typeof patientGenders)[number];

export type DoctorSummary = Pick<Doctor, '_id' | 'name' | 'specialization' | 'hospital'>;

export type Patient = {
  _id: string;
  doctorId: string | DoctorSummary;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender: PatientGender;
  condition: PatientCondition;
  status: PatientStatus;
  visitDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PatientPayload = {
  doctorId?: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender: PatientGender;
  condition: PatientCondition;
  status: PatientStatus;
  visitDate: string;
  notes?: string;
};
