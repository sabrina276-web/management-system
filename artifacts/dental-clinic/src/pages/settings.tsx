import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  Building2,
  Clock3,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  KeyRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { toast } = useToast();
  const [clinicName, setClinicName] = useState("");
  const [clinicLogo, setClinicLogo] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("KES");
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("17:00");
  const [appointmentDuration, setAppointmentDuration] = useState("30");
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [newAppointmentNotifications, setNewAppointmentNotifications] =
    useState(true);
  const [billingNotifications, setBillingNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");

  const [dentistEmail, setDentistEmail] = useState("");
  const [dentistNewPassword, setDentistNewPassword] = useState("");
  const [dentistConfirmPassword, setDentistConfirmPassword] = useState("");

  const [receptionistEmail, setReceptionistEmail] = useState("");
  const [receptionistNewPassword, setReceptionistNewPassword] = useState("");
  const [receptionistConfirmPassword, setReceptionistConfirmPassword] =
    useState("");
  const [selectedCredentialRole, setSelectedCredentialRole] = useState<
    "admin" | "dentist" | "receptionist" | null
  >(null);

  const [currentCredentialPassword, setCurrentCredentialPassword] =
    useState("");

  const [credentialNewEmail, setCredentialNewEmail] = useState("");
  const [credentialNewPassword, setCredentialNewPassword] = useState("");
  const [credentialConfirmPassword, setCredentialConfirmPassword] =
    useState("");

  useEffect(() => {
    setClinicName(
      localStorage.getItem("clinicName") || "Radiant Smile Dental Clinic",
    );
    setClinicLogo(localStorage.getItem("clinicLogo") || "");
    setPhone(localStorage.getItem("clinicPhone") || "+254 700 123 456");
    setEmail(localStorage.getItem("clinicEmail") || "info@radiantsmile.com");
    setWebsite(localStorage.getItem("clinicWebsite") || "www.radiantsmile.com");
    setAddress(localStorage.getItem("clinicAddress") || "Nanyuki, Kenya");
    setCurrency(localStorage.getItem("clinicCurrency") || "KES");
    setTimezone(localStorage.getItem("clinicTimezone") || "Africa/Nairobi");
    setOpeningTime(localStorage.getItem("clinicOpeningTime") || "08:00");
    setClosingTime(localStorage.getItem("clinicClosingTime") || "17:00");
    setAppointmentReminders(
      localStorage.getItem("appointmentReminders") !== "false",
    );
    setNewAppointmentNotifications(
      localStorage.getItem("newAppointmentNotifications") !== "false",
    );
    setBillingNotifications(
      localStorage.getItem("billingNotifications") !== "false",
    );
    setLowStockAlerts(localStorage.getItem("lowStockAlerts") !== "false");
    setAppointmentDuration(localStorage.getItem("appointmentDuration") || "30");
    const storedCredentials = localStorage.getItem("clinicUserCredentials");
    const credentials = storedCredentials
      ? JSON.parse(storedCredentials)
      : {
          admin: {
            email: "admin@radiantsmile.com",
            password: "Admin@123",
          },

          dentist: {
            email: "dentist@radiantsmile.com",
            password: "Dentist@123",
          },

          receptionist: {
            email: "receptionist@radiantsmile.com",
            password: "Receptionist@123",
          },
        };

    setAdminEmail(credentials.admin.email);
    setDentistEmail(credentials.dentist.email);
    setReceptionistEmail(credentials.receptionist.email);

    localStorage.setItem("clinicUserCredentials", JSON.stringify(credentials));
  }, []);

  const saveSettings = () => {
    const storedCredentials = localStorage.getItem("clinicUserCredentials");

    const credentials = storedCredentials
      ? JSON.parse(storedCredentials)
      : {
          admin: {
            email: "admin@radiantsmile.com",
            password: "Admin@123",
          },
          dentist: {
            email: "dentist@radiantsmile.com",
            password: "Dentist@123",
          },
          receptionist: {
            email: "receptionist@radiantsmile.com",
            password: "Receptionist@123",
          },
        };

    if (selectedCredentialRole) {
      const selectedUser = credentials[selectedCredentialRole];

      if (!currentCredentialPassword) {
        toast({
          title: "Current Password Required",
          description: "Enter your current password before making changes.",
          variant: "destructive",
        });
        return;
      }

      if (currentCredentialPassword !== selectedUser.password) {
        toast({
          title: "Incorrect Password",
          description: "The current password you entered is incorrect.",
          variant: "destructive",
        });
        return;
      }

      if (!credentialNewEmail && !credentialNewPassword) {
        toast({
          title: "No Changes",
          description: "Enter a new email or password to make a change.",
          variant: "destructive",
        });
        return;
      }

      if (
        credentialNewPassword &&
        credentialNewPassword !== credentialConfirmPassword
      ) {
        toast({
          title: "Password Mismatch",
          description: "The new password and confirmation do not match.",
          variant: "destructive",
        });
        return;
      }

      if (credentialNewEmail) {
        selectedUser.email = credentialNewEmail;
      }

      if (credentialNewPassword) {
        selectedUser.password = credentialNewPassword;
      }

      localStorage.setItem(
        "clinicUserCredentials",
        JSON.stringify(credentials),
      );

      setAdminEmail(credentials.admin.email);
      setDentistEmail(credentials.dentist.email);
      setReceptionistEmail(credentials.receptionist.email);

      setCurrentCredentialPassword("");
      setCredentialNewEmail("");
      setCredentialNewPassword("");
      setCredentialConfirmPassword("");
      setSelectedCredentialRole(null);

      toast({
        title: "Credentials Updated",
        description: "The login credentials have been updated successfully.",
      });

      return;
    }

    localStorage.setItem("clinicName", clinicName);
    localStorage.setItem("clinicLogo", clinicLogo);
    localStorage.setItem("clinicPhone", phone);
    localStorage.setItem("clinicEmail", email);
    localStorage.setItem("clinicWebsite", website);
    localStorage.setItem("clinicAddress", address);
    localStorage.setItem("clinicCurrency", currency);
    localStorage.setItem("appointmentReminders", String(appointmentReminders));
    localStorage.setItem(
      "newAppointmentNotifications",
      String(newAppointmentNotifications),
    );
    localStorage.setItem("billingNotifications", String(billingNotifications));
    localStorage.setItem("lowStockAlerts", String(lowStockAlerts));
    localStorage.setItem("clinicTimezone", timezone);
    localStorage.setItem("clinicOpeningTime", openingTime);
    localStorage.setItem("clinicClosingTime", closingTime);
    localStorage.setItem("appointmentDuration", appointmentDuration);

    window.dispatchEvent(new Event("clinicSettingsUpdated"));

    toast({
      title: "Settings Saved",
      description: "Clinic settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clinic Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your clinic information and system preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            General Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-2">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {clinicLogo ? (
                <img
                  src={clinicLogo}
                  alt="Clinic logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicLogo">Clinic Logo</Label>
              <Input
                id="clinicLogo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === "string") {
                      setClinicLogo(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Upload a PNG, JPG, WEBP, or SVG logo.
              </p>

              {clinicLogo && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setClinicLogo("");
                    localStorage.removeItem("clinicLogo");
                    window.dispatchEvent(new Event("clinicSettingsUpdated"));
                  }}
                >
                  Remove Logo
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Radiant Smile Dental Clinic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-9"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 123 456"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@radiantsmile.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  className="pl-9"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="www.radiantsmile.com"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Clinic Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  className="pl-9"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nanyuki, Kenya"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock3 className="h-5 w-5" />
            Business Preferences
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KSh — Kenyan Shilling</SelectItem>
                  <SelectItem value="USD">$ — US Dollar</SelectItem>
                  <SelectItem value="EUR">€ — Euro</SelectItem>
                  <SelectItem value="GBP">£ — British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Time Zone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                  <SelectItem value="Africa/Kampala">Africa/Kampala</SelectItem>
                  <SelectItem value="Africa/Dar_es_Salaam">
                    Africa/Dar es Salaam
                  </SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Appointment Duration</Label>
              <Select
                value={appointmentDuration}
                onValueChange={setAppointmentDuration}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="openingTime">Opening Time</Label>
              <Input
                id="openingTime"
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input
                id="closingTime"
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders for upcoming appointments.
              </p>
            </div>
            <Switch
              checked={appointmentReminders}
              onCheckedChange={setAppointmentReminders}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>New Appointment Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when a new appointment is created.
              </p>
            </div>
            <Switch
              checked={newAppointmentNotifications}
              onCheckedChange={setNewAppointmentNotifications}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Billing Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about billing activity.
              </p>
            </div>
            <Switch
              checked={billingNotifications}
              onCheckedChange={setBillingNotifications}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label>Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when inventory items are running low.
              </p>
            </div>
            <Switch
              checked={lowStockAlerts}
              onCheckedChange={setLowStockAlerts}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Login Credentials
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a staff account to manage its login credentials.
          </p>
        </CardHeader>

        <CardContent>
          {selectedCredentialRole === null ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                type="button"
                variant="outline"
                className="h-auto justify-between p-5"
                onClick={() => {
                  setSelectedCredentialRole("admin");
                  setCurrentCredentialPassword("");
                  setCredentialNewEmail(adminEmail);
                  setCredentialNewPassword("");
                  setCredentialConfirmPassword("");
                }}
              >
                <div className="text-left">
                  <p className="font-semibold">Administrator</p>
                  <p className="text-sm text-muted-foreground">
                    Manage administrator login
                  </p>
                </div>
                <span>→</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-auto justify-between p-5"
                onClick={() => {
                  setSelectedCredentialRole("dentist");
                  setCurrentCredentialPassword("");
                  setCredentialNewEmail(dentistEmail);
                  setCredentialNewPassword("");
                  setCredentialConfirmPassword("");
                }}
              >
                <div className="text-left">
                  <p className="font-semibold">Dentist</p>
                  <p className="text-sm text-muted-foreground">
                    Manage dentist login
                  </p>
                </div>
                <span>→</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-auto justify-between p-5"
                onClick={() => {
                  setSelectedCredentialRole("receptionist");
                  setCurrentCredentialPassword("");
                  setCredentialNewEmail(receptionistEmail);
                  setCredentialNewPassword("");
                  setCredentialConfirmPassword("");
                }}
              >
                <div className="text-left">
                  <p className="font-semibold">Receptionist</p>
                  <p className="text-sm text-muted-foreground">
                    Manage receptionist login
                  </p>
                </div>
                <span>→</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedCredentialRole === "admin"
                    ? "Administrator"
                    : selectedCredentialRole === "dentist"
                      ? "Dentist"
                      : "Receptionist"}{" "}
                  Credentials
                </h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Verify the current password before changing login credentials.
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium">Current Email</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedCredentialRole === "admin"
                    ? adminEmail
                    : selectedCredentialRole === "dentist"
                      ? dentistEmail
                      : receptionistEmail}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCredentialPassword">
                  Current Password
                </Label>
                <Input
                  id="currentCredentialPassword"
                  type="password"
                  value={currentCredentialPassword}
                  onChange={(e) => setCurrentCredentialPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
                <p className="text-xs text-muted-foreground">
                  Your current password is required before any changes can be
                  made.
                </p>
              </div>

              <div className="border-t pt-6 space-y-5">
                <div>
                  <h4 className="font-semibold">New Credentials</h4>
                  <p className="text-sm text-muted-foreground">
                    Leave a field unchanged if you do not want to update it.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credentialNewEmail">New Email</Label>
                  <Input
                    id="credentialNewEmail"
                    type="email"
                    value={credentialNewEmail}
                    onChange={(e) => setCredentialNewEmail(e.target.value)}
                    placeholder="Enter new email"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="credentialNewPassword">New Password</Label>
                    <Input
                      id="credentialNewPassword"
                      type="password"
                      value={credentialNewPassword}
                      onChange={(e) => setCredentialNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credentialConfirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="credentialConfirmPassword"
                      type="password"
                      value={credentialConfirmPassword}
                      onChange={(e) =>
                        setCredentialConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedCredentialRole(null);
                    setCurrentCredentialPassword("");
                    setCredentialNewEmail("");
                    setCredentialNewPassword("");
                    setCredentialConfirmPassword("");
                  }}
                >
                  Cancel
                </Button>

                <Button type="button" onClick={saveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Credentials
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
