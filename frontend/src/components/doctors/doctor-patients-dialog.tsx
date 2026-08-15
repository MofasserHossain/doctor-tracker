'use client';

import { PatientFormDialog } from '@/components/patients/patient-form-dialog';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { PaginationControls } from '@/components/shared/pagination-controls';
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
import { useCallback, useEffect, useState } from 'react';

type DoctorPatientsDialogProps = {
  doctor?: Doctor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DoctorPatientsDialog({ doctor, open, onOpenChange }: DoctorPatientsDialogProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [limit, setLimit] = useState(5);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [cursorIndex, setCursorIndex] = useState(0);
  const doctorId = doctor?._id;
  const currentCursor = cursorStack[cursorIndex];
  const patientsQuery = useDoctorPatientsQuery(doctorId, { cursor: currentCursor, limit }, open);
  const patientPage = patientsQuery.data;
  const patients = patientPage?.records ?? [];
  const meta = patientPage?.meta;

  const resetPagination = useCallback(() => {
    setCursorStack([undefined]);
    setCursorIndex(0);
  }, []);

  useEffect(() => {
    resetPagination();
  }, [doctorId, open, resetPagination]);

  const createMutation = useCreateDoctorPatientMutation(doctorId, {
    onSuccess: () => {
      setIsCreateOpen(false);
      resetPagination();
    },
  });
  const deleteMutation = useDeleteDoctorPatientMutation(doctorId, {
    onSuccess: () => {
      if (patients.length === 1 && cursorIndex > 0) {
        setCursorIndex((current) => Math.max(0, current - 1));
      }
    },
  });

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
                  {patientsQuery.isLoading ? (
                    <TableSkeletonRows columnCount={6} rows={limit} />
                  ) : null}
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
                        <DeleteConfirmationDialog
                          title={`Remove ${patient.name}?`}
                          description="This will permanently delete this patient record from the doctor's patient list."
                          confirmLabel="Remove"
                          pendingLabel="Removing..."
                          isPending={deleteMutation.isPending}
                          onConfirm={() => deleteMutation.mutate(patient._id)}
                        >
                          <Button
                            aria-label={`Remove ${patient.name}`}
                            disabled={deleteMutation.isPending}
                            size="icon-sm"
                            variant="destructive"
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </Button>
                        </DeleteConfirmationDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              meta={meta}
              isFetching={patientsQuery.isFetching}
              canGoBack={cursorIndex > 0}
              pageLabel={`Page ${cursorIndex + 1} - showing ${patients.length} patient${
                patients.length === 1 ? '' : 's'
              }`}
              onPrevious={() => {
                setCursorIndex((current) => Math.max(0, current - 1));
              }}
              onNext={() => {
                if (!meta?.nextCursor) {
                  return;
                }

                setCursorStack((current) => [
                  ...current.slice(0, cursorIndex + 1),
                  meta.nextCursor ?? undefined,
                ]);
                setCursorIndex((current) => current + 1);
              }}
              onLimitChange={(nextLimit) => {
                setLimit(nextLimit);
                resetPagination();
              }}
            />
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
