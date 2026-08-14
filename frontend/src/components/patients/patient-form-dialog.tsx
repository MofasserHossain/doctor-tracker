'use client';

import { DoctorCombobox } from '@/components/doctors/doctor-combobox';
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
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  phone: z.string().trim().min(6, 'Phone must be at least 6 characters').max(30),
  email: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.email('Enter a valid email').optional(),
  ),
  age: z.preprocess(
    (value) => (value === '' || Number.isNaN(value) ? undefined : value),
    z.coerce.number().int().min(0).max(130).optional(),
  ),
  gender: z.enum(patientGenders),
  condition: z.enum(patientConditions),
  status: z.enum(patientStatuses),
  visitDate: z.string().min(1, 'Visit date is required'),
  notes: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().trim().max(1000).optional(),
  ),
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
                  form.setValue('doctorId', value, { shouldValidate: true })
                }
                placeholder="Search doctor"
              />
              {form.formState.errors.doctorId ? (
                <p className="text-destructive text-sm">{form.formState.errors.doctorId.message}</p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-name">Name</RequiredLabel>
              <Input id="patient-name" autoComplete="name" {...form.register('name')} />
              {form.formState.errors.name ? (
                <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-phone">Phone</RequiredLabel>
              <Input id="patient-phone" autoComplete="tel" {...form.register('phone')} />
              {form.formState.errors.phone ? (
                <p className="text-destructive text-sm">{form.formState.errors.phone.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patient-email">Email</Label>
              <Input
                id="patient-email"
                type="email"
                autoComplete="email"
                {...form.register('email')}
              />
              {form.formState.errors.email ? (
                <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="patient-age">Age</Label>
              <Input id="patient-age" type="number" min={0} max={130} {...form.register('age')} />
              {form.formState.errors.age ? (
                <p className="text-destructive text-sm">{form.formState.errors.age.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-gender">Gender</RequiredLabel>
              <Select
                value={form.watch('gender')}
                onValueChange={(value) =>
                  form.setValue('gender', value as PatientFormValues['gender'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="patient-gender" className="w-full">
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
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-visit-date">Visit Date</RequiredLabel>
              <Input id="patient-visit-date" type="date" {...form.register('visitDate')} />
              {form.formState.errors.visitDate ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.visitDate.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-condition">Condition</RequiredLabel>
              <Select
                value={form.watch('condition')}
                onValueChange={(value) =>
                  form.setValue('condition', value as PatientFormValues['condition'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="patient-condition" className="w-full">
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
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="patient-status">Status</RequiredLabel>
              <Select
                value={form.watch('status')}
                onValueChange={(value) =>
                  form.setValue('status', value as PatientFormValues['status'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="patient-status" className="w-full">
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
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="patient-notes">Notes</Label>
              <Textarea id="patient-notes" rows={3} {...form.register('notes')} />
              {form.formState.errors.notes ? (
                <p className="text-destructive text-sm">{form.formState.errors.notes.message}</p>
              ) : null}
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
