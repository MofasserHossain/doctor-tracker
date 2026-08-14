'use client';

import { DoctorCombobox } from '@/components/doctors/doctor-combobox';
import { PatientFormDialog } from '@/components/patients/patient-form-dialog';
import { PaginationControls } from '@/components/shared/pagination-controls';
import { TableSkeletonRows } from '@/components/shared/table-skeleton-rows';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, getPatientDoctor, toTitleCase } from '@/lib/format';
import {
  useCreatePatientMutation,
  useDeletePatientMutation,
  usePatientsQuery,
  useUpdatePatientMutation,
} from '@/lib/services/patients';
import { usePatientTableQueryState } from '@/lib/services/table-query-state';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import type { Patient, PatientCondition, PatientPayload, PatientStatus } from '@/types/domain';
import { patientConditions, patientStatuses } from '@/types/domain';
import { Edit, Plus, Search, Trash2, UsersRound, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type PatientFilters = {
  doctorId: string;
  condition: 'all' | PatientCondition;
  status: 'all' | PatientStatus;
  from: string;
  to: string;
};

const conditionVariant = (condition: PatientCondition) => {
  if (condition === 'critical') {
    return 'destructive';
  }

  if (condition === 'stable') {
    return 'secondary';
  }

  return 'outline';
};

export function PatientManagement() {
  const [tableState, setTableState] = usePatientTableQueryState();
  const [searchInput, setSearchInput] = useState(tableState.search);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [formPatient, setFormPatient] = useState<Patient | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350);
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
    const nextSearch = searchInput.trim() === '' ? '' : debouncedSearch;

    if (tableState.search === nextSearch) {
      return;
    }

    void setTableState({
      search: nextSearch,
      cursor: null,
    });
    resetCursor();
  }, [debouncedSearch, resetCursor, searchInput, setTableState, tableState.search]);

  const patientsQuery = usePatientsQuery({
    limit: tableState.limit,
    cursor: currentCursor,
    search: tableState.search,
    doctorId: tableState.doctorId === 'all' ? undefined : tableState.doctorId,
    condition: tableState.condition === 'all' ? undefined : tableState.condition,
    status: tableState.status === 'all' ? undefined : tableState.status,
    from: tableState.from,
    to: tableState.to,
  });
  const createMutation = useCreatePatientMutation({
    onSuccess: () => {
      setIsFormOpen(false);
      setFormPatient(undefined);
      resetCursor();
    },
  });
  const updateMutation = useUpdatePatientMutation({
    onSuccess: () => {
      setIsFormOpen(false);
      setFormPatient(undefined);
    },
  });
  const deleteMutation = useDeletePatientMutation({
    onSuccess: () => {
      resetCursor();
    },
  });

  const patients = patientsQuery.data?.records ?? [];
  const meta = patientsQuery.data?.meta;
  const hasActiveFilters =
    searchInput.trim() !== '' ||
    tableState.search !== '' ||
    tableState.doctorId !== 'all' ||
    tableState.condition !== 'all' ||
    tableState.status !== 'all' ||
    tableState.from !== '' ||
    tableState.to !== '';

  const updateFilters = (nextFilters: Partial<PatientFilters>) => {
    void setTableState({
      ...nextFilters,
      cursor: null,
    });
    resetCursor();
  };

  const clearFilters = () => {
    setSearchInput('');
    void setTableState({
      search: null,
      doctorId: null,
      condition: null,
      status: null,
      from: null,
      to: null,
      cursor: null,
    });
    resetCursor();
  };

  const openCreateForm = () => {
    setFormPatient(undefined);
    setIsFormOpen(true);
  };

  const handleSubmitPatient = async (payload: PatientPayload) => {
    if (formPatient) {
      const { doctorId: _doctorId, ...updatePayload } = payload;
      await updateMutation.mutateAsync({ id: formPatient._id, payload: updatePayload });
      return;
    }

    await createMutation.mutateAsync(payload);
  };

  return (
    <>
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Patients</h1>
            <p className="text-muted-foreground text-sm">
              Patient roster with care status and visit schedule.
            </p>
          </div>
          <Button className="w-fit gap-2" onClick={openCreateForm}>
            <Plus className="size-4" aria-hidden="true" />
            Add Patient
          </Button>
        </div>

        <Card>
          <CardHeader className="gap-4">
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="size-5" aria-hidden="true" />
              Patient List
            </CardTitle>
            <div
              className={
                hasActiveFilters
                  ? 'grid gap-3 xl:grid-cols-[1.35fr_1fr_0.85fr_0.85fr_auto_auto_auto]'
                  : 'grid gap-3 xl:grid-cols-[1.35fr_1fr_0.85fr_0.85fr_auto_auto]'
              }
            >
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  className="pl-9"
                  placeholder="Search patients"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>
              <DoctorCombobox
                value={tableState.doctorId}
                onValueChange={(value) =>
                  updateFilters({
                    doctorId: value,
                  })
                }
                includeAllOption
                placeholder="Filter by doctor"
              />
              <Select
                value={tableState.condition}
                onValueChange={(value) =>
                  updateFilters({
                    condition: value as PatientFilters['condition'],
                  })
                }
              >
                <SelectTrigger className="w-full" aria-label="Filter by condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All conditions</SelectItem>
                  {patientConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {toTitleCase(condition)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={tableState.status}
                onValueChange={(value) =>
                  updateFilters({
                    status: value as PatientFilters['status'],
                  })
                }
              >
                <SelectTrigger className="w-full" aria-label="Filter by status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {patientStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {toTitleCase(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                aria-label="Visit from"
                type="date"
                value={tableState.from}
                onChange={(event) =>
                  updateFilters({
                    from: event.target.value,
                  })
                }
              />
              <Input
                aria-label="Visit to"
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
                  aria-label="Clear all patient filters"
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
                    <TableHead>Doctor</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visit Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patientsQuery.isLoading ? (
                    <TableSkeletonRows columnCount={7} rows={tableState.limit} />
                  ) : null}
                  {!patientsQuery.isLoading && patients.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-muted-foreground" colSpan={7}>
                        No patient data available.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {patients.map((patient) => {
                    const doctor = getPatientDoctor(patient);

                    return (
                      <TableRow key={patient._id}>
                        <TableCell>
                          <div className="grid gap-1">
                            <span className="font-medium">{patient.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {toTitleCase(patient.gender)}
                              {patient.age !== undefined ? `, ${patient.age}` : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doctor ? (
                            <div className="grid gap-1">
                              <span>{doctor.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {doctor.specialization}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={conditionVariant(patient.condition)}>
                            {toTitleCase(patient.condition)}
                          </Badge>
                        </TableCell>
                        <TableCell>{toTitleCase(patient.status)}</TableCell>
                        <TableCell>{formatDate(patient.visitDate)}</TableCell>
                        <TableCell>
                          <div className="grid gap-1">
                            <span>{patient.phone}</span>
                            {patient.email ? (
                              <span className="text-muted-foreground text-xs">{patient.email}</span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              aria-label={`Edit ${patient.name}`}
                              onClick={() => {
                                setFormPatient(patient);
                                setIsFormOpen(true);
                              }}
                              size="icon-sm"
                              variant="ghost"
                            >
                              <Edit className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              aria-label={`Delete ${patient.name}`}
                              disabled={deleteMutation.isPending}
                              onClick={() => {
                                if (window.confirm(`Delete ${patient.name}?`)) {
                                  deleteMutation.mutate(patient._id);
                                }
                              }}
                              size="icon-sm"
                              variant="destructive"
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      <PatientFormDialog
        patient={formPatient}
        open={isFormOpen}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitPatient}
      />
    </>
  );
}
