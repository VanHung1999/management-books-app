'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Typography, Space, Divider } from 'antd';
import { BookOutlined, UserOutlined, SwapOutlined, GiftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { User } from './interface/user';
import { Book } from './interface/book';

const { Title, Text } = Typography;

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalTitles: 0,
    totalBooks: 0,
    totalUsers: 0,
  });
  const router = useRouter();

  useEffect(() => {
    let books: Book[] = [];
    let users: User[] = [];
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setCurrentUser(currentUser);  
      books = JSON.parse(localStorage.getItem('management-books-data') || '[]');
      users = JSON.parse(localStorage.getItem('management-users-data') || '[]');
    } catch (error) {
      console.error('Error parsing data from localStorage:', error);
    }

    // Load basic stats (you can replace this with actual API calls)
    // For now, using mock data
    setStats({
      totalTitles: books.length,
      totalBooks: books.reduce((acc, book) => acc + Number(book.num), 0),
      totalUsers: users.length,
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Welcome Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        color: 'white',
        textAlign: 'center'
      }}>
        <Title level={2} style={{ color: 'white', marginBottom: '8px' }}>
          {getGreeting()}, {currentUser?.name || 'User'}! 👋
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
          Welcome to the Book Management System
        </Text>
        {currentUser?.role && (
          <div style={{ 
            marginTop: '16px',
            marginLeft: '16px',
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            display: 'inline-block'
          }}>
            Role: <strong>{currentUser.role.toUpperCase()}</strong>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Titles"
              value={stats.totalTitles}
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Books"
              value={stats.totalBooks}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} md={12}>
          <Card 
            title="Quick Actions" 
            extra={<ClockCircleOutlined />}
            style={{ height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block 
                size="large"
                icon={<BookOutlined />}
                onClick={() => handleNavigation('/books')}
              >
                Browse Books
              </Button>
              <Button 
                block 
                size="large"
                icon={<SwapOutlined />}
                onClick={() => handleNavigation('/loanRecords')}
              >
                View Loan Records
              </Button>
              <Button 
                block 
                size="large"
                icon={<GiftOutlined />}
                onClick={() => handleNavigation('/donations')}
              >
                View Donations
              </Button>
              {currentUser?.role === 'admin' && (
                <Button 
                  block 
                  size="large"
                  icon={<UserOutlined />}
                  onClick={() => handleNavigation('/users')}
                >
                  Manage Users
                </Button>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Recent Activity" 
            style={{ height: '100%' }}
          >
            <div style={{ padding: '16px 0' }}>
              <div>
                <Text strong>🎯 System status</Text>
                <br />
                <Text type="secondary">All systems are running smoothly</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>  

      {/* Features Overview */}
      <Card title="System Features">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <BookOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4}>Book Management</Title>
              <Text type="secondary">
                Add, edit, and organize books with categories and detailed information
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <SwapOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>Loan System</Title>
              <Text type="secondary">
                Track book loans, returns, and manage borrowing history
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <GiftOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '16px' }} />
              <Title level={4}>Donations</Title>
              <Text type="secondary">
                Accept and manage book donations from users
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
