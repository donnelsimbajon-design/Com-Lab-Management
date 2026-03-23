"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { canAccessRoute } from '@/lib/security/rbac';
import { logAudit } from '@/lib/security/audit-log';
import { Shield } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, isAuthenticated, checkSession } = useAuthStore();

  useEffect(() => {
    // Check session validity
    const sessionValid = checkSession();
    if (!sessionValid || !isAuthenticated || !currentUser) {
      router.replace('/');
      return;
    }

    // Check route authorization
    if (!canAccessRoute(currentUser.role, '/' + pathname.split('/')[1])) {
      logAudit('UNAUTHORIZED_ACCESS', currentUser.id, currentUser.name, currentUser.role, `Attempted to access ${pathname}`);
      router.replace('/' + currentUser.role);
    }
  }, [pathname, currentUser, isAuthenticated, checkSession, router]);

  // Session check interval (every 60s)
  useEffect(() => {
    const interval = setInterval(() => {
      checkSession();
    }, 60000);
    return () => clearInterval(interval);
  }, [checkSession]);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full">
          <div className="bg-red-50 mx-auto w-16 h-16 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-sm text-gray-500 font-medium">You must be logged in to access this page.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#164ac9] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-md w-full"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role) && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full">
          <div className="bg-amber-50 mx-auto w-16 h-16 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Forbidden</h2>
          <p className="text-sm text-gray-500 font-medium">You don&apos;t have permission to view this page.</p>
          <button
            onClick={() => router.push('/' + currentUser.role)}
            className="bg-[#164ac9] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-md w-full"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
