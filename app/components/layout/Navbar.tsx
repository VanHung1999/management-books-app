"use client";

import React from "react";
import { Layout, Button, Badge, Avatar, Dropdown, Typography, Tooltip } from "antd";
import { usePathname } from "next/navigation";
import { useLogout } from "@refinedev/core";
import { 
  LogoutOutlined, 
  BookOutlined, 
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  HeartOutlined,
  BellOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import styles from "../../styles/components/layout/Navbar.module.css";

const { Header } = Layout;
const { Text, Title } = Typography;

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  booksLoaned: any[];
  booksDonated: any[];
  status: 'active' | 'inactive';
}

export default function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();
  const [user, setUser] = useState<User | null>(null);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    markAllAsReadByCategory,
    clearNotification,
    addNotification,
    getNotificationsByCategory,
    getNotificationsByPriority
  } = useNotifications(user);

  // Load user from localStorage
  useEffect(() => {
    const loadUserFromStorage = () => {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('currentUser');
          localStorage.removeItem('auth-token');
        }
      }
    };

    // Load user initially
    loadUserFromStorage();

    // Listen for storage changes (when localStorage is updated from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        loadUserFromStorage();
      }
    };

    // Listen for custom events (when localStorage is updated from same tab)
    const handleUserUpdate = () => {
      loadUserFromStorage();
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleUserUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  // Auto mark all loan notifications as read when user visits /loanRecords page
  useEffect(() => {
    if (user && markAllAsReadByCategory && pathname === '/loanRecords') {
      markAllAsReadByCategory('loan');
    }

    if (user && markAllAsReadByCategory && pathname === '/donations') {
      markAllAsReadByCategory('donation');
    }
  }, [user, markAllAsReadByCategory, pathname]);

  const hideOnPaths = ["/login", "/register", "/forgot-password"];
  const shouldHideNavbar = hideOnPaths.includes(pathname);

  if (shouldHideNavbar) {
    return <>{children}</>;
  }

  const navItems = [
    { key: '/', label: 'Home', icon: <HomeOutlined /> },
    { key: '/books', label: 'Books', icon: <BookOutlined /> },
    { key: '/users', label: 'Users', icon: <UserOutlined /> },
    { key: '/loanRecords', label: 'Loan Records', icon: <FileTextOutlined /> },
    { key: '/donations', label: 'Donations', icon: <HeartOutlined /> },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div className={styles.userMenuItem}>
          <div className={styles.userMenuItemHeader}>{user?.name}</div>
          <div className={styles.userMenuItemEmail}>{user?.email}</div>
          <div className={styles.userMenuItemRole}>{user?.role}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: (
        <Button 
          type="text" 
          danger 
          icon={<LogoutOutlined />}   
          onClick={() => logout()}
          className={styles.logoutButton}
        >
          Logout
        </Button>
      ),
    },
  ];

  return (
    <>
      <Layout>
        <Header className={styles.navbarHeader}>
          {/* Logo and Brand */}
          <div className={styles.logoSection}>
            <div className={styles.logoContainer}>
              <div className={styles.logoIcon}>
                <BookOutlined />
              </div>
              <Title level={4} className={styles.brandTitle}>
                Management Books System
              </Title>
            </div>
            
            {/* Navigation Menu */}
            <nav className={styles.navMenu}>
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  type="text"
                  href={item.key}
                  icon={item.icon}
                  className={`${styles.navButton} ${pathname === item.key ? styles.navButtonActive : ''}`}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className={styles.userSection}>

              {/* Notification Bell */}
              <Dropdown
                menu={{
                  items: [{
                    key: 'notifications',
                    label: (
                      <div className={styles.notificationDropdown}>
                        <div className={styles.notificationHeader}>
                          <Text strong className={styles.notificationTitle}>🔔 Notifications</Text>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {unreadCount > 0 && (
                              <Button 
                                type="link" 
                                size="small"
                                onClick={markAllAsRead}
                                className={styles.markAllReadButton}
                              >
                                Mark all as read
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {notifications.length === 0 ? (
                          <div className={styles.noNotifications}>
                            <BellOutlined className={styles.noNotificationsIcon} />
                            <div>No notifications</div>
                          </div>
                        ) : (
                          <div>
                            {notifications.slice(0, 5).map((notification) => {
                              const getCategoryColor = (category: string) => {
                                switch (category) {
                                  case 'loan': return '#1890ff';
                                  case 'book': return '#52c41a';
                                  case 'user': return '#722ed1';
                                  case 'donation': return '#fa8c16';
                                  case 'system': return '#13c2c2';
                                  case 'general': return '#8c8c8c';
                                  default: return '#1890ff';
                                }
                              };

                              const getPriorityColor = (priority: string) => {
                                switch (priority) {
                                  case 'urgent': return '#ff4d4f';
                                  case 'high': return '#fa8c16';
                                  case 'medium': return '#1890ff';
                                  case 'low': return '#52c41a';
                                  default: return '#1890ff';
                                }
                              };

                              const categoryColor = getCategoryColor(notification.category);
                              const priorityColor = getPriorityColor(notification.priority);

                              return (
                                <div
                                  key={notification.id}
                                  className={`${styles.notificationItem} ${notification.isRead ? styles.notificationItemRead : styles.notificationItemUnread}`}
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    if (notification.actionUrl) {
                                      window.location.href = notification.actionUrl;
                                    }
                                  }}
                                  style={{
                                    '--category-color-08': `${categoryColor}08`
                                  } as React.CSSProperties}
                                >
                                  {/* Priority indicator */}
                                  <div 
                                    className={styles.notificationPriority}
                                    style={{ background: priorityColor }}
                                  />

                                  <div className={styles.notificationHeaderRow}>
                                    <div className={styles.notificationCategory}>
                                      <div 
                                        className={styles.categoryIcon}
                                        style={{ 
                                          background: `${categoryColor}20`,
                                          color: categoryColor
                                        }}
                                      >
                                        {notification.category.charAt(0).toUpperCase()}
                                      </div>
                                      <Text strong className={`${styles.notificationTitleText} ${notification.isRead ? styles.notificationTitleTextRead : styles.notificationTitleTextUnread}`}>
                                        {notification.title}
                                      </Text>
                                    </div>
                                    {!notification.isRead && (
                                      <div 
                                        className={styles.unreadIndicator}
                                        style={{ background: priorityColor }}
                                      />
                                    )}
                                  </div>
                                  
                                  <Text className={`${styles.notificationMessage} ${notification.isRead ? styles.notificationMessageRead : styles.notificationMessageUnread}`}>
                                    {notification.message}
                                  </Text>

                                  <div className={styles.notificationFooter}>
                                    <Text className={styles.notificationTimestamp}>
                                      {new Date(notification.timestamp).toLocaleString('vi-VN', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Text>
                                    <div className={styles.notificationActions}>
                                      <Button
                                        type="text"
                                        size="small"
                                        danger
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          clearNotification(notification.id);
                                        }}
                                        className={styles.clearButton}
                                      >
                                        Clear
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {notifications.length > 5 && (
                              <div className={styles.moreNotifications}>
                                <Text className={styles.moreNotificationsText}>
                                  +{notifications.length - 5} more notifications
                                </Text>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  }]
                }}
                placement="bottomRight"
                trigger={['click']}
                overlayStyle={{ minWidth: '320px' }}
              >
                <Tooltip title="Notifications" placement="bottom">
                  <div className={styles.notificationBell}>
                    <Badge 
                       count={unreadCount} 
                       size="default" 
                       className={styles.notificationBadge}
                     >
                       <BellOutlined className={styles.notificationIcon} />
                     </Badge>
                  </div>
                </Tooltip>
              </Dropdown>
               
              {/* User Avatar and Dropdown */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
                overlayStyle={{ minWidth: '200px' }}
              >
                <div className={styles.userDropdown}>
                  <Avatar 
                    size={32} 
                    icon={<UserOutlined />}
                    className={styles.userAvatar}
                  />
                  <div className={styles.userInfo}>
                    <Text className={styles.userName}>
                      {user.name}
                    </Text>
                    <Text className={styles.userRole}>
                      {user.role}
                    </Text>
                  </div>
                </div>
              </Dropdown>
            </div>
          )}
        </Header>
        
        <div className={styles.contentContainer}>
          {children}
        </div>
      </Layout>
      
      {/* CSS Animation for Sparkle Effect */}
      <style jsx global>{`
        @keyframes sparkle {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.2) rotate(180deg); 
            opacity: 0.8; 
          }
        }
      `}</style>
    </>
  );
}


