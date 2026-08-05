import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchLiveNotifications } from '@/lib/sprintLoader';
import { NotificationItem } from '@/types/notifications.types';
import { useUser } from '@/contexts/UserContext';
import { updateNotificationStateAction } from '@/actions/auth';

export function useNotificationsService() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, setUser } = useUser();

  // Initial Load
  const loadLiveNotifications = async () => {
    try {
      const data = await fetchLiveNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load live notifications", e);
    }
  };

  useEffect(() => {
    loadLiveNotifications();

    const handleUpdate = () => {
      loadLiveNotifications();
    };
    window.addEventListener('pwt_notifications_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('pwt_notifications_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Sync user's notifications state from database to localStorage on user load/update
  useEffect(() => {
    if (user) {
      let changed = false;
      if (user.readNotifications) {
        localStorage.setItem('pwt_read_notifications', JSON.stringify(user.readNotifications));
        changed = true;
      }
      if (user.deletedNotifications) {
        localStorage.setItem('pwt_deleted_notifications', JSON.stringify(user.deletedNotifications));
        changed = true;
      }
      if (changed) {
        loadLiveNotifications();
      }
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const stored = localStorage.getItem('pwt_read_notifications');
      let readIds: string[] = stored ? JSON.parse(stored) : [];
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem('pwt_read_notifications', JSON.stringify(readIds));
      }

      // Update database
      const deletedStored = localStorage.getItem('pwt_deleted_notifications');
      const deletedIds: string[] = deletedStored ? JSON.parse(deletedStored) : [];
      const res = await updateNotificationStateAction(readIds, deletedIds);
      if (res.success && res.data) {
        setUser(res.data);
      }

      window.dispatchEvent(new Event('pwt_notifications_update'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('pwt_deleted_notifications');
      let deletedIds: string[] = stored ? JSON.parse(stored) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('pwt_deleted_notifications', JSON.stringify(deletedIds));
      }

      // Update database
      const readStored = localStorage.getItem('pwt_read_notifications');
      const readIds: string[] = readStored ? JSON.parse(readStored) : [];
      const res = await updateNotificationStateAction(readIds, deletedIds);
      if (res.success && res.data) {
        setUser(res.data);
      }

      window.dispatchEvent(new Event('pwt_notifications_update'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const stored = localStorage.getItem('pwt_read_notifications');
      let readIds: string[] = stored ? JSON.parse(stored) : [];
      notifications.forEach(n => {
        if (!readIds.includes(n.id)) {
          readIds.push(n.id);
        }
      });
      localStorage.setItem('pwt_read_notifications', JSON.stringify(readIds));

      // Update database
      const deletedStored = localStorage.getItem('pwt_deleted_notifications');
      const deletedIds: string[] = deletedStored ? JSON.parse(deletedStored) : [];
      const res = await updateNotificationStateAction(readIds, deletedIds);
      if (res.success && res.data) {
        setUser(res.data);
      }

      window.dispatchEvent(new Event('pwt_notifications_update'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      try {
        const stored = localStorage.getItem('pwt_deleted_notifications');
        let deletedIds: string[] = stored ? JSON.parse(stored) : [];
        notifications.forEach(n => {
          if (!deletedIds.includes(n.id)) {
            deletedIds.push(n.id);
          }
        });
        localStorage.setItem('pwt_deleted_notifications', JSON.stringify(deletedIds));

        // Update database
        const readStored = localStorage.getItem('pwt_read_notifications');
        const readIds: string[] = readStored ? JSON.parse(readStored) : [];
        const res = await updateNotificationStateAction(readIds, deletedIds);
        if (res.success && res.data) {
          setUser(res.data);
        }

        window.dispatchEvent(new Event('pwt_notifications_update'));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      const matchesTab = 
        filterTab === 'all' ? true :
        filterTab === 'unread' ? !item.read :
        item.read;

      const matchesType = typeFilter === 'All' || item.type === typeFilter.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesType && matchesSearch;
    });
  }, [notifications, filterTab, typeFilter, searchQuery]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  return {
    router,
    notifications,
    filterTab,
    setFilterTab,
    typeFilter,
    setTypeFilter,
    searchQuery,
    setSearchQuery,
    filteredNotifications,
    unreadCount,
    handleMarkAsRead,
    handleDelete,
    handleMarkAllRead,
    handleClearAll
  };
}

