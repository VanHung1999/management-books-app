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
import { useNotifications } from "../hooks/useNotifications";

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
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 600, color: '#1f1f1f' }}>{user?.name}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{user?.email}</div>
          <div style={{ fontSize: '11px', color: '#bfbfbf', textTransform: 'capitalize' }}>{user?.role}</div>
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
          style={{ width: '100%', textAlign: 'left', height: 'auto', padding: '8px 12px' }}
        >
          Logout
        </Button>
      ),
    },
  ];

  return (
    <>
      <Layout>
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 24px',
          borderBottom: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: '72px',
          overflow: 'hidden'
        }}>
          {/* Logo and Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                flexShrink: 0
              }}>
                <BookOutlined style={{ fontSize: '20px', color: 'white' }} />
              </div>
              <Title level={4} style={{ 
                margin: 0, 
                color: 'black', 
                fontSize: '18px',
                fontWeight: '700',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap'
              }}>
                Management Books System
              </Title>
            </div>
            
            {/* Navigation Menu */}
            <nav style={{ 
              display: 'flex', 
              gap: '6px',
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 12px',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              flexShrink: 0
            }}>
              {navItems.map((item) => (
                <Button
                  key={item.key}
                  type="text"
                  href={item.key}
                  icon={item.icon}
                  style={{ 
                    color: pathname === item.key ? 'white' : 'rgba(255,255,255,0.8)',
                    background: pathname === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    height: '32px',
                    padding: '0 12px',
                    fontWeight: pathname === item.key ? '600' : '400',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px'
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item.key) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item.key) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* User Profile Section */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>

              {/* Notification Bell */}
              <Dropdown
                menu={{
                  items: [{
                    key: 'notifications',
                    label: (
                      <div style={{
                       minWidth: '320px',
                       maxHeight: '400px',
                       overflow: 'auto',
                       background: 'white',
                       borderRadius: '8px',
                       boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                       padding: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '16px',
                          borderBottom: '1px solid #f0f0f0',
                          paddingBottom: '12px'
                        }}>
                          <Text strong style={{ fontSize: '16px' }}>🔔 Notifications</Text>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {unreadCount > 0 && (
                              <Button 
                                type="link" 
                                size="small"
                                onClick={markAllAsRead}
                                style={{ padding: '0', height: 'auto' }}
                              >
                                Mark all as read
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {notifications.length === 0 ? (
                          <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: '#8c8c8c'
                          }}>
                            <BellOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
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
                                  style={{
                                    padding: '12px',
                                    border: `1px solid ${categoryColor}20`,
                                    borderRadius: '6px',
                                    marginBottom: '8px',
                                    background: notification.isRead ? '#fafafa' : '#fff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                  }}
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    if (notification.actionUrl) {
                                      window.location.href = notification.actionUrl;
                                    }
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = notification.isRead ? '#f5f5f5' : `${categoryColor}08`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = notification.isRead ? '#fafafa' : '#fff';
                                  }}
                                >
                                  {/* Priority indicator */}
                                  <div style={{
                                    position: 'absolute',
                                    left: '0',
                                    top: '0',
                                    bottom: '0',
                                    width: '4px',
                                    background: priorityColor,
                                    borderTopLeftRadius: '6px',
                                    borderBottomLeftRadius: '6px'
                                  }} />

                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '4px',
                                    marginLeft: '8px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        background: `${categoryColor}20`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        color: categoryColor
                                      }}>
                                        {notification.category.charAt(0).toUpperCase()}
                                      </div>
                                      <Text strong style={{ 
                                        fontSize: '13px',
                                        color: notification.isRead ? '#8c8c8c' : '#262626'
                                      }}>
                                        {notification.title}
                                      </Text>
                                    </div>
                                    {!notification.isRead && (
                                      <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: priorityColor,
                                        flexShrink: 0
                                      }} />
                                    )}
                                  </div>
                                  
                                  <Text style={{ 
                                    fontSize: '12px',
                                    color: notification.isRead ? '#8c8c8c' : '#595959',
                                    lineHeight: '1.4',
                                    marginLeft: '28px'
                                  }}>
                                    {notification.message}
                                  </Text>

                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '8px',
                                    marginLeft: '28px'
                                  }}>
                                    <Text style={{ 
                                      fontSize: '11px',
                                      color: '#bfbfbf'
                                    }}>
                                      {new Date(notification.timestamp).toLocaleString('vi-VN', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </Text>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <Button
                                        type="text"
                                        size="small"
                                        danger
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          clearNotification(notification.id);
                                        }}
                                        style={{ 
                                          padding: '0', 
                                          height: 'auto',
                                          fontSize: '11px'
                                        }}
                                      >
                                        Clear
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {notifications.length > 5 && (
                              <div style={{
                                textAlign: 'center',
                                padding: '12px',
                                borderTop: '1px solid #f0f0f0',
                                marginTop: '12px'
                              }}>
                                <Text style={{ color: '#8c8c8c', fontSize: '12px' }}>
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
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  >
                    <Badge 
                       count={unreadCount} 
                       size="default" 
                       style={{ 
                         '--antd-badge-color': '#ff4d4f',
                         '--antd-badge-size': '20px'
                       } as any}
                     >
                       <BellOutlined 
                         style={{ 
                           color: 'rgba(255,255,255,0.9)', 
                           fontSize: '20px' 
                         }} 
                       />
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                >
                  <Avatar 
                    size={32} 
                    icon={<UserOutlined />}
                    style={{ 
                      background: 'rgba(255,255,255,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                    <Text style={{ 
                      color: 'white', 
                      fontSize: '13px', 
                      fontWeight: '600',
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.name}
                    </Text>
                    <Text style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      fontSize: '11px',
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.role}
                    </Text>
                  </div>
                </div>
              </Dropdown>
            </div>
          )}
        </Header>
        
        <div style={{ 
          padding: '32px', 
          minHeight: 'calc(100vh - 72px)',
          background: '#f8fafc'
        }}>
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


