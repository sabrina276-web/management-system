import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { auth } from "@/lib/auth";
import { Redirect } from "wouter";
import { Layout } from "@/components/layout";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Employees from "@/pages/employees";

// Pages
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import PatientsList from "@/pages/patients/index";
import PatientDetail from "@/pages/patients/detail";
import AppointmentsList from "@/pages/appointments/index";
import AppointmentNew from "@/pages/appointments/new";
import BillingList from "@/pages/billing/index";
import BillingNew from "@/pages/billing/new";
import InventoryList from "@/pages/inventory/index";
import InventoryNew from "@/pages/inventory/new";
import EmployeeDetail from "@/pages/employees/detail";

const queryClient = new QueryClient();
function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  if (!auth.isLoggedIn()) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/">
          <ProtectedRoute component={Dashboard} />
        </Route>

        <Route path="/patients">
          <ProtectedRoute component={PatientsList} />
        </Route>

        <Route path="/patients/:id">
          <ProtectedRoute component={PatientDetail} />
        </Route>

        <Route path="/appointments">
          <ProtectedRoute component={AppointmentsList} />
        </Route>

        <Route path="/appointments/new">
          <ProtectedRoute component={AppointmentNew} />
        </Route>
        <Route path="/appointments/:id/edit">
          <ProtectedRoute component={AppointmentNew} />
        </Route>

        <Route path="/billing">
          <ProtectedRoute component={BillingList} />
        </Route>

        <Route path="/billing/new">
          <ProtectedRoute component={BillingNew} />
        </Route>
        <Route path="/billing/:id/edit">
          <ProtectedRoute component={BillingNew} />
        </Route>

        <Route path="/inventory">
          <ProtectedRoute component={InventoryList} />
        </Route>

        <Route path="/inventory/new">
          <ProtectedRoute component={InventoryNew} />
        </Route>
        <Route path="/inventory/:id/edit">
          <ProtectedRoute component={InventoryNew} />
        </Route>
        <Route path="/reports">
          <ProtectedRoute component={Reports} />
        </Route>
        <Route path="/settings">
          <ProtectedRoute component={Settings} />
        </Route>
        <Route path="/employees">
          <ProtectedRoute component={Employees} />
        </Route>
        <Route path="/employees/:id">
          <ProtectedRoute component={EmployeeDetail} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
