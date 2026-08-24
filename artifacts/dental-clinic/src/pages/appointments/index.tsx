import { useState } from "react";
import { Link } from "wouter";
import {
  useListAppointments,
  useDeleteAppointment,
  getListAppointmentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  CalendarDays,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  UserSquare2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function AppointmentsList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const deleteAppointment = useDeleteAppointment();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: appointments, isLoading } = useListAppointments({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    date: dateFilter || undefined,
  });
  const filteredAppointments =
    appointments?.filter(
      (apt) =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.dentistName.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];
  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    deleteAppointment.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Appointment deleted",
            description: "The appointment was deleted successfully.",
          });

          queryClient.invalidateQueries({
            queryKey: getListAppointmentsQueryKey(),
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete appointment.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the clinic's schedule.
          </p>
        </div>
        <Button
          asChild
          className="shadow-sm shadow-primary/20"
          data-testid="button-new-appointment"
        >
          <Link href="/appointments/new">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4 border-border/50 flex flex-row items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[180px]"
            />
            {dateFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDateFilter("")}
                className="px-2"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[250px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient or dentist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredAppointments.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-6 w-[200px]">Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => (
                  <TableRow
                    key={apt.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-lg flex flex-col items-center justify-center min-w-14">
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {format(parseISO(apt.appointmentDate), "MMM")}
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {format(parseISO(apt.appointmentDate), "d")}
                          </span>
                        </div>
                        <div className="pt-1">
                          <div className="font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />{" "}
                            {apt.appointmentTime}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {apt.durationMinutes} min
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/patients/${apt.patientId}`}>
                        <div className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          {apt.patientName}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <UserSquare2 className="w-4 h-4 text-muted-foreground" />
                        {apt.dentistName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="capitalize text-xs font-medium"
                      >
                        {apt.type.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          apt.status === "completed"
                            ? "border-primary text-primary"
                            : apt.status === "confirmed"
                              ? "border-secondary text-secondary"
                              : apt.status === "scheduled"
                                ? "border-muted-foreground text-muted-foreground"
                                : "border-destructive text-destructive"
                        }
                      >
                        {apt.status.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/appointments/${apt.id}/edit`}>
                            Edit
                          </Link>
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(apt.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-16 text-center text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium text-foreground mb-1">
                No appointments found
              </p>
              <p>Change your filters or schedule a new appointment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
