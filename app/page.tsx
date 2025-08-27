'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Typography, Space } from 'antd';
import { BookOutlined, UserOutlined, SwapOutlined, GiftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { User } from './types/user';
import { Book } from './types/book';
import styles from './styles/pages/Home.module.css';

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
    <div className={styles.container}>
      {/* Welcome Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        color: 'white',
        textAlign: 'center'
      }}>
        <Title level={2} className={styles.welcomeTitle}>
          {getGreeting()}, {currentUser?.name || 'User'}! 👋
        </Title>
        <Text className={styles.welcomeText}>
          Welcome to the Book Management System
        </Text>
        {currentUser?.role && (
          <div className={styles.roleBadge}>
            Role: <strong>{currentUser.role.toUpperCase()}</strong>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} className={styles.statsRow}>
        <Col xs={24} sm={12} lg={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="Total Titles"
              value={stats.totalTitles}
              prefix={<BookOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="Total Books"
              value={stats.totalBooks}
              prefix={<UserOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className={styles.statCard}>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined className={styles.statIcon} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className={styles.actionsRow}>
        <Col xs={24} md={12}>
          <Card 
            title="Quick Actions" 
            extra={<ClockCircleOutlined />}
            className={styles.actionCard}
          >
            <Space direction="vertical" className={styles.actionSpace}>
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
            className={styles.activityCard}
          >
            <div className={styles.activityContent}>
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
      <Card title="System Features" className={styles.featuresCard}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div className={styles.featureItem}>
              <BookOutlined className={styles.featureIcon} />
              <Title level={4}>Book Management</Title>
              <Text type="secondary">
                Add, edit, and organize books with categories and detailed information
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className={styles.featureItem}>
              <SwapOutlined className={styles.featureIcon} />
              <Title level={4}>Loan System</Title>
              <Text type="secondary">
                Track book loans, returns, and manage borrowing history
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <div className={styles.featureItem}>
              <GiftOutlined className={styles.featureIcon} />
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
