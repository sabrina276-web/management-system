import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  Package,
  BarChart3,
  Settings,
  Bell,
  Stethoscope,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    href: "/employees",
    label: "Employees",
    icon: UserCog,
  },
];

export function Layout({ children }: LayoutProps) {
  const [location, navigate] = useLocation();
  const [clinicName, setClinicName] = useState(
    () => localStorage.getItem("clinicName") || "Radiant Smile Dental Clinic",
  );

  const [clinicLogo, setClinicLogo] = useState(
    () => localStorage.getItem("clinicLogo") || "",
  );

  useEffect(() => {
    const updateClinicSettings = () => {
      setClinicName(
        localStorage.getItem("clinicName") || "Radiant Smile Dental Clinic",
      );
      setClinicLogo(localStorage.getItem("clinicLogo") || "");
    };

    window.addEventListener("clinicSettingsUpdated", updateClinicSettings);

    return () => {
      window.removeEventListener("clinicSettingsUpdated", updateClinicSettings);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col h-auto md:h-[100dvh] sticky top-0 z-20 shadow-sm md:shadow-none">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary overflow-hidden">
            {clinicLogo ? (
              <img
                src={clinicLogo}
                alt="Clinic logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <Stethoscope size={24} />
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-foreground">
              {clinicName}
            </h1>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Clinic
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 pb-4 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon
                    size={18}
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                  />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-end px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="w-9 h-9 rounded-full bg-accent/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border border-card"></span>
            </button>
            <div className="relative group">
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/30 transition-colors"
                aria-label="Open user menu"
              >
                DR
              </button>

              <div className="absolute right-0 top-11 hidden group-hover:block w-40 rounded-lg border border-border bg-card shadow-lg p-1">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent"
                  onClick={() => {
                    auth.logout();
                    localStorage.removeItem("userRole");
                    navigate("/login");
                  }}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
