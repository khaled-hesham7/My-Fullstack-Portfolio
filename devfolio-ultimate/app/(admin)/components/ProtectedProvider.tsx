"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProtectedProviderProps = {
  children: React.ReactNode;
};

export default function ProtectedProvider({
  children,
}: ProtectedProviderProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-medium tracking-wider uppercase">Verifying authorization...</p>
      </div>
    );
  }

  return <>{children}</>;
}
