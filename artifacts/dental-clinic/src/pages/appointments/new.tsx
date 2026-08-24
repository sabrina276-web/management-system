import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import {
  useCreateAppointment,
  useUpdateAppointment,
  useGetAppointment,
  useListPatients,
  getListAppointmentsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { AppointmentInputType } from "@workspace/api-client-react";

const appointmentSchema = z.object({
  patientId: z.coerce.number().min(1, "Please select a patient"),
  dentistName: z.string().min(1, "Dentist name is required"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM"),
  durationMinutes: z.coerce.number().min(15).max(480),
  type: z.nativeEnum(AppointmentInputType),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export default function AppointmentNew() {
  const [, setLocation] = useLocation();
  const patientIdFromUrl = new URLSearchParams(window.location.search).get(
    "patientId",
  );
  const [match, params] = useRoute("/appointments/:id/edit");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const { data: patients } = useListPatients();

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: patientIdFromUrl ? Number(patientIdFromUrl) : 0,
      dentistName: "",
      appointmentDate: "",
      appointmentTime: "09:00",
      durationMinutes: 30,
      type: "checkup",
      notes: "",
    },
  });
  const { data: appointment } = useGetAppointment(Number(params?.id));
  useEffect(() => {
    if (appointment) {
      form.reset({
        patientId: appointment.patientId,
        dentistName: appointment.dentistName,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        durationMinutes: appointment.durationMinutes,
        type: appointment.type,
        notes: appointment.notes ?? "",
      });
    }
  }, [appointment, form]);

  const onSubmit = (values: AppointmentFormValues) => {
    if (match && appointment) {
      updateAppointment.mutate(
        {
          id: appointment.id,
          data: values,
        },
        {
          onSuccess: () => {
            toast({
              title: "Appointment Updated",
              description: "The appointment has been updated successfully.",
            });

            queryClient.invalidateQueries({
              queryKey: getListAppointmentsQueryKey(),
            });

            setLocation("/appointments");
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update appointment.",
              variant: "destructive",
            });
          },
        },
      );
    } else {
      createAppointment.mutate(
        {
          data: {
            ...values,
            status: "scheduled",
          },
        },
        {
          onSuccess: () => {
            toast({
              title: "Appointment Scheduled",
              description: "The appointment has been successfully created.",
            });

            queryClient.invalidateQueries({
              queryKey: getListAppointmentsQueryKey(),
            });

            setLocation("/appointments");
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to schedule appointment.",
              variant: "destructive",
            });
          },
        },
      );
    }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation("/appointments")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {match ? "Edit Appointment" : "Schedule Appointment"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {match
              ? "Update an existing appointment."
              : "Book a new visit for a patient."}
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>
            All fields are required unless marked optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-patient">
                          <SelectValue placeholder="Select a patient..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.firstName} {p.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time (HH:MM)</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="15" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(AppointmentInputType).map((t) => (
                            <SelectItem
                              key={t}
                              value={t}
                              className="capitalize"
                            >
                              {t.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dentistName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dentist Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Dr. Smith" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Reason for visit or special instructions..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/appointments")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createAppointment.isPending}>
                  {createAppointment.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {match ? "Update Appointment" : "Schedule Appointment"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
