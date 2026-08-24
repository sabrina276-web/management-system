import { useGetDashboardSummary } from "@workspace/api-client-react";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import {
  Users,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  Banknote,
  Clock,
  UserPlus,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function Reports() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary();
  const clinicName =
    localStorage.getItem("clinicName") || "Radiant Smile Dental Clinic";

  const exportPDF = () => {
    if (!summary) return;
    const clinicLogo = localStorage.getItem("clinicLogo");

    const doc = new jsPDF();

    doc.setFontSize(18);
    if (clinicLogo) {
      doc.addImage(clinicLogo, "JPEG", 20, 10, 25, 25);
    }
    doc.text(clinicName, clinicLogo ? 50 : 20, 20);
    doc.setFontSize(14);
    doc.text("Performance Report", 20, 32);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-KE")}`, 20, 40);

    doc.setFontSize(12);
    doc.text("Clinic Summary", 20, 55);

    doc.text(`Total Patients: ${summary.totalPatients}`, 20, 68);
    doc.text(`Today's Appointments: ${summary.todayAppointments}`, 20, 78);
    doc.text(
      `Appointments This Month: ${summary.totalAppointmentsThisMonth}`,
      20,
      88,
    );
    doc.text(`Total Revenue: ${formatCurrency(summary.totalRevenue)}`, 20, 98);
    doc.text(
      `Outstanding Revenue: ${formatCurrency(summary.outstandingRevenue)}`,
      20,
      108,
    );
    doc.text(`Low Stock Items: ${summary.lowStockCount}`, 20, 118);

    doc.setFontSize(12);
    doc.text("Appointment Status", 20, 138);

    doc.setFontSize(11);
    doc.text(`Scheduled: ${summary.appointmentsByStatus.scheduled}`, 20, 150);
    doc.text(`Confirmed: ${summary.appointmentsByStatus.confirmed}`, 20, 160);
    doc.text(`Completed: ${summary.appointmentsByStatus.completed}`, 20, 170);
    doc.text(`Cancelled: ${summary.appointmentsByStatus.cancelled}`, 20, 180);
    doc.text(`No-show: ${summary.appointmentsByStatus.no_show}`, 20, 190);

    doc.save("RadiantSmile_Performance_Report.pdf");
  };

  const exportCSV = () => {
    if (!summary) return;
    const clinicLogo = localStorage.getItem("clinicLogo");

    const csv = [
      [clinicName],
      ["Performance Report"],
      [`Generated,${new Date().toLocaleDateString("en-KE")}`],
      [],
      ["Metric", "Value"],
      ["Total Patients", summary.totalPatients],
      ["Today's Appointments", summary.todayAppointments],
      ["Appointments This Month", summary.totalAppointmentsThisMonth],
      ["Total Revenue", formatCurrency(summary.totalRevenue)],
      ["Outstanding Revenue", formatCurrency(summary.outstandingRevenue)],
      ["Low Stock Items", summary.lowStockCount],
      [],
      ["Appointment Status", "Count"],
      ["Scheduled", summary.appointmentsByStatus.scheduled],
      ["Confirmed", summary.appointmentsByStatus.confirmed],
      ["Completed", summary.appointmentsByStatus.completed],
      ["Cancelled", summary.appointmentsByStatus.cancelled],
      ["No-show", summary.appointmentsByStatus.no_show],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    saveAs(blob, "RadiantSmile_Performance_Report.csv");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">Failed to load reports.</p>
      </div>
    );
  }

  const appointmentStatusData = [
    {
      status: "Scheduled",
      count: summary.appointmentsByStatus.scheduled,
    },
    {
      status: "Confirmed",
      count: summary.appointmentsByStatus.confirmed,
    },
    {
      status: "Completed",
      count: summary.appointmentsByStatus.completed,
    },
    {
      status: "Cancelled",
      count: summary.appointmentsByStatus.cancelled,
    },
    {
      status: "No-show",
      count: summary.appointmentsByStatus.no_show,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor the performance of your dental clinic.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <FileText className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Button onClick={exportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              Total Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.totalPatients}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarDays className="w-4 h-4" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.todayAppointments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CalendarCheck className="w-4 h-4" />
              Appointments This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {summary.totalAppointmentsThisMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Banknote className="w-4 h-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.totalRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              From paid bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              Outstanding Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCurrency(summary.outstandingRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pending, partial & overdue bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.lowStockCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Items requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>

          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Overview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" />
                <span>Scheduled</span>
              </div>
              <span className="font-semibold">
                {summary.appointmentsByStatus.scheduled}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Confirmed</span>
              </div>
              <span className="font-semibold">
                {summary.appointmentsByStatus.confirmed}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed</span>
              </div>
              <span className="font-semibold">
                {summary.appointmentsByStatus.completed}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Cancelled</span>
              </div>
              <span className="font-semibold">
                {summary.appointmentsByStatus.cancelled}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>No-show</span>
              </div>
              <span className="font-semibold">
                {summary.appointmentsByStatus.no_show}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>

          <CardContent>
            {summary.upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming appointments.
              </p>
            ) : (
              <div className="space-y-3">
                {summary.upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{appointment.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.appointmentDate}{" "}
                        {appointment.appointmentTime}
                      </p>
                    </div>

                    <span className="text-sm capitalize">
                      {appointment.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
          </CardHeader>

          <CardContent>
            {summary.recentPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No patients yet.</p>
            ) : (
              <div className="space-y-3">
                {summary.recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                      <UserPlus className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {patient.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
