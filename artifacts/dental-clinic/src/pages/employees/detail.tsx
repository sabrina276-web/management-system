import { useParams } from "wouter";
import { useListEmployees } from "@workspace/api-client-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function EmployeeDetail() {
  const { id } = useParams();

  const { data: employees = [], isLoading } = useListEmployees();

  if (isLoading) {
    return <div className="p-6">Loading employee...</div>;
  }

  const employee = employees.find(
    (e: any) => String(e.id) === String(id),
  );

  if (!employee) {
    return (
      <div className="p-6">
        Employee not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Employee Profile
        </h1>

        <Button
          onClick={() => history.back()}
        >
          Back
        </Button>
      </div>

      <Card>

        <CardHeader>
          <CardTitle>
            Staff Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <strong>Employee ID:</strong> {employee.id}
          </div>

          <div>
            <strong>Full Name:</strong> {employee.fullName}
          </div>

          <div>
            <strong>Role:</strong> {employee.role}
          </div>

          <div>
            <strong>Email:</strong> {employee.email}
          </div>

          <div>
            <strong>Phone:</strong> {employee.phone}
          </div>

          <div>
            <strong>Status:</strong> {employee.status}
          </div>

          <div>
            <strong>Date Joined:</strong> Coming Soon
          </div>

          <div>
            <strong>Notes:</strong> —
          </div>

        </CardContent>

      </Card>

    </div>
  );
}