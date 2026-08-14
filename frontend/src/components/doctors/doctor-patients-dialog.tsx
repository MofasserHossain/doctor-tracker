'use client';

import { PatientFormDialog } from '@/components/patients/patient-form-dialog';
import { TableSkeletonRows } from '@/components/shared/table-skeleton-rows';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, toTitleCase } from '@/lib/format';
import {
  useCreateDoctorPatientMutation,
  useDeleteDoctorPatientMutation,
  useDoctorPatientsQuery,
} from '@/lib/services/doctors';
import type { Doctor } from '@/types/domain';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type DoctorPatientsDialogProps = {
  doctor?: Doctor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DoctorPatientsDialog({ doctor, open, onOpenChange }: DoctorPatientsDialogProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const doctorId = doctor?._id;
  const patientsQuery = useDoctorPatientsQuery(doctorId, open);
  const createMutation = useCreateDoctorPatientMutation(doctorId, {
    onSuccess: () => {
      setIsCreateOpen(false);
    },
  });
  const deleteMutation = useDeleteDoctorPatientMutation(doctorId);

  const patients = patientsQuery.data ?? [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{doctor?.name ?? 'Doctor Patients'}</DialogTitle>
            <DialogDescription>
              {doctor
                ? `${doctor.specialization} - ${doctor.hospital}`
                : 'Assigned patient records.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="flex justify-end">
              <Button className="gap-2" disabled={!doctor} onClick={() => setIsCreateOpen(true)}>
                <Plus className="size-4" aria-hidden="true" />
                Add Patient
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientsQuery.isLoading ? <TableSkeletonRows columnCount={6} rows={5} /> : null}
                  {!patientsQuery.isLoading && patients.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-muted-foreground" colSpan={6}>
                        No patients assigned to this doctor.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {patients.map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell>
                        <div className="grid gap-1">
                          <span className="font-medium">{patient.name}</span>
                          {patient.email ? (
                            <span className="text-muted-foreground text-xs">{patient.email}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{toTitleCase(patient.condition)}</TableCell>
                      <TableCell>{toTitleCase(patient.status)}</TableCell>
                      <TableCell>{formatDate(patient.visitDate)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          aria-label={`Remove ${patient.name}`}
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Remove ${patient.name} from this doctor's patient list?`,
                              )
                            ) {
                              deleteMutation.mutate(patient._id);
                            }
                          }}
                          size="icon-sm"
                          variant="destructive"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {doctor ? (
        <PatientFormDialog
          lockedDoctor={doctor}
          open={isCreateOpen}
          isSubmitting={createMutation.isPending}
          onOpenChange={setIsCreateOpen}
          onSubmit={async (payload) => {
            await createMutation.mutateAsync(payload);
          }}
        />
      ) : null}
    </>
  );
}
