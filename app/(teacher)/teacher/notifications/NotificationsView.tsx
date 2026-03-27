"use client";

import React from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Bell, CheckCircle2, Info, ArrowRight, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NotificationsView() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);

  // Filter to just this user
  const userNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleMarkAll = async () => {
    if (unreadCount === 0 || !currentUser?.id) return;
    await markAllNotificationsRead(currentUser.id);
    toast.success('All notifications marked as read.');
  };

  const handleMarkRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    await markNotificationRead(id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
            <Bell className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold leading-none animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">Updates on your lab reports and tickets.</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAll} variant="outline" className="rounded-xl font-bold gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {userNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center shadow-sm">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Notifications</h3>
            <p className="text-sm text-gray-500">You're all caught up! New alerts will appear here.</p>
          </div>
        ) : (
          userNotifications.map((notif) => {
            const Icon = notif.type === 'resolved' || notif.type === 'success' ? CheckCircle2 : Info;
            const bgClass = notif.isRead ? 'bg-white' : 'bg-blue-50/50';
            const iconColor = notif.type === 'resolved' || notif.type === 'success' ? 'text-emerald-500' : 'text-blue-500';
            const iconBg = notif.type === 'resolved' || notif.type === 'success' ? 'bg-emerald-100 border-emerald-200' : 'bg-blue-100 border-blue-200';

            return (
              <div 
                key={notif.id} 
                onClick={() => handleMarkRead(notif.id, notif.isRead)}
                className={`flex gap-4 p-5 rounded-2xl border ${notif.isRead ? 'border-gray-100' : 'border-blue-200 shadow-sm shadow-blue-50 cursor-pointer'} transition-all`}
              >
                <div className={`mt-1 flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full border ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className={`text-sm font-bold ${notif.isRead ? 'text-gray-800' : 'text-gray-900'}`}>{notif.title}</h3>
                    <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm mt-1.5 ${notif.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                    {notif.message}
                  </p>
                  {!notif.isRead && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-widest">
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                      Tap to mark read
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
