'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoctorComboboxQuery } from '@/lib/services/doctors';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { cn } from '@/lib/utils';
import type { Doctor } from '@/types/domain';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type DoctorComboboxProps = {
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  id?: string;
  value?: string;
  onValueChange: (value: string) => void;
  includeAllOption?: boolean;
  allValue?: string;
  allLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DoctorCombobox({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  id,
  value,
  onValueChange,
  includeAllOption = false,
  allValue = 'all',
  allLabel = 'All doctors',
  placeholder = 'Select doctor',
  searchPlaceholder = 'Search doctors',
  disabled = false,
  className,
}: DoctorComboboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | undefined>();
  const debouncedSearch = useDebouncedValue(search.trim(), 250);
  const doctorsQuery = useDoctorComboboxQuery(debouncedSearch, open);
  const doctors = useMemo(() => doctorsQuery.data?.records ?? [], [doctorsQuery.data?.records]);
  const selectedLabel =
    includeAllOption && value === allValue ? allLabel : (selectedDoctor?.name ?? placeholder);

  useEffect(() => {
    if (!open) {
      return;
    }

    searchInputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const matchingDoctor = doctors.find((doctor) => doctor._id === value);

    if (matchingDoctor) {
      setSelectedDoctor(matchingDoctor);
    }
  }, [doctors, value]);

  useEffect(() => {
    if (!value || value === allValue) {
      setSelectedDoctor(undefined);
    }
  }, [allValue, value]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const selectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    onValueChange(doctor._id);
    setOpen(false);
    setSearch('');
  };

  const selectAllDoctors = () => {
    setSelectedDoctor(undefined);
    onValueChange(allValue);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <Button
        id={id}
        type="button"
        variant="outline"
        className={cn(
          'w-full justify-between font-normal',
          !selectedDoctor && value !== allValue && 'text-muted-foreground',
        )}
        aria-describedby={ariaDescribedBy}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={ariaInvalid}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronsUpDown className="text-muted-foreground size-4" aria-hidden="true" />
      </Button>

      {open ? (
        <div
          className="bg-popover text-popover-foreground ring-foreground/10 absolute z-50 mt-1 w-full rounded-lg border shadow-md ring-1"
          role="listbox"
        >
          <div className="border-b p-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
              <Input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 pl-8"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {includeAllOption ? (
              <button
                type="button"
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm"
                onClick={selectAllDoctors}
                role="option"
                aria-selected={value === allValue}
              >
                <Check
                  className={cn('size-4', value === allValue ? 'opacity-100' : 'opacity-0')}
                  aria-hidden="true"
                />
                <span>{allLabel}</span>
              </button>
            ) : null}

            {doctorsQuery.isLoading ? (
              <div className="grid gap-2 px-2 py-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={`doctor-option-skeleton-${index.toString()}`} className="grid gap-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-52 max-w-full" />
                  </div>
                ))}
              </div>
            ) : null}

            {doctorsQuery.isError ? (
              <div className="text-destructive px-2 py-3 text-sm">Could not load doctors.</div>
            ) : null}

            {!doctorsQuery.isLoading && !doctorsQuery.isError && doctors.length === 0 ? (
              <div className="text-muted-foreground px-2 py-3 text-sm">No doctors found.</div>
            ) : null}

            {doctors.map((doctor) => (
              <button
                key={doctor._id}
                type="button"
                className="hover:bg-accent hover:text-accent-foreground flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm"
                onClick={() => selectDoctor(doctor)}
                role="option"
                aria-selected={value === doctor._id}
              >
                <Check
                  className={cn(
                    'mt-0.5 size-4',
                    value === doctor._id ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden="true"
                />
                <span className="grid min-w-0 gap-0.5">
                  <span className="truncate">{doctor.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {doctor.specialization} - {doctor.hospital}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
