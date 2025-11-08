import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    saleId?: string;
    customerId?: string;
    amount?: number;
    invoiceNumber?: string;
    customerCount?: number;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  refreshNotifications: () => Promise<void>;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Persist read state across reloads
  const READ_IDS_STORAGE_KEY = 'readNotificationIds';
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(READ_IDS_STORAGE_KEY);
      if (!stored) return new Set<string>();
      const arr = JSON.parse(stored) as string[];
      return new Set<string>(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set<string>();
    }
  });

  const persistReadIds = (ids: Set<string>) => {
    try {
      localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(Array.from(ids)));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Generate dynamic notifications based on business data
  const generateDynamicNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const newNotifications: Notification[] = [];
      console.log('🔄 Generating notifications...');

      // 1. Check for overdue invoices
      const overdueResponse = await apiService.getSales({ 
        status: 'overdue', 
        limit: 5,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      });
      
      if (overdueResponse.success && overdueResponse.data?.length > 0) {
        const overdueCount = overdueResponse.data.length;
        const totalOverdueAmount = overdueResponse.data.reduce((sum: number, sale: any) => sum + sale.outstandingAmount, 0);
        
        newNotifications.push({
          id: 'overdue-invoices',
          type: 'warning',
          title: 'Overdue Invoices',
          message: `${overdueCount} invoice${overdueCount > 1 ? 's' : ''} overdue (Total: AED ${totalOverdueAmount.toLocaleString()})`,
          timestamp: new Date(),
          read: false,
          actionUrl: '/sales?status=overdue',
          actionText: 'View Overdue',
          metadata: {
            amount: totalOverdueAmount
          }
        });
      }

      // 2. Check for recent payments
      const recentPaymentsResponse = await apiService.getRecentPayments({ limit: 3 });
      if (recentPaymentsResponse.success && recentPaymentsResponse.data && recentPaymentsResponse.data.length > 0) {
        recentPaymentsResponse.data.forEach((payment: any) => {
          newNotifications.push({
            id: `payment-${payment._id}`,
            type: 'success',
            title: 'Payment Received',
            message: `AED ${payment.amount.toLocaleString()} received for ${payment.sale?.invoiceNumber || 'Invoice'}`,
            timestamp: new Date(payment.paymentDate),
            read: false,
            actionUrl: `/sales/${payment.saleId}`,
            actionText: 'View Sale',
            metadata: {
              saleId: payment.saleId,
              amount: payment.amount,
              invoiceNumber: payment.sale?.invoiceNumber
            }
          });
        });
      }

      // 3. Check for new sales created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySalesResponse = await apiService.getSales({ 
        startDate: today.toISOString(),
        limit: 5
      });
      
      console.log('📊 Today\'s sales response:', todaySalesResponse);
      
      if (todaySalesResponse.success && todaySalesResponse.data && todaySalesResponse.data.length > 0) {
        const todaySalesCount = todaySalesResponse.data.length;
        const todaySalesAmount = todaySalesResponse.data.reduce((sum: number, sale: any) => sum + sale.amount, 0);
        
        console.log(`✅ Found ${todaySalesCount} sales today worth AED ${todaySalesAmount.toLocaleString()}`);
        
        newNotifications.push({
          id: 'today-sales',
          type: 'info',
          title: 'Today\'s Sales',
          message: `${todaySalesCount} new sale${todaySalesCount > 1 ? 's' : ''} created (Total: AED ${todaySalesAmount.toLocaleString()})`,
          timestamp: new Date(),
          read: false,
          actionUrl: '/sales',
          actionText: 'View Sales',
          metadata: {
            amount: todaySalesAmount
          }
        });
      } else {
        console.log('ℹ️ No sales found for today');
      }

      // 3.5. Check for new customers created today
      const todayCustomersResponse = await apiService.getCustomers(1, 10);
      if (todayCustomersResponse.success && todayCustomersResponse.data && todayCustomersResponse.data.length > 0) {
        // Filter customers created today
        const todayCustomers = todayCustomersResponse.data.filter((customer: any) => {
          const customerDate = new Date(customer.createdAt);
          return customerDate.toDateString() === today.toDateString();
        });
        
        if (todayCustomers.length > 0) {
          console.log(`✅ Found ${todayCustomers.length} new customers today`);
          
          newNotifications.push({
            id: 'today-customers',
            type: 'info',
            title: 'New Customers',
            message: `${todayCustomers.length} new customer${todayCustomers.length > 1 ? 's' : ''} added today`,
            timestamp: new Date(),
            read: false,
            actionUrl: '/customers',
            actionText: 'View Customers',
            metadata: {
              customerCount: todayCustomers.length
            }
          });
        } else {
          console.log('ℹ️ No new customers found for today');
        }
      }

      // 4. Check for partially paid invoices that need attention
      const partiallyPaidResponse = await apiService.getSales({ 
        status: 'partially_paid', 
        limit: 3,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      });
      
      if (partiallyPaidResponse.success && partiallyPaidResponse.data && partiallyPaidResponse.data.length > 0) {
        partiallyPaidResponse.data.forEach((sale: any) => {
          const msDiff = new Date(sale.dueDate).getTime() - new Date().getTime();
          const daysUntilDue = Math.ceil(msDiff / (1000 * 60 * 60 * 24));

          // Overdue partial payments
          if (daysUntilDue < 0) {
            const overdueDays = Math.abs(daysUntilDue);
            newNotifications.push({
              id: `partial-payment-overdue-${sale._id}`,
              type: 'error',
              title: 'Partial Payment Overdue',
              message: `${sale.invoiceNumber} - AED ${sale.outstandingAmount.toLocaleString()} outstanding (Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''})`,
              timestamp: new Date(),
              read: false,
              actionUrl: `/sales/${sale._id}`,
              actionText: 'View Invoice',
              metadata: {
                saleId: sale._id,
                amount: sale.outstandingAmount,
                invoiceNumber: sale.invoiceNumber
              }
            });
            return;
          }

          // Due soon (within next 3 days)
          if (daysUntilDue <= 3) {
            newNotifications.push({
              id: `partial-payment-${sale._id}`,
              type: 'warning',
              title: 'Partial Payment Due Soon',
              message: `${sale.invoiceNumber} - AED ${sale.outstandingAmount.toLocaleString()} remaining (Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''})`,
              timestamp: new Date(),
              read: false,
              actionUrl: `/sales/${sale._id}`,
              actionText: 'View Invoice',
              metadata: {
                saleId: sale._id,
                amount: sale.outstandingAmount,
                invoiceNumber: sale.invoiceNumber
              }
            });
          }
        });
      }

      // 5. Check for high-value outstanding amounts
      const highValueResponse = await apiService.getSales({ 
        status: 'unpaid',
        minAmount: 10000, // AED 10,000+
        limit: 3
      });
      
      if (highValueResponse.success && highValueResponse.data && highValueResponse.data.length > 0) {
        highValueResponse.data.forEach((sale: any) => {
          newNotifications.push({
            id: `high-value-${sale._id}`,
            type: 'info',
            title: 'High Value Outstanding',
            message: `${sale.invoiceNumber} - AED ${sale.outstandingAmount.toLocaleString()} outstanding from ${sale.customer}`,
            timestamp: new Date(),
            read: false,
            actionUrl: `/sales/${sale._id}`,
            actionText: 'View Invoice',
            metadata: {
              saleId: sale._id,
              amount: sale.outstandingAmount,
              invoiceNumber: sale.invoiceNumber
            }
          });
        });
      }

      // Apply persisted read state
      for (const n of newNotifications) {
        if (readIds.has(n.id)) {
          n.read = true;
        }
      }

      // Sort notifications by timestamp (newest first)
      newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      console.log(`📝 Generated ${newNotifications.length} notifications:`, newNotifications);

      setNotifications(prev => {
        // Merge with existing notifications, avoiding duplicates
        const existingIds = new Set(prev.map(n => n.id));
        const uniqueNewNotifications = newNotifications.filter(n => !existingIds.has(n.id));
        // When merging, ensure read state is respected from persisted IDs
        const merged = [...uniqueNewNotifications, ...prev].slice(0, 50).map(n => ({
          ...n,
          read: n.read || readIds.has(n.id)
        }));
        const finalNotifications = merged;
        
        console.log(`📋 Total notifications after merge: ${finalNotifications.length}`);
        return finalNotifications;
      });

    } catch (error) {
      console.error('Error generating notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, readIds]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await generateDynamicNotifications();
  }, [generateDynamicNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setReadIds(prev => {
      const next = new Set(prev);
      notifications.forEach(n => next.add(n.id));
      persistReadIds(next);
      return next;
    });
  }, [notifications]);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    // Optionally persist as read so it doesn't reappear immediately upon regeneration
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      persistReadIds(next);
      return next;
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Add manual notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  }, []);

  // Generate notifications on mount and periodically
  useEffect(() => {
    if (user) {
      generateDynamicNotifications();
      
      // Refresh notifications every 5 minutes
      const interval = setInterval(generateDynamicNotifications, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [user, generateDynamicNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addNotification,
    refreshNotifications,
    loading
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
