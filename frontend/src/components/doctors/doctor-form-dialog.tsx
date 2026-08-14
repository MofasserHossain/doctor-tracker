'use client';

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
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  specialization: z.string().trim().min(2, 'Specialization is required').max(120),
  hospital: z.string().trim().min(2, 'Hospital is required').max(160),
  phone: z.string().trim().min(6, 'Phone must be at least 6 characters').max(30),
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
              <Input id="doctor-name" autoComplete="name" {...form.register('name')} />
              {form.formState.errors.name ? (
                <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="doctor-specialization">Specialization</RequiredLabel>
              <Input id="doctor-specialization" {...form.register('specialization')} />
              {form.formState.errors.specialization ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.specialization.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="doctor-hospital">Hospital</RequiredLabel>
              <Input id="doctor-hospital" {...form.register('hospital')} />
              {form.formState.errors.hospital ? (
                <p className="text-destructive text-sm">{form.formState.errors.hospital.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <RequiredLabel htmlFor="doctor-phone">Phone</RequiredLabel>
              <Input id="doctor-phone" autoComplete="tel" {...form.register('phone')} />
              {form.formState.errors.phone ? (
                <p className="text-destructive text-sm">{form.formState.errors.phone.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2 md:col-span-2">
              <RequiredLabel htmlFor="doctor-email">Email</RequiredLabel>
              <Input
                id="doctor-email"
                type="email"
                autoComplete="email"
                {...form.register('email')}
              />
              {form.formState.errors.email ? (
                <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
              ) : null}
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
