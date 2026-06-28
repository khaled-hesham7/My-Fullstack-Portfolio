"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/profile");
  }, [router]);

  return (
    <div className="flex justify-center items-center h-48 text-gray-500">
      <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></span>
      Redirecting to dashboard...
    </div>
  );
}
