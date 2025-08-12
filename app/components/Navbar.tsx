"use client";

import { Layout, Button, Badge } from "antd";
import { usePathname } from "next/navigation";
import { useLogout } from "@refinedev/core";
import { LogoutOutlined, BookOutlined, GiftOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Header } = Layout;

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

  return (
    <>
      <Layout>
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: '#fff',
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 style={{ margin: 0, color: '#1677ff', fontSize: '20px' }}>
              Management Books System
            </h1>
            
            <nav style={{ display: 'flex', gap: '16px' }}>
              <Button type="link" href="/" style={{ color: '#666' }}>
                Home
              </Button>
              <Button type="link" href="/books" style={{ color: '#666' }}>
                Books
              </Button>
              <Button type="link" href="/users" style={{ color: '#666' }}>
                Users
              </Button>
            </nav>
          </div>

          {/* User info section - only render when client-side */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontWeight: 600, color: '#333' }}>
                Welcome, {user.name}!
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge count={user.booksLoaned.length} size="small">
                  <BookOutlined style={{ color: '#1677ff' }} />
                </Badge>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Loaned: {user.booksLoaned.length}
                </span>
                <Badge count={user.booksDonated.length} size="small">
                  <GiftOutlined style={{ color: '#52c41a' }} />
                </Badge>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Donated: {user.booksDonated.length}
                </span>
              </div>
              <Button 
                type="primary" 
                danger 
                icon={<LogoutOutlined />}   
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          )}
        </Header>
        
        <div style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </div>
      </Layout>
    </>
  );
}


