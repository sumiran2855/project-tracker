import React from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'task' | 'issue' | 'project' | 'system';
  rawDate: Date;
}

export interface NotificationFilterRibbonProps {
  filterTab: 'all' | 'unread' | 'read';
  setFilterTab: (tab: 'all' | 'unread' | 'read') => void;
  unreadCount: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
}

export interface NotificationItemCardProps {
  item: NotificationItem;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string, e: React.MouseEvent) => Promise<void>;
}
