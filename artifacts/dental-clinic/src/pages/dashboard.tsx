import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Users, CalendarDays, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading, isError } = useGetDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="shadow-sm shadow-primary/20" data-testid="button-new-appointment">
            <Link href="/appointments/new">New Appointment</Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Patients</CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Active patient records</p>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Appointments</CardTitle>
            <CalendarDays className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.todayAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">{summary.appointmentsByStatus.completed} completed so far</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(summary.outstandingRevenue)} outstanding</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate transition-shadow border-destructive/20 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Low Stock Alerts</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{summary.lowStockCount}</div>
            <Link href="/inventory" className="text-xs text-destructive hover:underline mt-1 inline-block">
              Review inventory
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4 border-border/50">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Next 5 scheduled visits</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" data-testid="link-view-all-appointments">
              <Link href="/appointments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {summary.upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CalendarDays className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No upcoming appointments</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {summary.upcomingAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-xl flex flex-col items-center justify-center min-w-16">
                        <span className="text-xs font-semibold uppercase">{format(parseISO(apt.appointmentDate), 'MMM')}</span>
                        <span className="text-xl font-bold leading-none">{format(parseISO(apt.appointmentDate), 'd')}</span>
                      </div>
                      <div>
                        <Link href={`/patients/${apt.patientId}`}>
                          <h4 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">{apt.patientName}</h4>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{apt.appointmentTime} ({apt.durationMinutes}m)</span>
                          <span>•</span>
                          <span>{apt.dentistName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="capitalize bg-secondary/10 text-secondary hover:bg-secondary/20">
                        {apt.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={
                        apt.status === 'confirmed' ? 'border-primary text-primary' : 
                        apt.status === 'scheduled' ? 'border-muted-foreground text-muted-foreground' : ''
                      }>
                        {apt.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4 border-border/50">
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Recently added records</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             {summary.recentPatients.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No recent patients</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {summary.recentPatients.slice(0, 5).map((patient) => (
                  <Link key={patient.id} href={`/patients/${patient.id}`}>
                    <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div>
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{patient.firstName} {patient.lastName}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{patient.phone}</p>
                      </div>
                      <Badge variant="outline" className="font-normal text-xs text-muted-foreground">New</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
