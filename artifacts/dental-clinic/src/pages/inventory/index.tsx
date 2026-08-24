import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  useListInventoryItems,
  useDeleteInventoryItem,
  useUpdateInventoryItem,
  getListInventoryItemsQueryKey,
} from "@workspace/api-client-react";
import {
  Package,
  Plus,
  AlertTriangle,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InventoryList() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [restockItem, setRestockItem] = useState<
    NonNullable<typeof inventory>[number] | null
  >(null);

  const [restockQuantity, setRestockQuantity] = useState<number>(0);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteInventory = useDeleteInventoryItem();
  const updateInventory = useUpdateInventoryItem();

  const { data: inventory, isLoading } = useListInventoryItems({
    category: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const categories = [
    "Consumables",
    "Tools",
    "Medication",
    "Office",
    "Other",
  ];

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this inventory item?")) {
      return;
    }

    deleteInventory.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Item Deleted",
            description:
              "The inventory item has been deleted successfully.",
          });

          queryClient.invalidateQueries({
            queryKey: getListInventoryItemsQueryKey(),
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete inventory item.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const openRestockDialog = (item: NonNullable<typeof restockItem>) => {
    setRestockItem(item);
    setRestockQuantity(0);
  };

  const closeRestockDialog = () => {
    if (updateInventory.isPending) {
      return;
    }

    setRestockItem(null);
    setRestockQuantity(0);
  };

  const handleRestock = () => {
    if (!restockItem || restockQuantity <= 0) {
      return;
    }

    const newQuantity = restockItem.quantity + restockQuantity;

    updateInventory.mutate(
      {
        id: restockItem.id,
        data: {
          quantity: newQuantity,
          lastRestockedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Stock Restocked",
            description: `${restockItem.name} has been restocked successfully.`,
          });

          queryClient.invalidateQueries({
            queryKey: getListInventoryItemsQueryKey(),
          });

          closeRestockDialog();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to restock inventory item.",
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
            Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage clinic supplies and materials.
          </p>
        </div>

        <Button
          asChild
          className="shadow-sm shadow-primary/20"
          data-testid="button-new-item"
        >
          <Link href="/inventory/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4 border-border/50 flex flex-row items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Filter className="w-4 h-4 text-muted-foreground" />

            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>

                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : inventory && inventory.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-6">Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">
                    Stock Level
                  </TableHead>
                  <TableHead className="text-right">
                    Unit Cost
                  </TableHead>
                  <TableHead>Last Restocked</TableHead>
                  <TableHead className="text-right pr-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {inventory.map((item) => {
                  const isLowStock =
                    item.quantity <= item.reorderLevel;

                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="pl-6 py-4 font-semibold text-foreground">
                        {item.name}

                        {isLowStock && (
                          <div className="flex items-center gap-1 text-xs font-medium text-destructive mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            Low stock alert
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="font-normal"
                        >
                          {item.category}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`text-lg font-bold ${
                              isLowStock
                                ? "text-destructive"
                                : ""
                            }`}
                          >
                            {item.quantity}
                          </span>

                          <span className="text-muted-foreground text-xs uppercase">
                            {item.unit}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right text-muted-foreground">
                        KSh {item.costPerUnit.toFixed(2)}
                      </TableCell>

                      <TableCell className="text-muted-foreground text-sm">
                        {item.lastRestockedAt
                          ? new Date(
                              item.lastRestockedAt,
                            ).toLocaleDateString("en-KE", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Never"}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRestockDialog(item)}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            Restock
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={`/inventory/${item.id}/edit`}
                            >
                              Edit
                            </Link>
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-16 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />

              <p className="text-xl font-medium text-foreground mb-1">
                No items found
              </p>

              <p>
                Add items to your inventory to start tracking them.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!restockItem}
        onOpenChange={(open) => {
          if (!open) {
            closeRestockDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restock Inventory</DialogTitle>

            <DialogDescription>
              Add new stock to{" "}
              <strong>{restockItem?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {restockItem && (
            <div className="space-y-5 py-2">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Current stock
                  </span>

                  <span className="font-semibold">
                    {restockItem.quantity}{" "}
                    {restockItem.unit}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Reorder level
                  </span>

                  <span className="font-semibold">
                    {restockItem.reorderLevel}{" "}
                    {restockItem.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="restock-quantity"
                  className="text-sm font-medium"
                >
                  Quantity to Add
                </label>

                <Input
                  id="restock-quantity"
                  type="number"
                  min="1"
                  value={restockQuantity || ""}
                  onChange={(event) =>
                    setRestockQuantity(
                      Number(event.target.value),
                    )
                  }
                  placeholder="Enter quantity"
                  autoFocus
                />
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    New stock level
                  </span>

                  <span className="text-xl font-bold text-primary">
                    {restockItem.quantity +
                      Math.max(0, restockQuantity)}{" "}
                    {restockItem.unit}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeRestockDialog}
              disabled={updateInventory.isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleRestock}
              disabled={
                updateInventory.isPending ||
                !restockItem ||
                restockQuantity <= 0
              }
            >
              {updateInventory.isPending && (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              )}

              Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
