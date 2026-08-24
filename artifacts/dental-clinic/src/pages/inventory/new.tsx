import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import {
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useGetInventoryItem,
  getListInventoryItemsQueryKey,
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

const inventorySchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  unit: z.string().min(1, "Unit is required"),
  reorderLevel: z.coerce.number().min(0, "Reorder level must be at least 0"),
  costPerUnit: z.coerce.number().min(0, "Cost cannot be negative"),
  supplier: z.string().optional(),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

export default function InventoryNew() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/inventory/:id/edit");

  const isEditing = !!match;
  const itemId = match ? Number(params.id) : 0;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const { data: item, isLoading: isLoadingItem } =
    useGetInventoryItem(itemId);

  const categories = [
    "Consumables",
    "Tools",
    "Medication",
    "Office",
    "Other",
  ];

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: "",
      category: "Consumables",
      quantity: 0,
      unit: "pieces",
      reorderLevel: 10,
      costPerUnit: 0,
      supplier: "",
    },
  });

  useEffect(() => {
    if (item && isEditing) {
      form.reset({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        reorderLevel: item.reorderLevel,
        costPerUnit: item.costPerUnit,
        supplier: item.supplier ?? "",
      });
    }
  }, [item, isEditing, form]);

  const onSubmit = (values: InventoryFormValues) => {
    if (isEditing) {
      updateItem.mutate(
        {
          id: itemId,
          data: values,
        },
        {
          onSuccess: () => {
            toast({
              title: "Item Updated",
              description:
                "The inventory item has been successfully updated.",
            });

            queryClient.invalidateQueries({
              queryKey: getListInventoryItemsQueryKey(),
            });

            setLocation("/inventory");
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to update inventory item.",
              variant: "destructive",
            });
          },
        },
      );
    } else {
      createItem.mutate(
        { data: values },
        {
          onSuccess: () => {
            toast({
              title: "Item Added",
              description:
                "The inventory item has been successfully added.",
            });

            queryClient.invalidateQueries({
              queryKey: getListInventoryItemsQueryKey(),
            });

            setLocation("/inventory");
          },
          onError: () => {
            toast({
              title: "Error",
              description: "Failed to add inventory item.",
              variant: "destructive",
            });
          },
        },
      );
    }
  };

  if (isEditing && isLoadingItem) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSaving = createItem.isPending || updateItem.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation("/inventory")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isEditing ? "Edit Inventory Item" : "Add Inventory Item"}
          </h1>

          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update the inventory item details."
              : "Register a new supply or material to track."}
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the details below and save your changes."
              : "Fill in the item specifics to start tracking stock levels."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="E.g., Latex Gloves (Size M)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category}
                              value={category}
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="boxes, bottles, pieces..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="costPerUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Per Unit</FormLabel>

                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            KSh
                          </span>

                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            className="pl-12"
                            {...field}
                          />
                        </div>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier (Optional)</FormLabel>

                      <FormControl>
                        <Input
                          {...field}
                          placeholder="MedSupply Co."
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/inventory")}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}

                  {isEditing ? "Update Item" : "Save Item"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
