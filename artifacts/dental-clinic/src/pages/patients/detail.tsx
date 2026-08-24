import { formatCurrency } from "@/lib/utils";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import {
  useGetPatient,
  useListPatientAppointments,
  useListPatientBills,
  getGetPatientQueryKey,
  getListPatientAppointmentsQueryKey,
  getListPatientBillsQueryKey,
} from "@workspace/api-client-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Activity,
  Shield,
  Clock,
  Pencil,
  Plus,
  CreditCard,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PatientDetail() {
  const params = useParams();
  const patientId = params.id ? parseInt(params.id) : 0;

  const { data: patient, isLoading: isLoadingPatient } = useGetPatient(
    patientId,
    {
      query: {
        enabled: !!patientId,
        queryKey: getGetPatientQueryKey(patientId),
      },
    },
  );

  const { data: appointments, isLoading: isLoadingAppointments } =
    useListPatientAppointments(patientId, {
      query: {
        enabled: !!patientId,
        queryKey: getListPatientAppointmentsQueryKey(patientId),
      },
    });

  const { data: bills, isLoading: isLoadingBills } = useListPatientBills(
    patientId,
    {
      query: {
        enabled: !!patientId,
        queryKey: getListPatientBillsQueryKey(patientId),
      },
    },
  );

  if (isLoadingPatient) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-destructive">Patient not found</div>
    );
  }

  const age = Math.floor(
    (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
      3.15576e10,
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Profile Header */}
        <div className="flex items-center gap-6 flex-1">
          <div className="w-24 h-24 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold text-3xl shadow-sm border border-secondary/20">
            {patient.firstName[0]}
            {patient.lastName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />{" "}
                {format(parseISO(patient.dateOfBirth), "MMM d, yyyy")} ({age}{" "}
                y/o)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4" /> {patient.phone}
              </span>
              {patient.email && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" /> {patient.email}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/patients/${patient.id}/edit`}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Patient
            </Link>
          </Button>

          <Button asChild>
            <Link href={`/appointments/new?patientId=${patient.id}`}>
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Link>
          </Button>

          <Button asChild variant="secondary">
            <Link href={`/billing/new?patientId=${patient.id}`}>
              <CreditCard className="w-4 h-4 mr-2" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-grid mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="bills">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Personal
                  Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-muted-foreground font-medium">
                    Address
                  </div>
                  <div className="col-span-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    {patient.address || (
                      <span className="text-muted-foreground italic">
                        Not provided
                      </span>
                    )}
                  </div>

                  <div className="text-muted-foreground font-medium">Email</div>
                  <div className="col-span-2">
                    {patient.email || (
                      <span className="text-muted-foreground italic">
                        Not provided
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Insurance Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-muted-foreground font-medium">
                    Provider
                  </div>
                  <div className="col-span-2 font-medium">
                    {patient.insuranceProvider || (
                      <span className="text-muted-foreground italic font-normal">
                        None
                      </span>
                    )}
                  </div>

                  <div className="text-muted-foreground font-medium">
                    Policy No.
                  </div>
                  <div className="col-span-2 font-mono bg-muted px-2 py-0.5 rounded text-xs inline-block w-fit">
                    {patient.insuranceNumber || "N/A"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-sm">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Clinical Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {patient.notes ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {patient.notes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No clinical notes recorded.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4 border-border/50">
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>Past and upcoming visits</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAppointments ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : appointments && appointments.length > 0 ? (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="pl-6">Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Dentist</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="pl-6 py-4">
                          <div className="font-medium text-foreground">
                            {format(
                              parseISO(apt.appointmentDate),
                              "MMM d, yyyy",
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {apt.appointmentTime}{" "}
                            ({apt.durationMinutes}m)
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {apt.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{apt.dentistName}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-foreground">
                    No appointments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills">
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4 border-border/50">
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Invoices and payments</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingBills ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : bills && bills.length > 0 ? (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="pl-6">Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="pl-6 py-4 font-medium">
                          {format(parseISO(bill.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatCurrency(bill.totalAmount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatCurrency(bill.amountPaid)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              bill.status === "paid"
                                ? "border-primary text-primary bg-primary/5"
                                : bill.status === "partial"
                                  ? "border-secondary text-secondary bg-secondary/5"
                                  : bill.status === "overdue"
                                    ? "border-destructive text-destructive bg-destructive/5"
                                    : "border-muted-foreground text-muted-foreground"
                            }
                          >
                            {bill.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium text-foreground">
                    No billing records
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
