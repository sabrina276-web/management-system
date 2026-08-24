import { useState } from "react";
import { Link } from "wouter";
import { useListBills, BillStatus } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import {
  CreditCard,
  Filter,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

export default function BillingList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: bills, isLoading } = useListBills({
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Billing
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage patient invoices and payments.
          </p>
        </div>
        <Button
          asChild
          className="shadow-sm shadow-primary/20"
          data-testid="button-new-bill"
        >
          <Link href="/billing/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Bill
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending
              </p>
              <h3 className="text-2xl font-bold">
                {bills?.filter((b) => b.status === "pending").length || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-full text-destructive">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Overdue
              </p>
              <h3 className="text-2xl font-bold">
                {bills?.filter((b) => b.status === "overdue").length || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded-full text-secondary">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paid</p>
              <h3 className="text-2xl font-bold">
                {bills?.filter((b) => b.status === "paid").length || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4 border-border/50 flex flex-row items-center gap-4">
          <div className="flex items-center gap-2 max-w-[250px]">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : bills && bills.length > 0 ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="pl-6">Invoice ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow
                    key={bill.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="pl-6 py-4 font-mono text-xs font-medium text-muted-foreground">
                      INV-{bill.id.toString().padStart(5, "0")}
                    </TableCell>
                    <TableCell>
                      <Link href={`/patients/${bill.patientId}`}>
                        <span className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                          {bill.patientName}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          bill.status === "overdue"
                            ? "text-destructive font-medium"
                            : ""
                        }
                      >
                        {format(parseISO(bill.dueDate), "MMM d, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(bill.totalAmount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(bill.totalAmount - bill.amountPaid)}
                    </TableCell>
                    <>
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

                      <TableCell className="text-right pr-6">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/billing/${bill.id}/edit`}>Edit</Link>
                        </Button>
                      </TableCell>
                    </>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-16 text-center text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-xl font-medium text-foreground mb-1">
                No bills found
              </p>
              <p>Change your filters or create a new invoice.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
