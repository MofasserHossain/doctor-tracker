import type { DoctorSummary, Patient } from '@/types/domain';
import { describe, expect, it } from 'vitest';

import { getPatientDoctor, toDateInputValue, toTitleCase } from './format';

const doctor: DoctorSummary = {
  _id: 'doctor-1',
  name: 'Dr. Ayesha Rahman',
  specialization: 'Cardiology',
  hospital: 'Care Guide Medical Center',
};

const basePatient: Patient = {
  _id: 'patient-1',
  doctorId: doctor,
  name: 'Nusrat Karim',
  phone: '+8801711111111',
  email: 'nusrat@example.com',
  age: 42,
  gender: 'female',
  condition: 'stable',
  status: 'scheduled',
  visitDate: '2026-08-01T10:00:00.000Z',
  notes: 'Routine follow-up',
  createdAt: '2026-08-01T09:00:00.000Z',
  updatedAt: '2026-08-01T09:00:00.000Z',
};

describe('format helpers', () => {
  it('formats enum-like slugs for display', () => {
    expect(toTitleCase('follow-up')).toBe('Follow Up');
    expect(toTitleCase('critical')).toBe('Critical');
  });

  it('normalizes ISO dates for date inputs', () => {
    expect(toDateInputValue('2026-08-15T09:30:00.000Z')).toBe('2026-08-15');
    expect(toDateInputValue()).toBe('');
  });

  it('returns populated doctor summaries and ignores string ids', () => {
    expect(getPatientDoctor(basePatient)).toEqual(doctor);
    expect(getPatientDoctor({ ...basePatient, doctorId: 'doctor-1' })).toBeUndefined();
  });
});
