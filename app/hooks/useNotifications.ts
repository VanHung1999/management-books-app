import { useState, useEffect, useCallback } from 'react';
import { LoanRecord } from '../interface/loanRecord';
import { User } from '../interface/user';
import { useList } from '@refinedev/core';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
  category: 'loan' | 'book' | 'user' | 'donation' | 'system' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string; 
  metadata?: Record<string, any>;
}

const getLoanNotifications = (currentUser: User, loanRecords: LoanRecord[]): Notification[] => {
    const notificationsLoanRecords: Notification[] = [];

    // Helper function to create base notification
    const createBaseNotification = (record: LoanRecord, type: Notification['type'], priority: Notification['priority']) => ({
        id: `loan-${record.status}-${record.id}`,
        type,
        timestamp: record.borrowedAt || new Date(),
        isRead: false,
        category: 'loan' as const,
        priority,
        actionUrl: '/loanRecords',
        metadata: {
            loanRecordId: record.id,
            bookTitle: record.bookTitle,
            quantity: record.quantity,
            status: record.status
        }
    });

    // Notification configurations mapping
    const notificationConfigs = {
        delivered: {
            condition: (record: LoanRecord) => record.borrowerName === currentUser.email,
            title: '🚚 Book has been delivered',
            message: (record: LoanRecord) => `Book "${record.bookTitle}" (${record.quantity} books) has been delivered to you`,
            type: 'success' as const,
            priority: 'medium' as const,
            timestamp: (record: LoanRecord) => record.deliveredAt || new Date()
        },
        pending: {
            condition: (record: LoanRecord) => currentUser.role === 'admin',
            title: '📚 User has requested a loan',
            message: (record: LoanRecord) => `${record.borrowerName} has requested a loan for "${record.bookTitle}" (${record.quantity} books)`,
            type: 'info' as const,
            priority: 'medium' as const,
            timestamp: (record: LoanRecord) => record.borrowedAt
        },
        returned: {
            condition: (record: LoanRecord) => currentUser.role === 'admin',
            title: '📖 User has returned a book',
            message: (record: LoanRecord) => `${record.borrowerName} has returned "${record.bookTitle}" (${record.quantity} books)`,
            type: 'success' as const,
            priority: 'low' as const,
            timestamp: (record: LoanRecord) => record.returnedAt || new Date()
        }
    };

    loanRecords?.forEach((record: LoanRecord) => {
        const config = notificationConfigs[record.status as keyof typeof notificationConfigs];
        
        if (config && config.condition(record)) {
            const notification: Notification = {
                ...createBaseNotification(record, config.type, config.priority),
                title: config.title,
                message: config.message(record),
                timestamp: config.timestamp(record),
                metadata: {
                    ...createBaseNotification(record, config.type, config.priority).metadata,
                    ...(config.condition.name === 'pending' || config.condition.name === 'returned' ? { borrowerName: record.borrowerName } : {})
                }
            };
            
            notificationsLoanRecords.push(notification);
        }
    });

    return notificationsLoanRecords;
};

export const useNotifications = (currentUser: User | null): {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  markAllAsReadByCategory: (category: Notification['category']) => void;
  clearNotification: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  getNotificationsByCategory: (category: Notification['category']) => Notification[];
  getNotificationsByPriority: (priority: Notification['priority']) => Notification[];
} => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: loanRecords, isLoading } = useList<LoanRecord>({
    resource: 'loanRecords',
});
  

  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const loadNotifications = () => {
      try {
        const allNotifications: Notification[] = [];

        // Get loan notifications
        const loanNotifications = getLoanNotifications(currentUser, loanRecords?.data || []);
        allNotifications.push(...loanNotifications);
         
        // Sort by priority first, then by timestamp (newest first)
        allNotifications.sort((a, b) => {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        setNotifications(allNotifications);
        setUnreadCount(allNotifications.filter(n => !n.isRead).length);
      } catch (error) {

      }
    };

    loadNotifications();

    // Set up interval to check for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, [currentUser, loanRecords]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `${notification.category}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev: Notification[]) => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount((prev: number) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev: Notification[]) => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  };

  const markAllAsReadByCategory = useCallback((category: Notification['category']) => {
    
    setNotifications((prev: Notification[]) => {
      const updatedNotifications = prev.map(notification => 
        notification.category === category 
          ? { ...notification, isRead: true }
          : notification
      );
      
      // Calculate new unread count based on updated notifications
      const newUnreadCount = updatedNotifications.filter(n => !n.isRead).length;
      
      // Update unread count in the same state update to avoid infinite loop
      setUnreadCount(newUnreadCount);
      
      return updatedNotifications;
    });
  }, [isLoading]);

  const clearNotification = (notificationId: string) => {
    setNotifications((prev: Notification[]) => prev.filter(n => n.id !== notificationId));
    setUnreadCount((prev: number) => {
      const notification = notifications.find(n => n.id === notificationId);
      return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
    });
  };

  const getNotificationsByCategory = (category: Notification['category']) => {
    return notifications.filter(n => n.category === category);
  };

  const getNotificationsByPriority = (priority: Notification['priority']) => {
    return notifications.filter(n => n.priority === priority);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    markAllAsReadByCategory,
    clearNotification,
    addNotification,
    getNotificationsByCategory,
    getNotificationsByPriority
  };
};
