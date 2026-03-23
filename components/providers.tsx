"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useAppStore } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const initializeStore = useAppStore((s) => s.initializeStore);
  const initialized = useAppStore((s) => s.initialized);
  const isLoading = useAppStore((s) => s.isLoading);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return (
    <>
      {!initialized && isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="text-sm font-medium text-gray-500">Loading ComLab Connect...</p>
          </div>
        </div>
      )}
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: { fontFamily: 'Poppins, sans-serif' },
        }}
      />
    </>
  );
}
