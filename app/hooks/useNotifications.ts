import { useState, useEffect, useCallback } from 'react';
import { LoanRecord } from '../interface/loanRecord';
import { DonationRecord } from '../interface/donationRecord';
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

const getAllNotifications = (currentUser: User, loanRecords: LoanRecord[], donationRecords: DonationRecord[]): Notification[] => {
    const allNotifications: Notification[] = [];

    // Loan notifications configuration
    const loanNotificationConfigs = {
        delivered: {
            condition: (record: LoanRecord) => record.borrowerName === currentUser.email,
            title: '🚚 Book has been delivered',
            message: (record: LoanRecord) => `Book "${record.bookTitle}" (${record.quantity} books) has been delivered to you`,
            type: 'success' as const,
            priority: 'medium' as const,
            timestamp: (record: LoanRecord) => record.deliveredAt || new Date(),
            category: 'loan' as const,
            actionUrl: '/loanRecords'
        },
        pending: {
            condition: (record: LoanRecord) => currentUser.role === 'admin',
            title: '📚 User has requested a loan',
            message: (record: LoanRecord) => `${record.borrowerName} has requested a loan for "${record.bookTitle}" (${record.quantity} books)`,
            type: 'info' as const,
            priority: 'medium' as const,
            timestamp: (record: LoanRecord) => record.borrowedAt,
            category: 'loan' as const,
            actionUrl: '/loanRecords'
        },
        returned: {
            condition: (record: LoanRecord) => currentUser.role === 'admin',
            title: '📖 User has returned a book',
            message: (record: LoanRecord) => `${record.borrowerName} has returned "${record.bookTitle}" (${record.quantity} books)`,
            type: 'success' as const,
            priority: 'low' as const,
            timestamp: (record: LoanRecord) => record.returnedAt || new Date(),
            category: 'loan' as const,
            actionUrl: '/loanRecords'
        }
    };

    // Donation notifications configuration
    const donationNotificationConfigs = {
        pending: {
            condition: (record: DonationRecord) => currentUser.role === 'admin',
            title: '📚 New book donation request',
            message: (record: DonationRecord) => `${record.donationerName} has donated "${record.bookTitle}" (${record.num} books)`,
            type: 'info' as const,
            priority: 'medium' as const,
            timestamp: (record: DonationRecord) => record.donationDate,
            category: 'donation' as const,
            actionUrl: '/donations'
        },
        confirmed: {
            condition: (record: DonationRecord) => record.donationerName === currentUser.email,
            title: '✅ Donation confirmed',
            message: (record: DonationRecord) => `Your donation of "${record.bookTitle}" (${record.num} books) has been confirmed`,
            type: 'success' as const,
            priority: 'medium' as const,
            timestamp: (record: DonationRecord) => record.confirmDate || new Date(),
            category: 'donation' as const,
            actionUrl: '/donations'
        },
        sent: {
            condition: (record: DonationRecord) => currentUser.role === 'admin',
            title: '📦 Donation sent',
            message: (record: DonationRecord) => `Your donation of "${record.bookTitle}" (${record.num} books) has been sent`,
            type: 'success' as const,
            priority: 'low' as const,
            timestamp: (record: DonationRecord) => record.sendDate || new Date(),
            category: 'donation' as const,
            actionUrl: '/donations'
        }
    };

    // Process loan records
    loanRecords?.forEach((record: LoanRecord) => {
        const config = loanNotificationConfigs[record.status as keyof typeof loanNotificationConfigs];
        
        if (config && config.condition(record)) {
            const notification: Notification = {
                id: `loan-${record.status}-${record.id}`,
                title: config.title,
                message: config.message(record),
                type: config.type,
                timestamp: config.timestamp(record),
                isRead: false,
                category: config.category,
                priority: config.priority,
                actionUrl: config.actionUrl,
                metadata: {
                    loanRecordId: record.id,
                    bookTitle: record.bookTitle,
                    quantity: record.quantity,
                    status: record.status,
                    ...(config.condition.name === 'pending' || config.condition.name === 'returned' ? { borrowerName: record.borrowerName } : {})
                }
            };
            
            allNotifications.push(notification);
        }
    });

    // Process donation records
    donationRecords?.forEach((record: DonationRecord) => {
        const config = donationNotificationConfigs[record.status as keyof typeof donationNotificationConfigs];
        
        if (config && config.condition(record)) {
            const notification: Notification = {
                id: `donation-${record.status}-${record.id}`,
                title: config.title,
                message: config.message(record),
                type: config.type,
                timestamp: config.timestamp(record),
                isRead: false,
                category: config.category,
                priority: config.priority,
                actionUrl: config.actionUrl,
                metadata: {
                    donationRecordId: record.id,
                    bookTitle: record.bookTitle,
                    num: record.num,
                    status: record.status,
                    donationerName: record.donationerName
                }
            };
            
            allNotifications.push(notification);
        }
    });

    return allNotifications;
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
  const { data: loanRecords, isLoading: isLoadingLoans } = useList<LoanRecord>({
    resource: 'loanRecords',
  });
  
  const { data: donationRecords, isLoading: isLoadingDonations } = useList<DonationRecord>({
    resource: 'donationRecords',
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

        // Get all notifications (loan + donation)
        const allNotificationsFromRecords = getAllNotifications(currentUser, loanRecords?.data || [], donationRecords?.data || []);
        allNotifications.push(...allNotificationsFromRecords);
         
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
  }, [currentUser, loanRecords, donationRecords]);

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
  }, [isLoadingLoans, isLoadingDonations]);

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
