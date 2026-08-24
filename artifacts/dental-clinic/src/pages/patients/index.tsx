import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useListPatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
  getListPatientsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Loader2,
  User,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  address: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function PatientsList() {
  const [search, setSearch] = useState("");
  const { data: patients, isLoading } = useListPatients({
    search: search || undefined,
  });
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: format(new Date(1990, 0, 1), "yyyy-MM-dd"),
      address: "",
      insuranceProvider: "",
      insuranceNumber: "",
      notes: "",
    },
  });

  const onSubmit = (values: PatientFormValues) => {
    if (editingPatient) {
      updatePatient.mutate(
        {
          id: editingPatient.id,
          data: values,
        },
        {
          onSuccess: () => {
            toast({
              title: "Patient updated",
              description: "Patient updated successfully.",
            });

            queryClient.invalidateQueries({
              queryKey: getListPatientsQueryKey(),
            });

            setEditingPatient(null);
            setIsNewDialogOpen(false);
            form.reset();
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update patient.",
              variant: "destructive",
            });
          },
        },
      );
    } else {
      createPatient.mutate(
        { data: values },
        {
          onSuccess: (newPatient) => {
            toast({
              title: "Patient created",
              description: "Successfully added new patient record.",
            });

            queryClient.invalidateQueries({
              queryKey: getListPatientsQueryKey(),
            });

            setIsNewDialogOpen(false);
            form.reset();
            setLocation(`/patients/${newPatient.id}`);
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to create patient.",
              variant: "destructive",
            });
          },
        },
      );
    }
  };
  const startEdit = (patient: any) => {
    setEditingPatient(patient);

    form.reset({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email ?? "",
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address ?? "",
      insuranceProvider: patient.insuranceProvider ?? "",
      insuranceNumber: patient.insuranceNumber ?? "",
      notes: patient.notes ?? "",
    });

    setIsNewDialogOpen(true);
  };
  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) {
      return;
    }

    deletePatient.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Patient deleted",
            description: "Patient deleted successfully.",
          });

          queryClient.invalidateQueries({
            queryKey: getListPatientsQueryKey(),
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete patient.",
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
            Patients
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage patient records and histories.
          </p>
        </div>

        <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="shadow-sm shadow-primary/20"
              data-testid="button-add-patient"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? "Edit Patient" : "Add New Patient"}
              </DialogTitle>
              <DialogDescription>
                {editingPatient
                  ? "Update the patient's information."
                  : "Create a new patient record. Fill in all required fields."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 pt-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-firstname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-lastname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth (YYYY-MM-DD)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-dob" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insuranceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Provider</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            data-testid="input-insurance-provider"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="insuranceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            data-testid="input-insurance-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPatient.isPending}
                    data-testid="button-submit-patient"
                  >
                    {createPatient.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingPatient ? "Update Patient" : "Save Patient"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4 border-border/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-patients"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : patients && patients.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold pl-6">Name</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Date of Birth</TableHead>
                  <TableHead className="font-semibold text-right pr-6">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow
                    key={patient.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-sm">
                          {patient.firstName[0]}
                          {patient.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {patient.firstName} {patient.lastName}
                          </div>
                          {patient.insuranceProvider && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {patient.insuranceProvider}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{patient.phone}</span>
                        </div>
                        {patient.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{patient.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>
                          {format(parseISO(patient.dateOfBirth), "MMM d, yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(patient)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(patient.id)}
                        >
                          Delete
                        </Button>

                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-patient-${patient.id}`}
                        >
                          <Link href={`/patients/${patient.id}`}>View</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <User className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground">
                No patients found
              </p>
              <p className="mt-1">
                Try adjusting your search or add a new patient.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
