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
import { User } from '../interface/user';
import type { ColumnsType } from "antd/es/table";
import { LoanRecord } from '../interface/loanRecord';
import { DonationRecord } from '../interface/donationRecord';
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
            <TeamOutlined style={{ fontSize: '24px', color: 'white' }} />
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
              User Management
            </h1>
            <p style={{ 
              margin: '0',
              fontSize: '16px',
              color: 'rgba(255,255,255,0.9)',
              fontWeight: '400'
            }}>
              Manage all system users and their permissions
            </p>
          </div>
        </div>
      }
    >
      {/* Statistics Cards */}
      {!loadingUsers && (
        <div style={{ 
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {/* Total Users */}
          <Card 
            style={{ 
              textAlign: 'center',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>

          {/* Admin Users */}
          <Card 
            style={{ 
              textAlign: 'center',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Statistic
              title="Admin Users"
              value={adminUsers}
              prefix={<UserOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>

          {/* Regular Users */}
          <Card 
            style={{ 
              textAlign: 'center',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Statistic
              title="Regular Users"
              value={regularUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>

          {/* Active Users */}
          <Card 
            style={{ 
              textAlign: 'center',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0'
            }}
          >
            <Statistic
              title="Active Users"
              value={activeUsers}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>

          {/* Inactive Users */}
          <Card 
            style={{ 
              textAlign: 'center',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0'
            }}
          >
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
            <div style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <TeamOutlined style={{ fontSize: '20px' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, color: '#262626' }}>
                Users Details
              </Title>
              <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                View and manage all system users
              </Text>
            </div>
          </Space>
        }
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e8e8e8'
        }}
        styles={{
          header: {
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderBottom: '2px solid #e8e8e8'
          }
        }}
      >
        {loadingUsers ? (
          <Skeleton.Input active size="large" style={{ width: "100%", height: "400px" }} />
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
            style={{ borderRadius: '8px' }}
          />
        )}
      </Card>

      {/* Edit User Modal */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '8px 0'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <EditOutlined />
            </div>
            <div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#262626',
                marginBottom: '2px'
              }}>
                Edit User
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#8c8c8c',
                fontWeight: '400'
              }}>
                Update user information
              </div>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
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
          <div style={{ 
            marginBottom: '32px',
            padding: '20px',
            background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
            borderRadius: '12px',
            border: '1px solid #b7eb8f'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '16px'
            }}>
              <span style={{ color: '#52c41a', fontSize: '16px' }}>⚙️</span>
              <Text style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#52c41a' 
              }}>
                Account Settings
              </Text>
            </div>
            
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label={
                    <span style={{ fontWeight: '500', color: '#262626' }}>
                      User Role <span style={{ color: '#ff4d4f' }}>*</span>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserOutlined style={{ color: '#1890ff' }} />
                        <span>Regular User</span>
                      </div>
                    </Option>
                    <Option value="admin">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserOutlined style={{ color: '#ff4d4f' }} />
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
                    <span style={{ fontWeight: '500', color: '#262626' }}>
                        Account Status <span style={{ color: '#ff4d4f' }}>*</span>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span>Active</span>
                      </div>
                    </Option>
                    <Option value="inactive">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CloseCircleOutlined style={{ color: '#fa8c16' }} />
                        <span>Inactive</span>
                      </div>
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            padding: '20px 0 0 0',
            borderTop: '1px solid #f0f0f0'
          }}>
            <Button 
              size="large"
              onClick={() => setIsModalVisible(false)}
              style={{
                padding: '0 24px',
                height: '40px',
                borderRadius: '8px',
                fontWeight: '500'
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                padding: '0 32px',
                height: '40px',
                borderRadius: '8px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              Update User
            </Button>
          </div>
        </Form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '8px 0'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <UserOutlined />
            </div>
            <div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#262626',
                marginBottom: '2px'
              }}>
                User Details
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#8c8c8c',
                fontWeight: '400'
              }}>
                {selectedUser?.name} - {selectedUser?.email}
              </div>
            </div>
          </div>
        }
        open={isUserDetailsVisible}
        onCancel={() => setIsUserDetailsVisible(false)}
        footer={null}
        width={1000}
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
                  <span>Basic Information</span>
                </div>
              }
              style={{ 
                marginBottom: '20px',
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
                          {selectedUser.name}
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
                          {selectedUser.email}
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
                          color={getRoleColor(selectedUser.role)}
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            border: 'none'
                          }}
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
              style={{ marginBottom: '20px' }}
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
