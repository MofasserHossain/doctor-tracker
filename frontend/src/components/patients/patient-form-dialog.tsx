'use client';

import { DoctorCombobox } from '@/components/doctors/doctor-combobox';
import { FieldError, getFieldErrorProps } from '@/components/shared/field-error';
import { RequiredLabel } from '@/components/shared/required-label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toDateInputValue, toTitleCase } from '@/lib/format';
import type { Doctor, Patient, PatientPayload } from '@/types/domain';
import { patientConditions, patientGenders, patientStatuses } from '@/types/domain';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const patientFormSchema = z.object({
  doctorId: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be 120 characters or less'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone is required')
    .min(6, 'Phone must be at least 6 characters')
    .max(30, 'Phone must be 30 characters or less'),
  email: z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? undefined : trimmedValue;
  }, z.email('Enter a valid email').optional()),
  age: z.preprocess(
    (value) => (value === '' ? undefined : Number(value)),
    z
      .number('Age must be a number')
      .int('Age must be a whole number')
      .min(0, 'Age cannot be negative')
      .max(130, 'Age must be 130 or less')
      .optional(),
  ),
  gender: z.enum(patientGenders, 'Select a gender'),
  condition: z.enum(patientConditions, 'Select a condition'),
  status: z.enum(patientStatuses, 'Select a status'),
  visitDate: z.string().min(1, 'Visit date is required'),
  notes: z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue === '' ? undefined : trimmedValue;
  }, z.string().max(1000, 'Notes must be 1000 characters or less').optional()),
});

type PatientFormInput = z.input<typeof patientFormSchema>;
type PatientFormValues = z.output<typeof patientFormSchema>;

type PatientFormDialogProps = {
  lockedDoctor?: Doctor;
  patient?: Patient;
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: PatientPayload) => Promise<void>;
};

const today = () => new Date().toISOString().slice(0, 10);

const defaultValues: PatientFormInput = {
  doctorId: '',
  name: '',
  phone: '',
  email: '',
  age: '',
  gender: 'male',
  condition: 'stable',
  status: 'scheduled',
  visitDate: today(),
  notes: '',
};

export function PatientFormDialog({
  lockedDoctor,
  patient,
  open,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: PatientFormDialogProps) {
  const form = useForm<PatientFormInput, unknown, PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });
  const showDoctorSelect = !patient && !lockedDoctor;

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(
      patient
        ? {
            doctorId:
              typeof patient.doctorId === 'string' ? patient.doctorId : patient.doctorId._id,
            name: patient.name,
            phone: patient.phone,
            email: patient.email ?? '',
            age: patient.age ?? '',
            gender: patient.gender,
            condition: patient.condition,
            status: patient.status,
            visitDate: toDateInputValue(patient.visitDate),
            notes: patient.notes ?? '',
          }
        : {
            ...defaultValues,
            doctorId: lockedDoctor?._id ?? '',
            visitDate: today(),
          },
    );
  }, [form, lockedDoctor, open, patient]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (showDoctorSelect && !values.doctorId) {
      form.setError('doctorId', { message: 'Select a doctor' });
      return;
    }

    await onSubmit({
      ...values,
      doctorId: lockedDoctor?._id ?? values.doctorId,
      email: values.email,
      notes: values.notes,
    });
  });
  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{patient ? 'Edit Patient' : 'Add Patient'}</DialogTitle>
          <DialogDescription>
            {patient
              ? 'Update patient care information.'
              : 'Create a patient record and care visit.'}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {lockedDoctor ? (
            <div className="grid gap-1 rounded-lg border p-3">
              <p className="text-sm font-medium">{lockedDoctor.name}</p>
              <p className="text-muted-foreground text-xs">
                {lockedDoctor.specialization} - {lockedDoctor.hospital}
              </p>
            </div>
          ) : null}

          {showDoctorSelect ? (
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-doctor">Doctor</RequiredLabel>
              <DoctorCombobox
                id="patient-doctor"
                value={form.watch('doctorId') ?? ''}
                onValueChange={(value) =>
                  form.setValue('doctorId', value, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
                {...getFieldErrorProps('patient-doctor', errors.doctorId?.message)}
                placeholder="Search doctor"
              />
              <FieldError id="patient-doctor-error">{errors.doctorId?.message}</FieldError>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-name">Name</RequiredLabel>
              <Input
                id="patient-name"
                autoComplete="name"
                {...getFieldErrorProps('patient-name', errors.name?.message)}
                {...form.register('name')}
              />
              <FieldError id="patient-name-error">{errors.name?.message}</FieldError>
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-phone">Phone</RequiredLabel>
              <Input
                id="patient-phone"
                autoComplete="tel"
                {...getFieldErrorProps('patient-phone', errors.phone?.message)}
                {...form.register('phone')}
              />
              <FieldError id="patient-phone-error">{errors.phone?.message}</FieldError>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patient-email">Email</Label>
              <Input
                id="patient-email"
                type="email"
                autoComplete="email"
                {...getFieldErrorProps('patient-email', errors.email?.message)}
                {...form.register('email')}
              />
              <FieldError id="patient-email-error">{errors.email?.message}</FieldError>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patient-age">Age</Label>
              <Input
                id="patient-age"
                type="number"
                min={0}
                max={130}
                {...getFieldErrorProps('patient-age', errors.age?.message)}
                {...form.register('age')}
              />
              <FieldError id="patient-age-error">{errors.age?.message}</FieldError>
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-gender">Gender</RequiredLabel>
              <Select
                value={form.watch('gender')}
                onValueChange={(value) =>
                  form.setValue('gender', value as PatientFormValues['gender'], {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="patient-gender"
                  className="w-full"
                  {...getFieldErrorProps('patient-gender', errors.gender?.message)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patientGenders.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {toTitleCase(gender)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="patient-gender-error">{errors.gender?.message}</FieldError>
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-visit-date">Visit Date</RequiredLabel>
              <Input
                id="patient-visit-date"
                type="date"
                {...getFieldErrorProps('patient-visit-date', errors.visitDate?.message)}
                {...form.register('visitDate')}
              />
              <FieldError id="patient-visit-date-error">{errors.visitDate?.message}</FieldError>
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-condition">Condition</RequiredLabel>
              <Select
                value={form.watch('condition')}
                onValueChange={(value) =>
                  form.setValue('condition', value as PatientFormValues['condition'], {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="patient-condition"
                  className="w-full"
                  {...getFieldErrorProps('patient-condition', errors.condition?.message)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patientConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {toTitleCase(condition)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="patient-condition-error">{errors.condition?.message}</FieldError>
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-status">Status</RequiredLabel>
              <Select
                value={form.watch('status')}
                onValueChange={(value) =>
                  form.setValue('status', value as PatientFormValues['status'], {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="patient-status"
                  className="w-full"
                  {...getFieldErrorProps('patient-status', errors.status?.message)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patientStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {toTitleCase(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError id="patient-status-error">{errors.status?.message}</FieldError>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="patient-notes">Notes</Label>
              <Textarea
                id="patient-notes"
                rows={3}
                {...getFieldErrorProps('patient-notes', errors.notes?.message)}
                {...form.register('notes')}
              />
              <FieldError id="patient-notes-error">{errors.notes?.message}</FieldError>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="gap-2" disabled={isSubmitting || form.formState.isSubmitting}>
              <Save className="size-4" aria-hidden="true" />
              {patient ? 'Save Changes' : 'Create Patient'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
