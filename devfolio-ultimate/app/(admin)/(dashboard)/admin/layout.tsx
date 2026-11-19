import React from "react";
import "../../globals.css";
import { generateSEO } from "@/utils/seo";
import AdminLayoutClient from "./AdminLayoutClient";
import ProtectedProvider from "../../components/ProtectedProvider";

export const metadata = generateSEO({
  title: "Admin Dashboard | Khaled Hesham",
  description:
    "Manage projects, blogs, and site settings from the admin dashboard.",
  url: "https://the-forge-one.vercel.app/admin",
  type: "website",
  robots: "noindex, nofollow",
  keywords: [
    "admin",
    "dashboard",
    "Khaled Hesham",
    "portfolio management",
    "content management",
  ],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedProvider>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </ProtectedProvider>
  );
}
