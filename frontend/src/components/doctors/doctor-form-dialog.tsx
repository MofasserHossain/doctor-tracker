'use client';

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
import type { Doctor, DoctorPayload } from '@/types/domain';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const doctorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be 120 characters or less'),
  specialization: z
    .string()
    .trim()
    .min(1, 'Specialization is required')
    .min(2, 'Specialization must be at least 2 characters')
    .max(120, 'Specialization must be 120 characters or less'),
  hospital: z
    .string()
    .trim()
    .min(1, 'Hospital is required')
    .min(2, 'Hospital must be at least 2 characters')
    .max(160, 'Hospital must be 160 characters or less'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone is required')
    .min(6, 'Phone must be at least 6 characters')
    .max(30, 'Phone must be 30 characters or less'),
  email: z.email('Enter a valid email'),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

type DoctorFormDialogProps = {
  doctor?: Doctor;
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DoctorPayload) => Promise<void>;
};

const emptyValues: DoctorFormValues = {
  name: '',
  specialization: '',
  hospital: '',
  phone: '',
  email: '',
};

export function DoctorFormDialog({
  doctor,
  open,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: DoctorFormDialogProps) {
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: emptyValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset(
      doctor
        ? {
            name: doctor.name,
            specialization: doctor.specialization,
            hospital: doctor.hospital,
            phone: doctor.phone,
            email: doctor.email,
          }
        : emptyValues,
    );
  }, [doctor, form, open]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });
  const errors = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{doctor ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle>
          <DialogDescription>
            {doctor
              ? 'Update this doctor profile.'
              : 'Create a doctor profile for patient assignment.'}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <RequiredLabel htmlFor="doctor-name">Name</RequiredLabel>
              <Input
                id="doctor-name"
                autoComplete="name"
                {...getFieldErrorProps('doctor-name', errors.name?.message)}
                {...form.register('name')}
              />
              <FieldError id="doctor-name-error">{errors.name?.message}</FieldError>
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="doctor-specialization">Specialization</RequiredLabel>
              <Input
                id="doctor-specialization"
                {...getFieldErrorProps('doctor-specialization', errors.specialization?.message)}
                {...form.register('specialization')}
              />
              <FieldError id="doctor-specialization-error">
                {errors.specialization?.message}
              </FieldError>
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="doctor-hospital">Hospital</RequiredLabel>
              <Input
                id="doctor-hospital"
                {...getFieldErrorProps('doctor-hospital', errors.hospital?.message)}
                {...form.register('hospital')}
              />
              <FieldError id="doctor-hospital-error">{errors.hospital?.message}</FieldError>
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="doctor-phone">Phone</RequiredLabel>
              <Input
                id="doctor-phone"
                autoComplete="tel"
                {...getFieldErrorProps('doctor-phone', errors.phone?.message)}
                {...form.register('phone')}
              />
              <FieldError id="doctor-phone-error">{errors.phone?.message}</FieldError>
            </div>
            <div className="grid gap-2 md:col-span-2">
              <RequiredLabel htmlFor="doctor-email">Email</RequiredLabel>
              <Input
                id="doctor-email"
                type="email"
                autoComplete="email"
                {...getFieldErrorProps('doctor-email', errors.email?.message)}
                {...form.register('email')}
              />
              <FieldError id="doctor-email-error">{errors.email?.message}</FieldError>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="gap-2" disabled={isSubmitting || form.formState.isSubmitting}>
              <Save className="size-4" aria-hidden="true" />
              {doctor ? 'Save Changes' : 'Create Doctor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
