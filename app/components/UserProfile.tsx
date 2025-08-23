'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Tag, 
  Row,
  Col,
  Table,
  Statistic,
  Avatar,
  Divider,
  Skeleton,
  App
} from 'antd';
import { 
  UserOutlined, 
  BookOutlined,
  GiftOutlined,
  CalendarOutlined,
  MailOutlined,
  CrownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useList } from '@refinedev/core';
import { User } from '../interface/user';
import { DonationRecord } from '../interface/donationRecord';
import { LoanRecord } from '../interface/loanRecord';

const { Title, Text } = Typography;

interface UserProfileProps {
  currentUserEmail: string;
}

export default function UserProfile({ currentUserEmail }: UserProfileProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { message } = App.useApp();

  // Fetch current user data
  const { data: usersData, isLoading: loadingUsers } = useList<User>({
    resource: "users",
    filters: [
      {
        field: "email",
        operator: "eq",
        value: currentUserEmail,
      },
    ],
  });

  // Fetch donations and loans data
  const { data: donationsData, isLoading: loadingDonations } = useList<DonationRecord>({
    resource: "donationRecords",
  });

  const { data: loansData, isLoading: loadingLoans } = useList<LoanRecord>({
    resource: "loanRecords",
  });

  useEffect(() => {
    if (usersData?.data && usersData.data.length > 0) {
      setCurrentUser(usersData.data[0]);
    }
    setIsLoading(false);
  }, [usersData]);

  // Get user's donations and loans
  const getUserDonations = () => {
    return donationsData?.data?.filter(
      donation => donation.donationerName === currentUserEmail
    ) || [];
  };

  const getUserLoans = () => {
    return loansData?.data?.filter(
      loan => loan.borrowerName === currentUserEmail
    ) || [];
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'user': return 'blue';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (isLoading || loadingUsers) {
    return (
      <div style={{ padding: '24px' }}>
        <Skeleton.Input active size="large" style={{ width: "100%", height: "400px" }} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text type="secondary">User not found or not authenticated.</Text>
      </div>
    );
  }

  const userDonations = getUserDonations();
  const userLoans = getUserLoans();

  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Main Container Card */}
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e8e8e8',
          overflow: 'hidden'
        }}
        styles={{
          header: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderBottom: 'none',
            padding: '24px 32px',
            margin: 0,
            alignContent: 'center'
          },
          body: {
            padding: '32px'
          }
        }}
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '16px',
            color: 'white'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <UserOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ 
                margin: '0 0 4px 0',
                fontSize: '28px',
                fontWeight: '700',
                color: 'white',
                letterSpacing: '0.5px',
                textAlign: 'center'
              }}>
                My Profile
              </h1>
              <p style={{ 
                margin: '0',
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '400'
              }}>
                View your personal information and activity history
              </p>
            </div>
          </div>
        }
      >
        {/* User Profile Header */}
        <Card 
          style={{ 
            marginBottom: '32px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row gutter={[32, 24]} align="middle">
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
                <div style={{ marginTop: '16px' }}>
                  <Tag 
                    color={getRoleColor(currentUser.role)}
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      border: 'none'
                    }}
                  >
                    {currentUser.role === 'admin' ? 'Administrator' : 'Regular User'}
                  </Tag>
                </div>
              </div>
            </Col>
            
            <Col span={18}>
              <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ margin: '0 0 8px 0', color: '#262626' }}>
                  {currentUser.name}
                </Title>
                <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                  {currentUser.email}
                </Text>
              </div>
              
              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Total Donations"
                    value={userDonations.length}
                    prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Loans"
                    value={userLoans.length}
                    prefix={<BookOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Account Status"
                    value={currentUser.status === 'active' ? 'Active' : 'Inactive'}
                    prefix={
                      currentUser.status === 'active' ? 
                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                        <CloseCircleOutlined style={{ color: '#fa8c16' }} />
                    }
                    valueStyle={{ 
                      color: currentUser.status === 'active' ? '#52c41a' : '#fa8c16' 
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* User Activity History */}
        <div style={{ marginBottom: '32px' }}>
          <Title level={3} style={{ marginBottom: '24px', color: '#262626' }}>
            <CalendarOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
            Activity History
          </Title>
          
          <Row gutter={[24, 24]}>
            {/* Donations History */}
            <Col span={12}>
              <Card 
                title={
                  <Space>
                    <GiftOutlined style={{ color: '#52c41a' }} />
                    <span>My Donations ({userDonations.length})</span>
                  </Space>
                }
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f0f0f0'
                }}
                size="small"
              >
                {userDonations.length > 0 ? (
                  <Table
                    dataSource={userDonations}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ y: 200 }}
                    columns={[
                      {
                        title: 'Book Title',
                        dataIndex: 'bookTitle',
                        key: 'bookTitle',
                        width: '40%',
                      },
                      {
                        title: 'Quantity',
                        dataIndex: 'num',
                        key: 'num',
                        width: '20%',
                        align: 'center',
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        width: '25%',
                        align: 'center',
                        render: (status) => (
                          <Tag color={
                            status === 'received' ? 'green' : 
                            status === 'confirmed' ? 'blue' : 
                            status === 'pending' ? 'orange' : 
                            status === 'canceled' ? 'red' : 'default'
                          }>
                            {status}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Date',
                        dataIndex: 'donationDate',
                        key: 'donationDate',
                        width: '15%',
                        align: 'center',
                        render: (date) => formatDate(date.toString()),
                      },
                    ]}
                  />
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: '#8c8c8c'
                  }}>
                    <GiftOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div>No donations yet</div>
                    <Text type="secondary">Start donating books to help others!</Text>
                  </div>
                )}
              </Card>
            </Col>

            {/* Loans History */}
            <Col span={12}>
              <Card 
                title={
                  <Space>
                    <BookOutlined style={{ color: '#1890ff' }} />
                    <span>My Loans ({userLoans.length})</span>
                  </Space>
                }
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f0f0f0'
                }}
                size="small"
              >
                {userLoans.length > 0 ? (
                  <Table
                    dataSource={userLoans}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    scroll={{ y: 200 }}
                    columns={[
                      {
                        title: 'Book Title',
                        dataIndex: 'bookTitle',
                        key: 'bookTitle',
                        width: '40%',
                      },
                      {
                        title: 'Quantity',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        width: '20%',
                        align: 'center',
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        width: '25%',
                        align: 'center',
                        render: (status) => (
                          <Tag color={
                            status === 'completed' ? 'green' : 
                            status === 'received' ? 'blue' : 
                            status === 'delivered' ? 'cyan' : 
                            status === 'pending' ? 'orange' : 
                            status === 'canceled' ? 'red' : 'default'
                          }>
                            {status}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Borrowed',
                        dataIndex: 'borrowedAt',
                        key: 'borrowedAt',
                        width: '15%',
                        align: 'center',
                        render: (date) => formatDate(date.toString()),
                      },
                    ]}
                  />
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: '#8c8c8c'
                  }}>
                    <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div>No loans yet</div>
                    <Text type="secondary">Start borrowing books from the library!</Text>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>

        {/* Account Information */}
        <Card 
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <UserOutlined style={{ fontSize: '14px' }} />
              </div>
              <span>Account Information</span>
            </div>
          }
          style={{ 
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0'
          }}
          size="small"
        >
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e8e8e8'
          }}>
            <Row gutter={[24, 16]}>
              <Col span={8}>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <UserOutlined style={{ 
                      fontSize: '20px', 
                      color: '#1890ff',
                      marginBottom: '4px'
                    }} />
                  </div>
                  <Text strong style={{ 
                    color: '#8c8c8c', 
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Full Name
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: '#262626'
                    }}>
                      {currentUser.name}
                    </Text>
                  </div>
                </div>
              </Col>
              
              <Col span={8}>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <span style={{ color: 'white', fontSize: '16px' }}>✉️</span>
                    </div>
                  </div>
                  <Text strong style={{ 
                    color: '#8c8c8c', 
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Email Address
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <Text copyable style={{ 
                      fontSize: '14px',
                      color: '#1890ff',
                      fontWeight: '500'
                    }}>
                      {currentUser.email}
                    </Text>
                  </div>
                </div>
              </Col>
              
              <Col span={8}>
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <span style={{ color: 'white', fontSize: '16px' }}>👑</span>
                    </div>
                  </div>
                  <Text strong style={{ 
                    color: '#8c8c8c', 
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    User Role
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <Tag 
                      color={getRoleColor(currentUser.role)}
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        border: 'none'
                      }}
                    >
                      {currentUser.role === 'admin' ? 'Administrator' : 'Regular User'}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </Card>
    </div>
  );
}
