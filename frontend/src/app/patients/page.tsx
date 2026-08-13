import { AppShell } from '@/components/layout/app-shell';
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
import { Plus, Search, UsersRound } from 'lucide-react';

export default function PatientsPage() {
  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Patients</h1>
            <p className="text-muted-foreground text-sm">
              Patient roster with care status and visit schedule.
            </p>
          </div>
          <Button className="w-fit gap-2">
            <Plus className="size-4" aria-hidden="true" />
            Add Patient
          </Button>
        </div>

        <Card>
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="size-5" aria-hidden="true" />
              Patient List
            </CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input className="pl-9" placeholder="Search patients" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Visit Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={4}>
                    No patient data available.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
