'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Calendar, Mail, MailOpen, Settings, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import axios from 'axios';
import Image from 'next/image';

type NotificationType = 'alert' | 'update' | 'success' | 'reminder';

interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  action_required: boolean;
  action_text?: string;
  action_url?: string;
  timeAgo: string;
}

export default function NotificationsPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'alerts' | 'updates'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unread: 0, alerts: 0, updates: 0 });

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications?type=${activeTab}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(response.data.notifications);
      setStats({
        total: response.data.total,
        unread: response.data.unread,
        alerts: response.data.notifications.filter((n: Notification) => n.type === 'alert').length,
        updates: response.data.notifications.filter((n: Notification) => n.type === 'update').length,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nid => nid !== id) : [...prev, id]
    );
  };

  const bulkAction = async (action: 'read' | 'delete') => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/bulk-action`,
        { ids: selectedNotifications, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedNotifications([]);
      fetchNotifications();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'update': return <Bell className="w-5 h-5 text-primary" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case 'reminder': return <Calendar className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'alert': return 'bg-destructive/10';
      case 'update': return 'bg-primary/10';
      case 'success': return 'bg-green-500/10';
      case 'reminder': return 'bg-yellow-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated on compliance alerts</p>
          </div>
          <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition">
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-4 transition ${
              activeTab === 'all'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`pb-2 px-4 transition ${
              activeTab === 'unread'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread ({stats.unread})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-2 px-4 transition ${
              activeTab === 'alerts'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Alerts ({stats.alerts})
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`pb-2 px-4 transition ${
              activeTab === 'updates'
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Updates ({stats.updates})
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedNotifications.length > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4 flex justify-between items-center">
            <span className="text-foreground">{selectedNotifications.length} selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => bulkAction('read')}
                className="px-3 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded transition"
              >
                Mark as Read
              </button>
              <button
                onClick={() => bulkAction('delete')}
                className="px-3 py-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center border border-border">
            <Image 
              src="/linky-full.png" 
              alt="Linky Assistant" 
              width={100} 
              height={100}
              className="mx-auto mb-4 opacity-80"
            />
            <h3 className="text-xl font-semibold text-foreground mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">You're all caught up! Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`bg-card rounded-lg p-4 border border-border hover:border-primary/50 transition-colors cursor-pointer ${
                  !notif.read ? 'border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notif._id)}
                    onChange={() => toggleSelection(notif._id)}
                    className="mt-1"
                  />
                  <div className={`p-2 rounded-lg ${getIconBg(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{notif.title}</h3>
                      <span className="text-xs text-muted-foreground">{notif.timeAgo}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{notif.message}</p>
                    {notif.action_required && notif.action_text && (
                      <button className="text-primary hover:text-primary/80 text-sm transition">
                        {notif.action_text} →
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="text-muted-foreground hover:text-foreground transition"
                      title={notif.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {notif.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="text-muted-foreground hover:text-destructive transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
