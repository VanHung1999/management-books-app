"use client";

import { Layout, Button, Badge, Avatar, Dropdown, Space, Typography } from "antd";
import { usePathname } from "next/navigation";
import { useLogout } from "@refinedev/core";
import { 
  LogoutOutlined, 
  BookOutlined, 
  GiftOutlined, 
  HomeOutlined,
  UserOutlined,
  FileTextOutlined,
  HeartOutlined,
  MenuOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Header } = Layout;
const { Text, Title } = Typography;

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  booksLoaned: any[];
  booksDonated: any[];
}

export default function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mutate: logout } = useLogout();
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage
  useEffect(() => {
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
  }, []);

  const hideOnPaths = ["/login", "/register", "/forgot-password"];
  const shouldHideNavbar = hideOnPaths.includes(pathname);

  if (shouldHideNavbar) {
    return <>{children}</>;
  }

  const navItems = [
    { key: '/', label: 'Home', icon: <HomeOutlined /> },
    { key: '/books', label: 'Books', icon: <BookOutlined /> },
    { key: '/users', label: 'Users', icon: <UserOutlined /> },
    { key: '/loans', label: 'Loans', icon: <FileTextOutlined /> },
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
          padding: '0 32px',
          borderBottom: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: '72px'
        }}>
          {/* Logo and Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <BookOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
              <Title level={3} style={{ 
                margin: 0, 
                color: 'black', 
                fontSize: '22px',
                fontWeight: '700',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Management Books System
              </Title>
            </div>
            
            {/* Navigation Menu */}
            <nav style={{ 
              display: 'flex', 
              gap: '8px',
              background: 'rgba(255,255,255,0.1)',
              padding: '8px 16px',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
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
                    borderRadius: '12px',
                    height: '40px',
                    padding: '0 16px',
                    fontWeight: pathname === item.key ? '600' : '400',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* User Stats */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                background: 'rgba(255,255,255,0.1)',
                padding: '12px 20px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge count={user.booksLoaned.length} size="small" style={{ 
                    '--antd-badge-color': '#52c41a',
                    '--antd-badge-size': '20px'
                  } as any}>
                    <BookOutlined style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }} />
                  </Badge>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
                    {user.booksLoaned.length}
                  </Text>
                </div>
                
                <div style={{ 
                  width: '1px', 
                  height: '20px', 
                  background: 'rgba(255,255,255,0.3)' 
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge count={user.booksDonated.length} size="small" style={{ 
                    '--antd-badge-color': '#fa8c16',
                    '--antd-badge-size': '20px'
                  } as any}>
                    <GiftOutlined style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }} />
                  </Badge>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
                    {user.booksDonated.length}
                  </Text>
                </div>
              </div>

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
                  gap: '12px',
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                >
                  <Avatar 
                    size={36} 
                    icon={<UserOutlined />}
                    style={{ 
                      background: 'rgba(255,255,255,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text style={{ 
                      color: 'white', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      lineHeight: '1.2'
                    }}>
                      {user.name}
                    </Text>
                    <Text style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      fontSize: '12px',
                      lineHeight: '1.2'
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
    </>
  );
}


