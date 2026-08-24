import React, { useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/auth";

export default function Login() {
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

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

    const account = credentials[role as keyof typeof credentials];

    if (
      account &&
      email.trim().toLowerCase() === account.email.toLowerCase() &&
      password === account.password
    ) {
      localStorage.setItem("userRole", role);
      auth.login();
      navigate("/");
      return;
    }

    alert("Invalid email, password or role");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f4f7fb",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#fff",
          padding: "35px",
          borderRadius: "12px",
          width: "360px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "25px" }}>
          Radiant Smile Dental Clinic
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
          }}
        />

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            Login As
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
            }}
          >
            <option value="admin">Admin</option>
            <option value="dentist">Dentist</option>
            <option value="receptionist">Receptionist</option>
          </select>
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
