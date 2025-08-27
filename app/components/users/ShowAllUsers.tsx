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
  Skeleton,
  Modal,
  Form,
  Tooltip,
  Button,
  App,
  Select
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  BookOutlined,
  GiftOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useList, useUpdate } from '@refinedev/core';
import { User } from '../../types/user';
import type { ColumnsType } from "antd/es/table";
import { LoanRecord } from '../../types/loanRecord';
import { DonationRecord } from '../../types/donationRecord';
import styles from '../../styles/components/users/ShowAllUsers.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

export default function ShowAllUsers() {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUserDetailsVisible, setIsUserDetailsVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {message} = App.useApp();

  const { data: usersData, isLoading: loadingUsers, refetch } = useList<User>({
    resource: "users",
  });

  const { mutateAsync: updateUser } = useUpdate<User>({
    resource: "users",
  });

  const { data: donationsData, isLoading: loadingDonations } = useList<DonationRecord>({
    resource: "donationRecords",
  });

  const { data: loansData, isLoading: loadingLoans } = useList<LoanRecord>({
    resource: "loanRecords",
  });

  // Filter and sort data - newest users first
  const filteredData = usersData?.data?.sort((a, b) => Number(b.id) - Number(a.id)) || [];

  // Calculate statistics
  const totalUsers = filteredData.length;
  const adminUsers = filteredData.filter(user => user.role === 'admin').length;
  const regularUsers = filteredData.filter(user => user.role === 'user').length;
  const activeUsers = filteredData.filter(user => user.status === 'active').length;
  const inactiveUsers = filteredData.filter(user => user.status === 'inactive').length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'user': return 'blue';
      default: return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <UserOutlined style={{ color: '#ff4d4f' }} />;
      case 'user': return <UserOutlined style={{ color: '#1890ff' }} />;
      default: return <UserOutlined />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'inactive': return <CloseCircleOutlined style={{ color: '#fa8c16' }} />;
      default: return <CloseCircleOutlined />;
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

  const showUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsVisible(true);
  };

  const getUserDonations = (userEmail: string) => {
    return donationsData?.data?.filter(
      donation => donation.donationerName === userEmail
    ) || [];
  };

  const getUserLoans = (userEmail: string) => {
    return loansData?.data?.filter(
      loan => loan.borrowerName === userEmail
    ) || [];
  };

  const showModal = (user?: User) => {
    if (user) {
      form.setFieldsValue({
        _user: user,
        role: user.role,
        status: user.status
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any, user: User) => {
    setIsLoading(true);
    try {
    // Update existing user
    const result = await updateUser({
        id: user.id,
        values: {
        role: values.role,
        status: values.status
        }
    });
    message.success('User updated successfully!');
      
    setIsModalVisible(false);
    form.resetFields();
    refetch();
    } catch (error) {
      message.error('Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      align: "center",
      width: 200,
      render: (name, record) => (
        <Space>
          {getRoleIcon(record.role)}
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      width: 250,
      render: (email) => (
        <Text copyable>{email}</Text>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      align: "center",
      width: 120,
      render: (role) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {role === 'admin' ? 'Admin' : 'User'}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status === 'active' ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 140,
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#722ed1" }} />
          <Text>{formatDate(date)}</Text>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 250,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View user details">
            <Button
              type="default"
              icon={<UserOutlined />}
              size="small"
              onClick={() => showUserDetails(record)}
            >
              Details
            </Button>
          </Tooltip>
          <Tooltip title="Edit user">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            >
              Edit
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];


  return (
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
            <TeamOutlined />
          </div>
          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>
              User Management
            </h1>
            <p className={styles.headerSubtitle}>
              Manage all system users and their permissions
            </p>
          </div>
        </div>
      }
    >
      {/* Statistics Cards */}
      {!loadingUsers && (
        <div className={styles.statsGrid}>
          {/* Total Users */}
          <Card className={styles.statCard}>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>

          {/* Admin Users */}
          <Card className={styles.statCard}>
            <Statistic
              title="Admin Users"
              value={adminUsers}
              prefix={<UserOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>

          {/* Regular Users */}
          <Card className={styles.statCard}>
            <Statistic
              title="Regular Users"
              value={regularUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>

          {/* Active Users */}
          <Card className={styles.statCard}>
            <Statistic
              title="Active Users"
              value={activeUsers}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>

          {/* Inactive Users */}
          <Card className={styles.statCard}>
            <Statistic
              title="Inactive Users"
              value={inactiveUsers}
              prefix={<CloseCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </div>
      )}

      {/* Users Table Section */}
      <Card 
        title={
          <Space size="large">
            <div className={styles.tableHeaderIcon}>
              <TeamOutlined />
            </div>
            <div className={styles.tableHeaderText}>
              <Title level={4}>
                Users Details
              </Title>
              <Text>
                View and manage all system users
              </Text>
            </div>
          </Space>
        }
        className={styles.tableCard}
        styles={{
          header: {
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderBottom: '2px solid #e8e8e8'
          }
        }}
      >
        {loadingUsers ? (
          <Skeleton.Input active size="large" className={styles.loadingSkeleton} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} users`,
              style: { marginTop: '16px' }
            }}
            scroll={{ x: 1200 }}
            size="small"
            bordered
            className={styles.usersTable}
          />
        )}
      </Card>

      {/* Edit User Modal */}
      <Modal
        title={
          <div className={styles.editModalTitle}>
            <div className={styles.editModalIcon}>
              <EditOutlined />
            </div>
            <div className={styles.editModalTitleText}>
              <div>
                Edit User
              </div>
              <div>
                Update user information
              </div>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
        className={styles.editModal}
        styles={{
          header: {
            borderBottom: '2px solid #f0f0f0',
            padding: '20px 24px 16px'
          },
          body: {
            padding: '24px'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
          const user = form.getFieldValue('_user');
          handleSubmit(values, user);
          }}
          initialValues={{
            role: 'user',
            status: 'active'
          }}
          size="large"
        >
          {/* Account Settings Section */}
          <div className={styles.accountSettingsSection}>
            <div className={styles.accountSettingsHeader}>
              <span className={styles.accountSettingsIcon}>⚙️</span>
              <Text className={styles.accountSettingsTitle}>
                Account Settings
              </Text>
            </div>
            
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label={
                    <span className={styles.formLabel}>
                      User Role <span className={styles.requiredField}>*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please select the role!' }]}
                >
                  <Select 
                    placeholder="Select user role"
                    style={{ borderRadius: '8px' }}
                    suffixIcon={<UserOutlined style={{ color: '#bfbfbf' }} />}
                  >
                    <Option value="user">
                      <div className={styles.selectOption}>
                        <UserOutlined className={styles.selectOptionIcon} />
                        <span>Regular User</span>
                      </div>
                    </Option>
                    <Option value="admin">
                      <div className={styles.selectOption}>
                        <UserOutlined className={styles.selectOptionIconAdmin} />
                        <span>Administrator</span>
                      </div>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label={
                    <span className={styles.formLabel}>
                        Account Status <span className={styles.requiredField}>*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Please select the status!' }]}
                >
                  <Select 
                    placeholder="Select account status"
                    style={{ borderRadius: '8px' }}
                    suffixIcon={<CheckCircleOutlined style={{ color: '#bfbfbf' }} />}
                  >
                    <Option value="active">
                      <div className={styles.selectOption}>
                        <CheckCircleOutlined className={styles.selectOptionIconActive} />
                        <span>Active</span>
                      </div>
                    </Option>
                    <Option value="inactive">
                      <div className={styles.selectOption}>
                        <CloseCircleOutlined className={styles.selectOptionIconInactive} />
                        <span>Inactive</span>
                      </div>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <Button 
              size="large"
              onClick={() => setIsModalVisible(false)}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              className={styles.updateButton}
            >
              Update User
            </Button>
          </div>
        </Form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        title={
          <div className={styles.userDetailsModalTitle}>
            <div className={styles.userDetailsModalIcon}>
              <UserOutlined />
            </div>
            <div className={styles.userDetailsModalTitleText}>
              <div>
                User Details
              </div>
              <div>
                {selectedUser?.name} - {selectedUser?.email}
              </div>
            </div>
          </div>
        }
        open={isUserDetailsVisible}
        onCancel={() => setIsUserDetailsVisible(false)}
        footer={null}
        width={1000}
        className={styles.userDetailsModal}
        styles={{
          header: {
            borderBottom: '2px solid #f0f0f0',
            padding: '20px 24px 16px'
          },
          body: {
            padding: '24px'
          }
        }}
      >
        {selectedUser && (
          <div>
            {/* User Basic Info */}
            <Card 
              title={
                <div className={styles.basicInfoCardTitle}>
                  <div className={styles.basicInfoCardIcon}>
                    <UserOutlined />
                  </div>
                  <span>Basic Information</span>
                </div>
              }
              className={styles.basicInfoCard}
              size="small"
            >
              <div className={styles.basicInfoContent}>
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoItemIcon}>
                        <UserOutlined />
                      </div>
                      <Text className={styles.infoItemLabel}>
                        Full Name
                      </Text>
                      <div className={styles.infoItemValue}>
                        <Text className={styles.infoItemValueText}>
                          {selectedUser.name}
                        </Text>
                      </div>
                    </div>
                  </Col>
                    
                  <Col span={8}>
                    <div className={styles.infoItem}>
                      <div className={styles.emailIcon}>
                        <span>✉️</span>
                      </div>
                      <Text className={styles.infoItemLabel}>
                        Email Address
                      </Text>
                      <div className={styles.infoItemValue}>
                        <Text copyable className={styles.infoItemValueEmail}>
                          {selectedUser.email}
                        </Text>
                      </div>
                    </div>
                  </Col>
                    
                  <Col span={8}>
                    <div className={styles.infoItem}>
                      <div className={styles.roleIcon}>
                        <span>👑</span>
                      </div>
                      <Text className={styles.infoItemLabel}>
                        User Role
                      </Text>
                      <div className={styles.infoItemValue}>
                        <Tag 
                          color={getRoleColor(selectedUser.role)}
                          className={styles.roleTag}
                        >
                          {selectedUser.role === 'admin' ? 'Administrator' : 'Regular User'}
                        </Tag>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>

            {/* User Donations */}
            <Card 
              title={
                <Space>
                  <GiftOutlined style={{ color: '#52c41a' }} />
                  <span>Donations ({getUserDonations(selectedUser.email).length} {getUserDonations(selectedUser.email).length > 1 ? 'records' : 'record'})</span>
                </Space>
              }
              className={styles.donationsCard}
              size="small"
            >
              {getUserDonations(selectedUser.email).length > 0 ? (
              <Table
                dataSource={getUserDonations(selectedUser.email)}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  {
                    title: 'Book Title',
                    dataIndex: 'bookTitle',
                    key: 'bookTitle',
                  },
                  {
                    title: 'Author',
                    dataIndex: 'author',
                    key: 'author',
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'num',
                    key: 'num',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
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
                    title: 'Donation Date',
                    dataIndex: 'donationDate',
                    key: 'donationDate',
                    render: (date) => formatDate(date.toString()),
                  },
                ]}
              />
              ) : (
              <Text type="secondary">No donations found for this user.</Text>
              )}
            </Card>

            {/* User Loans */}
            <Card 
              title={
                <Space>
                  <BookOutlined style={{ color: '#1890ff' }} />
                  <span>Loans ({getUserLoans(selectedUser.email).length} {getUserLoans(selectedUser.email).length > 1 ? 'records' : 'record'})</span>
                </Space>
              }
              className={styles.loansCard}
              size="small"
            >
              {getUserLoans(selectedUser.email).length > 0 ? (
              <Table
                dataSource={getUserLoans(selectedUser.email)}
                rowKey="id"
                size="small"
                pagination={false}
                columns={[
                  {
                    title: 'Book Title',
                    dataIndex: 'bookTitle',
                    key: 'bookTitle',
                  },
                  {
                    title: 'Quantity',
                    dataIndex: 'quantity',
                    key: 'quantity',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
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
                    title: 'Borrowed At',
                    dataIndex: 'borrowedAt',
                    key: 'borrowedAt',
                    render: (date) => formatDate(date.toString()),
                  },
                  {
                    title: 'Returned At',
                    dataIndex: 'returnedAt',
                    key: 'returnedAt',
                    render: (date) => date ? formatDate(date.toString()) : '-',
                  },
                ]}
              />
              ) : (
              <Text type="secondary">No loans found for this user.</Text>
              )}
            </Card>
          </div>
        )}
      </Modal>
    </Card>
  );
}
