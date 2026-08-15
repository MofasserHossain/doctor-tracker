'use client';

import { DoctorFormDialog } from '@/components/doctors/doctor-form-dialog';
import { DoctorPatientsDialog } from '@/components/doctors/doctor-patients-dialog';
import { DeleteConfirmationDialog } from '@/components/shared/delete-confirmation-dialog';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { TableSkeletonRows } from '@/components/shared/table-skeleton-rows';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import {
  useCreateDoctorMutation,
  useDeleteDoctorMutation,
  useDoctorsQuery,
  useUpdateDoctorMutation,
} from '@/lib/services/doctors';
import { useDoctorTableQueryState } from '@/lib/services/table-query-state';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import type { Doctor, DoctorPayload } from '@/types/domain';
import { Edit, Eye, Plus, Search, Stethoscope, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type DoctorFilters = {
  search: string;
  specialization: string;
  hospital: string;
  from: string;
  to: string;
};

export function DoctorManagement() {
  const [tableState, setTableState] = useDoctorTableQueryState();
  const [searchInput, setSearchInput] = useState(tableState.search);
  const [specializationInput, setSpecializationInput] = useState(tableState.specialization);
  const [hospitalInput, setHospitalInput] = useState(tableState.hospital);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [formDoctor, setFormDoctor] = useState<Doctor | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [patientsDoctor, setPatientsDoctor] = useState<Doctor | undefined>();
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350);
  const debouncedSpecialization = useDebouncedValue(specializationInput.trim(), 350);
  const debouncedHospital = useDebouncedValue(hospitalInput.trim(), 350);
  const currentCursor = tableState.cursor || undefined;

  const resetCursor = useCallback(() => {
    setCursorStack([undefined]);
    setCursorIndex(0);
  }, []);

  useEffect(() => {
    setCursorStack((current) => {
      if (!currentCursor) {
        setCursorIndex(0);
        return [undefined];
      }

      const existingIndex = current.indexOf(currentCursor);

      if (existingIndex >= 0) {
        setCursorIndex(existingIndex);
        return current;
      }

      setCursorIndex(1);
      return [undefined, currentCursor];
    });
  }, [currentCursor]);

  useEffect(() => {
    setSearchInput(tableState.search);
  }, [tableState.search]);

  useEffect(() => {
    setSpecializationInput(tableState.specialization);
  }, [tableState.specialization]);

  useEffect(() => {
    setHospitalInput(tableState.hospital);
  }, [tableState.hospital]);

  useEffect(() => {
    const nextSearch = searchInput.trim() === '' ? '' : debouncedSearch;
    const nextSpecialization = specializationInput.trim() === '' ? '' : debouncedSpecialization;
    const nextHospital = hospitalInput.trim() === '' ? '' : debouncedHospital;
    const nextFilters = {
      search: nextSearch,
      specialization: nextSpecialization,
      hospital: nextHospital,
    };

    if (
      tableState.search === nextFilters.search &&
      tableState.specialization === nextFilters.specialization &&
      tableState.hospital === nextFilters.hospital
    ) {
      return;
    }

    void setTableState({
      ...nextFilters,
      cursor: null,
    });
    resetCursor();
  }, [
    debouncedHospital,
    debouncedSearch,
    debouncedSpecialization,
    hospitalInput,
    resetCursor,
    searchInput,
    setTableState,
    specializationInput,
    tableState.hospital,
    tableState.search,
    tableState.specialization,
  ]);

  const doctorsQuery = useDoctorsQuery({
    search: tableState.search,
    specialization: tableState.specialization,
    hospital: tableState.hospital,
    from: tableState.from,
    to: tableState.to,
    limit: tableState.limit,
    cursor: currentCursor,
  });
  const createMutation = useCreateDoctorMutation({
    onSuccess: () => {
      setIsFormOpen(false);
      setFormDoctor(undefined);
      resetCursor();
    },
  });
  const updateMutation = useUpdateDoctorMutation({
    onSuccess: () => {
      setIsFormOpen(false);
      setFormDoctor(undefined);
    },
  });
  const deleteMutation = useDeleteDoctorMutation({
    onSuccess: () => {
      resetCursor();
    },
  });

  const doctors = doctorsQuery.data?.records ?? [];
  const meta = doctorsQuery.data?.meta;
  const hasActiveFilters =
    searchInput.trim() !== '' ||
    specializationInput.trim() !== '' ||
    hospitalInput.trim() !== '' ||
    tableState.search !== '' ||
    tableState.specialization !== '' ||
    tableState.hospital !== '' ||
    tableState.from !== '' ||
    tableState.to !== '';

  const updateFilters = (
    nextFilters: Partial<Omit<DoctorFilters, 'search' | 'specialization' | 'hospital'>>,
  ) => {
    void setTableState({
      ...nextFilters,
      cursor: null,
    });
    resetCursor();
  };

  const clearFilters = () => {
    setSearchInput('');
    setSpecializationInput('');
    setHospitalInput('');
    void setTableState({
      search: null,
      specialization: null,
      hospital: null,
      from: null,
      to: null,
      cursor: null,
    });
    resetCursor();
  };

  const openCreateForm = () => {
    setFormDoctor(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (doctor: Doctor) => {
    setFormDoctor(doctor);
    setIsFormOpen(true);
  };

  const handleSubmitDoctor = async (payload: DoctorPayload) => {
    if (formDoctor) {
      await updateMutation.mutateAsync({ id: formDoctor._id, payload });
      return;
    }

    await createMutation.mutateAsync(payload);
  };

  return (
    <>
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Doctors</h1>
            <p className="text-muted-foreground text-sm">
              Directory of assigned physicians and care teams.
            </p>
          </div>
          <Button className="w-fit gap-2" onClick={openCreateForm}>
            <Plus className="size-4" aria-hidden="true" />
            Add Doctor
          </Button>
        </div>

        <Card>
          <CardHeader className="gap-4">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="size-5" aria-hidden="true" />
              Doctor List
            </CardTitle>
            <div
              className={
                hasActiveFilters
                  ? 'grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto_auto_auto]'
                  : 'grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto_auto]'
              }
            >
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="Search doctors"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
              <Input
                placeholder="Specialization"
                value={specializationInput}
                onChange={(event) => setSpecializationInput(event.target.value)}
              />
              <Input
                placeholder="Hospital"
                value={hospitalInput}
                onChange={(event) => setHospitalInput(event.target.value)}
              />
              <Input
                aria-label="Created from"
                type="date"
                value={tableState.from}
                onChange={(event) =>
                  updateFilters({
                    from: event.target.value,
                  })
                }
              />
              <Input
                aria-label="Created to"
                type="date"
                value={tableState.to}
                onChange={(event) =>
                  updateFilters({
                    to: event.target.value,
                  })
                }
              />
              {hasActiveFilters ? (
                <Button
                  aria-label="Clear all doctor filters"
                  className="justify-self-start"
                  onClick={clearFilters}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-32 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctorsQuery.isLoading ? (
                    <TableSkeletonRows columnCount={6} rows={tableState.limit} />
                  ) : null}
                  {!doctorsQuery.isLoading && doctors.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-muted-foreground" colSpan={6}>
                        No doctor data available.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {doctors.map((doctor) => (
                    <TableRow key={doctor._id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.hospital}</TableCell>
                      <TableCell>
                        <div className="grid gap-1">
                          <span>{doctor.phone}</span>
                          <span className="text-muted-foreground text-xs">{doctor.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(doctor.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            aria-label={`View patients for ${doctor.name}`}
                            onClick={() => setPatientsDoctor(doctor)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </Button>
                          <Button
                            aria-label={`Edit ${doctor.name}`}
                            onClick={() => openEditForm(doctor)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Edit className="size-4" aria-hidden="true" />
                          </Button>
                          <DeleteConfirmationDialog
                            title={`Delete ${doctor.name}?`}
                            description="This doctor record will be permanently deleted. If the doctor still has assigned patients, the backend will block this action until those patients are removed or reassigned."
                            isPending={deleteMutation.isPending}
                            onConfirm={() => deleteMutation.mutate(doctor._id)}
                          >
                            <Button
                              aria-label={`Delete ${doctor.name}`}
                              disabled={deleteMutation.isPending}
                              size="icon-sm"
                              variant="destructive"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </DeleteConfirmationDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <PaginationControls
              meta={meta}
              isFetching={doctorsQuery.isFetching}
              canGoBack={cursorIndex > 0}
              pageLabel={`Page ${cursorIndex + 1} - showing ${doctors.length} doctor${
                doctors.length === 1 ? '' : 's'
              }`}
              onPrevious={() => {
                const previousIndex = Math.max(0, cursorIndex - 1);
                const previousCursor = cursorStack[previousIndex];

                setCursorIndex(previousIndex);
                void setTableState({ cursor: previousCursor ?? null });
              }}
              onNext={() => {
                if (!meta?.nextCursor) {
                  return;
                }

                const nextCursor = meta.nextCursor;

                setCursorStack((current) => [...current.slice(0, cursorIndex + 1), nextCursor]);
                setCursorIndex((current) => current + 1);
                void setTableState({ cursor: nextCursor });
              }}
              onLimitChange={(nextLimit) => {
                resetCursor();
                void setTableState({
                  limit: nextLimit,
                  cursor: null,
                });
              }}
            />
          </CardContent>
        </Card>
      </div>

      <DoctorFormDialog
        doctor={formDoctor}
        open={isFormOpen}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitDoctor}
      />
      <DoctorPatientsDialog
        doctor={patientsDoctor}
        open={Boolean(patientsDoctor)}
        onOpenChange={(open) => {
          if (!open) {
            setPatientsDoctor(undefined);
          }
        }}
      />
    </>
  );
}
