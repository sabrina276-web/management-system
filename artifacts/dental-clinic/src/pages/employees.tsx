import { useState } from "react";
import { Link } from "wouter";
import {
  useListEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  getListEmployeesQueryKey,
} from "@workspace/api-client-react";

import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Employees() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees = [], isLoading } = useListEmployees();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  if (isLoading) {
    return <div className="p-6">Loading employees...</div>;
  }

  const resetForm = () => {
    setEditingEmployee(null);
    setName("");
    setEmail("");
    setPhone("");
    setRole("");
    setShowForm(false);
  };

  const filteredEmployees = employees.filter((employee: any) => {
    const matchesSearch =
      employee.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(search.toLowerCase()) ||
      employee.phone?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "All" || employee.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const saveEmployee = () => {
    if (!name || !email || !phone || !role) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });

      return;
    }
    
    if (editingEmployee) {
      updateEmployee.mutate(
        {
          id: editingEmployee.id,
          data: {
            fullName: name,
            email,
            phone,
            role,
            status: "Active",
          },
        },
        {
          onSuccess: () => {
            toast({
              title: "Employee updated",
              description: "Employee updated successfully.",
            });

            queryClient.invalidateQueries({
              queryKey: getListEmployeesQueryKey(),
            });

            resetForm();
          },

          onError: (error) => {

            toast({
              title: "Error",
              description: "Failed to update employee.",
              variant: "destructive",
            });
          },
        },
      );

      return;
    }
  
    createEmployee.mutate(
      {
        data: {
          fullName: name,
          email,
          phone,
          role,
          status: "Active",
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Employee added",
            description: "Employee created successfully.",
          });

          queryClient.invalidateQueries({
            queryKey: getListEmployeesQueryKey(),
          });

          resetForm();
        },

        onError: (error) => {

          toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to create employee.",
            variant: "destructive",
          });
        },
      },
    ); 
  };
  const startEdit = (employee: any) => {
    setEditingEmployee(employee);
    setName(employee.fullName);
    setEmail(employee.email);
    setPhone(employee.phone);
    setRole(employee.role);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this employee?")) return;

    deleteEmployee.mutate(
      { id },
      {
        onSuccess: () => {
          toast({
            title: "Employee deleted",
            description: "Employee removed successfully.",
          });

          queryClient.invalidateQueries({
            queryKey: getListEmployeesQueryKey(),
          });
        },
      },
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>

          <p className="text-muted-foreground">
            Manage clinic staff and their roles.
          </p>
        </div>

        <Button
          onClick={() => {
            if (!showForm) {
              setEditingEmployee(null);
              setName("");
              setEmail("");
              setPhone("");
              setRole("");
            }

            setShowForm(!showForm);
          }}
        >
          {showForm ? "Close" : "Add Employee"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEmployee ? "Edit Employee" : "New Employee"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <Label>Role</Label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Dentist, Receptionist, Assistant..."
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveEmployee}>
                {editingEmployee ? "Update Employee" : "Save Employee"}
              </Button>

              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Employees List</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border rounded-md px-3 py-2 bg-background"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Dentist">Dentist</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Assistant">Assistant</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-muted-foreground"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee: any) => (
                    <tr key={employee.id} className="border-b">
                      <td className="p-3">
                        <Link href={`/employees/${employee.id}`}>
                          <span className="cursor-pointer text-blue-600 hover:underline">
                            {employee.fullName}
                          </span>
                        </Link>
                      </td>
                      <td className="p-3">{employee.role}</td>
                      <td className="p-3">{employee.email}</td>
                      <td className="p-3">{employee.phone}</td>
                      <td className="p-3">
                        <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-700">
                          {employee.status}
                        </span>
                      </td>

                      <td className="p-3 space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(employee)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(employee.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
