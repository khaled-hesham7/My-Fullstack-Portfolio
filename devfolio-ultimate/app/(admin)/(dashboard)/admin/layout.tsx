import React from "react";
import "../../globals.css";
import AppHeader from "@/app/(site)/components/AppHeader";
import AppSidebar from "@/app/(site)/components/AppSidebar";
import Backdrop from "@/app/(site)/components/Backdrop";
import { SidebarProvider } from "@/app/context/SidebarContext";
import { ThemeContextProvider } from "@/app/context/ThemeContext";
import { generateSEO } from "@/utils/seo";
import AdminLayoutClient from "./AdminLayoutClient"; // 👈 هنفصل client component
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
      <SidebarProvider>
        <ThemeContextProvider>
          <AdminLayoutClient>{children}</AdminLayoutClient>
        </ThemeContextProvider>
      </SidebarProvider>
    </ProtectedProvider>
  );
}
