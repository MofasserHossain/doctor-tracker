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
import { Plus, Search, Stethoscope } from 'lucide-react';

export default function DoctorsPage() {
  return (
    <AppShell>
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Doctors</h1>
            <p className="text-muted-foreground text-sm">
              Directory of assigned physicians and care teams.
            </p>
          </div>
          <Button className="w-fit gap-2">
            <Plus className="size-4" aria-hidden="true" />
            Add Doctor
          </Button>
        </div>

        <Card>
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="size-5" aria-hidden="true" />
              Doctor List
            </CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input className="pl-9" placeholder="Search doctors" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Patients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={4}>
                    No doctor data available.
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
