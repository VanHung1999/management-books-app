'use client';

import React, { useState } from 'react';
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
  App,
  Input,
  Button,
  message
} from 'antd';
import { 
  UserOutlined, 
  BookOutlined,
  GiftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useList, useUpdate } from '@refinedev/core';
import { User } from '../interface/user';
import { DonationRecord } from '../interface/donationRecord';
import { LoanRecord } from '../interface/loanRecord';
import styles from '../styles/components/UserProfile.module.css';

const { Title, Text } = Typography;
const { Password } = Input;

interface UserProfileProps {
  currentUser: User;
}

export default function UserProfile({ currentUser }: UserProfileProps) {
  const { message: appMessage } = App.useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [editedName, setEditedName] = useState(currentUser.name);
  const [editedPassword, setEditedPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { mutateAsync: updateUser } = useUpdate<User>();

  // Fetch donations and loans data
  const { data: donationsData, isLoading: loadingDonations } = useList<DonationRecord>({
    resource: "donationRecords",
  });

  const { data: loansData, isLoading: loadingLoans } = useList<LoanRecord>({
    resource: "loanRecords",
  });

  // Get user's donations and loans
  const getUserDonations = () => {
    return donationsData?.data?.filter(
      donation => donation.donationerName === currentUser.email
    ) || [];
  };

  const getUserLoans = () => {
    return loansData?.data?.filter(
      loan => loan.borrowerName === currentUser.email
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle name editing
  const handleEditName = () => {
    setIsEditingName(true);
    setEditedName(currentUser.name);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      appMessage.error('Tên không được để trống!');
      return;
    }

    await updateUser({
      resource: "users",
      id: currentUser.id,
      values: {
        name: editedName.trim()
      }
    }, {
      onSuccess: () => {
        appMessage.success('Update name successfully!');
        setIsEditingName(false);
        
        // Update local state
        currentUser.name = editedName.trim();
        
        // Update localStorage so Navbar can reflect the change immediately
        try {
          if (typeof window !== 'undefined') {
            const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            currentUserData.name = editedName.trim();
            localStorage.setItem('currentUser', JSON.stringify(currentUserData));
            
            // Dispatch custom event to notify Navbar to update
            window.dispatchEvent(new CustomEvent('userUpdated'));
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      },
      onError: () => {
        appMessage.error('Error updating name!');
      }
    });
  };

  const handleCancelName = () => {
    setIsEditingName(false);
    setEditedName(currentUser.name);
  };

  // Handle password editing
  const handleEditPassword = () => {
    setIsEditingPassword(true);
    setEditedPassword('');
    setConfirmPassword('');
  };

  const handleSavePassword = async () => {
    if (!editedPassword.trim()) {
      appMessage.error('Password cannot be empty!');
      return;
    }

    if (editedPassword.length <= 6) {
      appMessage.error('Password must be longer than 6 characters!');
      return;
    }

    // Check if password contains both letters and numbers (letters/numbers only)
    const hasLetters = /[a-zA-Z]/.test(editedPassword);
    const hasNumbers = /[0-9]/.test(editedPassword);

    if (!hasLetters || !hasNumbers) {
      appMessage.error('Password must contain both letters and numbers!');
      return;
    }

    if (editedPassword !== confirmPassword) {
      appMessage.error('Confirm password does not match!');
      return;
    }

    await updateUser({
      resource: "users",
      id: currentUser.id,
      values: {
        password: editedPassword.trim()
      }
    }, {
      onSuccess: () => {
        appMessage.success('Update password successfully!');
        setIsEditingPassword(false);
        setEditedPassword('');
        setConfirmPassword('');
        // Update local state
        currentUser.password = editedPassword.trim();
      },
      onError: () => {
        appMessage.error('Error updating password!');
      }
    });
  };

  const handleCancelPassword = () => {
    setIsEditingPassword(false);
    setEditedPassword('');
    setConfirmPassword('');
  };

  const userDonations = getUserDonations();
  const userLoans = getUserLoans();

  return (
    <div className={styles.mainContainer}>
      {/* Main Container Card */}
      <Card
        className={styles.mainCard}
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
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <UserOutlined />
            </div>
            <div className={styles.headerText}>
              <h1 className={styles.headerTitle}>
                My Profile
              </h1>
              <p className={styles.headerSubtitle}>
                View your personal information and activity history
              </p>
            </div>
          </div>
        }
      >
        {/* User Profile Header */}
        <Card 
          className={styles.profileHeaderCard}
          styles={{ body: { padding: '32px' } }}
        >
          <Row gutter={[32, 24]} align="middle">
            <Col span={6}>
              <div style={{ textAlign: 'center' }}>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />}
                  className={styles.profileAvatar}
                />
                <div style={{ marginTop: '16px' }}>
                  <Tag 
                    color={getRoleColor(currentUser.role)}
                    className={styles.profileRoleTag}
                  >
                    {currentUser.role === 'admin' ? 'Administrator' : 'Regular User'}
                  </Tag>
                </div>
              </div>
            </Col>
            
            <Col span={18}>
              <div style={{ marginBottom: '24px' }}>
                <Title level={2} className={styles.profileName}>
                  {currentUser.name}
                </Title>
                <Text className={styles.profileEmail}>
                  {currentUser.email}
                </Text>
              </div>
              
              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <Statistic
                    title="Total Donations Record"
                    value={userDonations.length}
                    prefix={<GiftOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Loans Record"
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
        <div className={styles.activityHistorySection}>
          <Title level={3} className={styles.activityHistoryTitle}>
            <CalendarOutlined className={styles.activityHistoryTitleIcon} />
            Activity History
          </Title>
          
          <Row gutter={[24, 24]}>
            {/* Donations History */}
            <Col span={12}>
              <Card 
                title={
                  <Space>
                    <GiftOutlined className={styles.activityCardTitleIcon} />
                    <span>My Donations ({userDonations.length})</span>
                  </Space>
                }
                className={styles.activityCard}
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
                            status === "sent" ? 'purple' :
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
                  <div className={styles.emptyState}>
                    <GiftOutlined className={styles.emptyStateIcon} />
                    <div className={styles.emptyStateText}>No donations yet</div>
                    <Text className={styles.emptyStateSubtext}>Start donating books to help others!</Text>
                  </div>
                )}
              </Card>
            </Col>

            {/* Loans History */}
            <Col span={12}>
              <Card 
                title={
                  <Space>
                    <BookOutlined className={styles.activityCardTitleIconLoans} />
                    <span>My Loans ({userLoans.length})</span>
                  </Space>
                }
                className={styles.activityCard}
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
                            status === 'returned' ? 'purple' :
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
                  <div className={styles.emptyState}>
                    <BookOutlined className={styles.emptyStateIcon} />
                    <div className={styles.emptyStateText}>No loans yet</div>
                    <Text className={styles.emptyStateSubtext}>Start borrowing books from the library!</Text>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>

        {/* Account Information */}
        <Card 
          title={
            <div className={styles.accountInfoCardTitle}>
              <div className={styles.accountInfoCardIcon}>
                <UserOutlined />
              </div>
              <span>Account Information</span>
            </div>
          }
          className={styles.accountInfoCard}
          size="small"
        >
          <div className={styles.accountInfoContent}>
            <Row gutter={[24, 16]}>
              {/* Full Name */}
              <Col span={12}>
                <div className={styles.infoItem}>
                  <div className={styles.infoItemIcon}>
                    <UserOutlined />
                  </div>
                  <Text className={styles.infoItemLabel}>
                    Full Name
                  </Text>
                  <div className={styles.infoItemValue}>
                    {isEditingName ? (
                      <div className={styles.editForm}>
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          size="small"
                          className={styles.editInput}
                        />
                        <div className={styles.editButtons}>
                          <Button
                            type="primary"
                            size="small"
                            icon={<SaveOutlined />}
                            onClick={handleSaveName}
                            className={styles.editButton}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelName}
                            className={styles.editButtonCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.displayContainer}>
                        <Text className={styles.infoItemValueText}>
                          {currentUser.name}
                        </Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={handleEditName}
                          className={styles.editButtonSmall}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Col>

              {/* Password */}
              <Col span={12}>
                <div className={styles.infoItem}>
                  <div className={styles.passwordIcon}>
                    <span>🔒</span>
                  </div>
                  <Text className={styles.infoItemLabel}>
                    Password
                  </Text>
                  <div className={styles.infoItemValue}>
                    {isEditingPassword ? (
                      <div className={styles.editForm}>
                        <Password
                          placeholder="Enter new password"
                          value={editedPassword}
                          onChange={(e) => setEditedPassword(e.target.value)}
                          size="small"
                          className={styles.editInput}
                        />
                        <Password
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          size="small"
                          className={styles.editInput}
                        />
                        <div className={styles.editButtons}>
                          <Button
                            type="primary"
                            size="small"
                            icon={<SaveOutlined />}
                            onClick={handleSavePassword}
                            className={styles.editButton}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={handleCancelPassword}
                            className={styles.editButtonCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.displayContainer}>
                        <div className={styles.passwordDisplay}>
                          <Text className={styles.passwordText}>
                            {showPassword ? currentUser.password : '••••••••'}
                          </Text>
                          <Button
                            type="text"
                            size="small"
                            icon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            onClick={togglePasswordVisibility}
                            className={styles.passwordToggleButton}
                          />
                        </div>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={handleEditPassword}
                          className={styles.editButtonSmall}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
              {/* Email Address */}
              <Col span={12}>
                <div className={styles.infoItem}>
                  <div className={styles.emailIcon}>
                    <span>✉️</span>
                  </div>
                  <Text className={styles.infoItemLabel}>
                    Email Address
                  </Text>
                  <div className={styles.infoItemValue}>
                    <Text copyable className={styles.infoItemValueEmail}>
                      {currentUser.email}
                    </Text>
                  </div>
                </div>
              </Col>
              
              {/* User Role */}
              <Col span={12}>
                <div className={styles.infoItem}>
                  <div className={styles.roleIcon}>
                    <span>👑</span>
                  </div>
                  <Text className={styles.infoItemLabel}>
                    User Role
                  </Text>
                  <div className={styles.infoItemValue}>
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
