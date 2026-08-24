import { useLocation, useRoute } from "wouter";
import { useEffect } from "react";
import {
  useCreateBill,
  useUpdateBill,
  useGetBill,
  useListPatients,
  getListBillsQueryKey,
  BillInputStatus,
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
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(1),
  unitPrice: z.coerce.number().min(0),
});

const billSchema = z.object({
  patientId: z.coerce.number().min(1, "Please select a patient"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  status: z.nativeEnum(BillInputStatus),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
  amountPaid: z.coerce.number().min(0).default(0),
});

type BillFormValues = z.infer<typeof billSchema>;

export default function BillingNew() {
  const [, setLocation] = useLocation();
  const patientIdFromUrl = new URLSearchParams(window.location.search).get(
    "patientId",
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createBill = useCreateBill();
  const updateBill = useUpdateBill();

  const [match, params] = useRoute("/billing/:id/edit");

  const billId = match ? Number(params.id) : 0;

  const { data: bill } = useGetBill(billId);
  const isEditing = !!match;

  const { data: patients } = useListPatients();

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      patientId: patientIdFromUrl ? Number(patientIdFromUrl) : 0,
      dueDate: format(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd",
      ),
      status: "pending",
      notes: "",
      amountPaid: 0,
      items: [
        { description: "General Consultation", quantity: 1, unitPrice: 150 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  useEffect(() => {
    if (bill && isEditing) {
      form.reset({
        patientId: bill.patientId,
        dueDate: bill.dueDate,
        status: bill.status,
        notes: bill.notes ?? "",
        amountPaid: bill.amountPaid,
        items: bill.items,
      });
    }
  }, [bill, isEditing, form]);

  const watchItems = form.watch("items");
  const totalAmount = watchItems.reduce(
    (acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0),
    0,
  );

  const onSubmit = (values: BillFormValues) => {
    // Determine status based on amountPaid vs totalAmount
    let status = values.status;
    if (values.amountPaid >= totalAmount && totalAmount > 0) {
      status = "paid";
    } else if (values.amountPaid > 0) {
      status = "partial";
    }

    if (isEditing) {
      updateBill.mutate(
        {
          id: billId,
          data: { ...values, totalAmount, status },
        },
        {
          onSuccess: () => {
            toast({
              title: "Invoice Updated",
              description: "The invoice has been successfully updated.",
            });
            queryClient.invalidateQueries({
              queryKey: getListBillsQueryKey(),
            });
            setLocation("/billing");
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update invoice.",
              variant: "destructive",
            });
          },
        },
      );
    } else {
      createBill.mutate(
        {
          data: { ...values, totalAmount, status },
        },
        {
          onSuccess: () => {
            toast({
              title: "Invoice Created",
              description: "The bill has been successfully generated.",
            });
            queryClient.invalidateQueries({
              queryKey: getListBillsQueryKey(),
            });
            setLocation("/billing");
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to create invoice.",
              variant: "destructive",
            });
          },
        },
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation("/billing")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditing ? "Edit Invoice" : "Create Invoice"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update an existing patient invoice."
              : "Generate a new bill for a patient."}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
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
                          <SelectTrigger>
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

                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
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
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="partial">Partial</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Thank you for your business."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>KSh {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-border/50">
                    <span>Total</span>
                    <span>KSh {totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid Already</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            KSh
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-14"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between font-bold text-primary pt-3 border-t border-border/50">
                  <span>Balance Due</span>
                  <span>
                    KSh{" "}
                    {Math.max(
                      0,
                      totalAmount - (form.watch("amountPaid") || 0),
                    ).toFixed(2)}
                  </span>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createBill.isPending}
                >
                  {createBill.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Save Invoice
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ description: "", quantity: 1, unitPrice: 0 })
                }
              >
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground px-2">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-3">Unit Price</div>
                  <div className="col-span-1"></div>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-12 gap-4 items-start"
                  >
                    <div className="col-span-6">
                      <FormField
                        control={form.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Service description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-3">
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                  KSh
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="pl-14"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 pt-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
