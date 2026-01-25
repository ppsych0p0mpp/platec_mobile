'use client';

import { useEffect, useState, useCallback } from 'react';
import { notificationsApi, Notification } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationsApi.getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getNotificationIcon = (type: 'absence' | 'late' | 'general') => {
    const icons = {
      absence: '❌',
      late: '⏰',
      general: '📢',
    };
    return icons[type];
  };

  const getNotificationColor = (type: 'absence' | 'late' | 'general') => {
    const colors = {
      absence: 'bg-rose-500/20',
      late: 'bg-amber-500/20',
      general: 'bg-blue-500/20',
    };
    return colors[type];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="danger">{unreadCount} new</Badge>
        )}
      </div>

      {/* Notifications List */}
      <Card variant="gradient" className="animate-fade-in stagger-1" style={{ opacity: 0 }}>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    notification.read
                      ? 'bg-slate-800/30 border-slate-800 hover:border-slate-700'
                      : 'bg-violet-500/5 border-violet-500/30 hover:border-violet-500/50'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl ${getNotificationColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white truncate">{notification.title}</h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-slate-600 mt-2">{formatTime(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <p className="text-slate-500">No notifications yet</p>
              <p className="text-slate-600 text-sm mt-1">You&apos;ll be notified about absences and late arrivals</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
