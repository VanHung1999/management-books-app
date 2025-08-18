'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Typography, Space, Row, Col, Table, Tag, Tooltip, Skeleton } from 'antd';
import { getCategories } from '../database/categoryDatabase';
import { PlusOutlined, DeleteOutlined, GiftOutlined, UserOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { useCreate, useList, useUpdate } from '@refinedev/core';
import { User } from '../interface/user';
import { DonationRecord } from '../interface/donationRecord';
import { Book } from '../interface/book';
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Donations() {
  const [form] = Form.useForm();
  const categories = getCategories();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { mutate: createDonationRecord } = useCreate(
    {
      resource: "donationRecords",
    }
  );

  const { data: donationRecordData, isLoading: loadingDonationRecords} = useList({
    resource: "donationRecords",
  });

  const { mutate: updateDonationRecord } = useUpdate<DonationRecord>({
    resource: "donationRecords",
  });

  const { data: books, isLoading: bookLoading } = useList<Book>({
    resource: "books",
  });

  const { mutate: updateBook } = useUpdate<Book>({
    resource: "books",
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setCurrentUser(parsedUser);
    }
  }, []);

  const handleSubmit = (values: any) => {
    setIsCreating(true);
    const donationRecords = values.donatedBooks.map((donationRecord: any) => {
      createDonationRecord({
        values:{
          ...donationRecord,
          donationerName: currentUser?.email,
          donationDate: new Date(),
          status: "pending"
        }
      });
    });
    form.resetFields();
    setIsCreating(false);
  };

  const resetAllForms = () => {
    form.resetFields();
  };

  // Filter data based on user role
  const filteredData = !loadingDonationRecords && currentUser?.role === "user" 
    ? donationRecordData?.data?.filter(item => item.donationerName === currentUser.email) 
    : donationRecordData?.data;

  // Calculate statistics
  const totalRecords = filteredData?.length || 0;
  const pendingRecords = filteredData?.filter(item => item.status === "pending").length || 0;
  const confirmedRecords = filteredData?.filter(item => item.status === "confirmed").length || 0;
  const sentRecords = filteredData?.filter(item => item.status === "sent").length || 0;
  const receivedRecords = filteredData?.filter(item => item.status === "received").length || 0;
  const canceledRecords = filteredData?.filter(item => item.status === "canceled").length || 0;
  const processingRecords = pendingRecords + confirmedRecords + sentRecords;

  const getStatusColor = (status: string) => {
    switch (status) { 
      case "pending": return "orange";
      case "confirmed": return "blue";
      case "sent": return "cyan";
      case "received": return "green";
      case "canceled": return "red";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => { 
    switch (status) {
      case "pending": return <ClockCircleOutlined />;
      case "confirmed": return <GiftOutlined />;
      case "sent": return <GiftOutlined />;
      case "received": return <CheckCircleOutlined />;
      case "canceled": return <ClockCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Handle status change
  const handleStatusChange = (recordId: string, newStatus: "confirmed" | "sent" | "received" | "canceled") => {
    const record = donationRecordData?.data?.find(item => item.id === recordId);
    if (record) {
      const updatedRecord: any = { ...record, status: newStatus };
      const now = new Date();
      
      switch (newStatus) {
        case 'confirmed':
          updatedRecord.confirmDate = now;
          updatedRecord.confirmerName = currentUser?.name || 'Unknown';
          break;
        case 'sent':
          updatedRecord.sendDate = now;
          break;
        case 'received':
          updatedRecord.receiveDate = now;
          updatedRecord.receiverName = currentUser?.name || 'Unknown';
          break;
      }
      
      updateDonationRecord({
        id: recordId,
        values: {
          ...updatedRecord
        }
      });

      // If received, add books to the library
      if (newStatus === "received") {
        const book = books?.data?.find(item => item.name === record.bookTitle);
        if (book) {
          updateBook({
            id: book.id,
            values: {
              status: {
                ...book.status,
                available: book.status.available + record.num
              }
            }
          });
        }
      }
      
      // Reload the page
      window.location.reload();
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Donor",
      dataIndex: "donationerName",
      key: "donationerName",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Book Title",
      dataIndex: "bookTitle",
      key: "bookTitle",
      render: (text) => (
        <Space>
          <GiftOutlined style={{ color: "#52c41a" }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
      render: (text) => (
        <Text>{text}</Text>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Tag color="blue" style={{ borderRadius: "6px" }}>
          {category}
        </Tag>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "num",
      key: "num",
      align: "center",
      render: (num) => (
        <Tag color="green" style={{ borderRadius: "6px" }}>
          {num}
        </Tag>
      ),
    },
    {
      title: "ISBN",
      dataIndex: "ISBN",
      key: "ISBN",
      render: (isbn) => (
        <Text code>{isbn}</Text>
      ),
    },
    {
      title: "Publish Year",
      dataIndex: "publishYear",
      key: "publishYear",
      render: (year) => (
        <Text>{year || "-"}</Text>
      ),
    },
    // Only show these columns for admin users
    ...(currentUser?.role === "admin" ? [
      {
        title: "Confirmer",
        dataIndex: "confirmerName",
        key: "confirmerName",
        render: (text: string) => text || "-",
      },
      {
        title: "Receiver",
        dataIndex: "receiverName",
        key: "receiverName",
        render: (text: string) => text || "-",
      }
    ] : []),
    {
      title: "Donated At",
      dataIndex: "donationDate",
      key: "donationDate",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#722ed1" }} />
          <Text>{formatDate(date)}</Text>
        </Space>
      ),
    },
    {
      title: "Confirmed At",
      dataIndex: "confirmDate",
      key: "confirmDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Sent At",
      dataIndex: "sendDate",
      key: "sendDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Received At",
      dataIndex: "receiveDate",
      key: "receiveDate",
      render: (date) => formatDate(date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag 
          color={getStatusColor(status)} 
          icon={getStatusIcon(status)}
          style={{ 
            borderRadius: "6px",
            fontWeight: "500"
          }}
        >
          {status === "pending" && "Pending"}
          {status === "confirmed" && "Confirmed"}
          {status === "sent" && "Sent"}
          {status === "received" && "Received"}
          {status === "canceled" && "Canceled"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 180,
      render: (_, record) => {
        const { status } = record;
        
        // Admin actions
        if (currentUser?.role === "admin") {
          if (status === "pending") {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleStatusChange(record.id, "confirmed")}
                    style={{
                      background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      boxShadow: "0 2px 8px rgba(82, 196, 26, 0.3)",
                      minWidth: "80px",
                      height: "32px"
                    }}
                  >
                    ✅ Confirm
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleStatusChange(record.id, "canceled")}
                    style={{
                      background: "linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      boxShadow: "0 2px 8px rgba(255, 77, 79, 0.3)",
                      minWidth: "80px",
                      height: "32px"
                    }}
                  >
                    ❌ Cancel
                  </Button>
                </div>
                <Text style={{ 
                  color: "#52c41a", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Choose action: Confirm or Cancel
                </Text>
              </div>
            );
          } else if (status === "confirmed" && currentUser?.email === record.donationerName) {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '4px'
              }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleStatusChange(record.id, "sent")}
                  style={{
                    background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(114, 46, 209, 0.3)",
                    minWidth: "100px",
                    height: "32px"
                  }}
                >
                  📦 Send
                </Button>
                <Text style={{ 
                  color: "#722ed1", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Mark as sent
                </Text>
              </div>
            );
          } else if (status === "sent") {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '4px'
              }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleStatusChange(record.id, "received")}
                  style={{
                    background: "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(250, 140, 22, 0.3)",
                    minWidth: "100px",
                    height: "32px"
                  }}
                >
                  🎉 Receive
                </Button>
                <Text style={{ 
                  color: "#fa8c16", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Add books to library
                </Text>
              </div>
            );
          } else if (status === "received") {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '4px'
              }}>
                <div style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                  borderRadius: '8px',
                  border: '2px solid #b7eb8f'
                }}>
                  <Text style={{ 
                    color: "#52c41a", 
                    fontStyle: "italic",
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    🎉 Received
                  </Text>
                </div>
                <Text style={{ 
                  color: "#52c41a", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Books added to library
                </Text>
              </div>
            );
          } else if (status === "canceled") {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '4px'
              }}>
                <div style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)',
                  borderRadius: '8px',
                  border: '2px solid #ffbb96'
                }}>
                  <Text style={{ 
                    color: "#ff4d4f", 
                    fontStyle: "italic",
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    ❌ Canceled
                  </Text>
                </div>
                <Text style={{ 
                  color: "#ff4d4f", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Donation request canceled
                </Text>
              </div>
            );
          } else {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '4px'
              }}>
                <div style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9'
                }}>
                  <Text style={{ 
                    color: "#8c8c8c", 
                    fontStyle: "italic",
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    ⏳ Waiting
                  </Text>
                </div>
                <Text style={{ 
                  color: "#8c8c8c", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Waiting response from customer
                </Text>
              </div>
            );
          }
        }
        
        // User actions - show status info
        else if (currentUser?.role === "user") {
          if (status === "confirmed") {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '4px'
              }}>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleStatusChange(record.id, "sent")}
                  style={{
                    background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(114, 46, 209, 0.3)",
                    minWidth: "100px",
                    height: "32px"
                  }}
                >
                  📦 Send
                </Button>
                <Text style={{ 
                  color: "#722ed1", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Mark as sent
                </Text>
              </div>
            );
          } else if (status === "canceled") {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '4px'
              }}>
                <div style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)',
                  borderRadius: '8px',
                  border: '2px solid #ffbb96'
                }}>
                  <Text style={{ 
                    color: "#ff4d4f", 
                    fontStyle: "italic",
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    ❌ Canceled
                  </Text>
                </div>
                <Text style={{ 
                  color: "#ff4d4f", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Donation request canceled
                </Text>
              </div>
            );
          } else if (status === "received") {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '4px'
              }}>
                <div style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                  borderRadius: '8px',
                  border: '2px solid #b7eb8f'
                }}>
                  <Text style={{ 
                    color: "#52c41a", 
                    fontStyle: "italic",
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    🎉 Received
                  </Text>
                </div>
                <Text style={{ 
                  color: "#52c41a", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Books added to library
                </Text>
              </div>
            );
          } else {
            return (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%',
                gap: '4px'
              }}>
                <div style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                  borderRadius: '8px',
                  border: '1px solid #d9d9d9'
                }}>
                  <Text style={{ 
                    color: "#8c8c8c", 
                    fontStyle: "italic",
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    ⏳ Waiting
                  </Text>
                </div>
                <Text style={{ 
                  color: "#8c8c8c", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Waiting response from admin
                </Text>
              </div>
            );
          }
        }
        
        return null;
      },
    },
  ];

  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '32px 0'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '40px',
          color: 'white',
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
          marginBottom: '32px'
        }}>
          <Title level={1} style={{ 
            color: 'white', 
            margin: '0 0 16px 0',
            fontSize: '48px',
            fontWeight: '800',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            📚 Book Donation Center
          </Title>
          <p style={{ 
            fontSize: '18px', 
            margin: '0',
            opacity: '0.9',
            fontWeight: '400'
          }}>
            Share knowledge by donating books to our community library
          </p>
        </div>
      </div>

      {/* Donation Form Card */}
      <Card style={{ 
        maxWidth: '1000px', 
        margin: '0 auto 48px auto',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: 'none'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
          margin: '-24px -24px 24px -24px',
          padding: '24px',
          borderRadius: '16px 16px 0 0',
          borderBottom: '2px solid #b7eb8f'
        }}>
          <Title level={3} style={{ 
            textAlign: 'center', 
            margin: '0',
            color: '#52c41a',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            🎁 Submit Your Book Donation
          </Title>
        </div>
        
        <Form 
          form={form} 
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
          initialValues={{
            donatedBooks: [{}]
          }}
        >
          <Form.List name="donatedBooks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                                     <Card 
                     key={key} 
                     size="small" 
                     style={{ 
                       marginBottom: '24px', 
                       border: '2px solid #e8f5e8',
                       borderRadius: '12px',
                       boxShadow: '0 4px 16px rgba(82, 196, 26, 0.1)',
                       background: 'linear-gradient(135deg, #fafafa 0%, #f0f9ff 100%)'
                     }}
                     title={
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px',
                         color: '#52c41a',
                         fontWeight: '600'
                       }}>
                         <span style={{ fontSize: '18px' }}>📖</span>
                         <span>Book {name + 1}</span>
                       </div>
                     }
                     extra={
                       fields.length > 1 && (
                         <Button 
                           type="text" 
                           danger 
                           icon={<DeleteOutlined />}
                           onClick={() => remove(name)}
                           style={{
                             borderRadius: '8px',
                             fontWeight: '500'
                           }}
                         >
                           Remove
                         </Button>
                       )
                     }
                   >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'bookTitle']}
                          label="Book Title"
                          rules={[
                            { required: true, message: 'Please enter the book title!' },
                            { min: 2, message: 'The book title must be at least 2 characters!' },
                            { max: 200, message: 'The book title must be less than 200 characters!' }
                          ]}
                        >
                          <Input placeholder="Enter the book title" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'author']}
                          label="Author"
                          rules={[
                            { required: true, message: 'Please enter the author name!' },
                            { min: 2, message: 'The author name must be at least 2 characters!' },
                            { max: 100, message: 'The author name must be less than 100 characters!' }
                          ]}
                        >
                          <Input placeholder="Enter the author name" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'category']}
                          label="Category"
                          rules={[
                            { required: true, message: 'Please select the category!' }
                          ]}
                        >
                          <Select placeholder="Select the category" options={categories.map(category => ({
                            label: category,
                            value: category
                          }))} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'num']}
                          label="Number"
                          rules={[
                            { required: true, message: 'Please enter the number of books!' },
                            { 
                              type: 'number', 
                              min: 1, 
                              transform: (value) => Number(value),
                              message: 'The number of books must be at least 1!' 
                            },
                          ]}
                        >
                          <Input 
                            type="number" 
                            placeholder="Enter the number of books"
                            min={1}
                            max={100}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'ISBN']}
                          label="ISBN"
                          rules={[
                            { required: true, message: 'Please enter the ISBN!' },
                            { 
                              pattern: /^(?:[0-9]{10}|[0-9]{13})$/, 
                              message: 'ISBN must be 10 or 13 digits!' 
                            }
                          ]}
                        >
                          <Input placeholder="Enter the ISBN" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'publishYear']}
                          label="Publish Year"
                        >
                          <Input 
                            type="number" 
                            placeholder="Enter the publish year"
                            min={1900}
                            max={new Date().getFullYear() + 1}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'coverImage']}
                          label="Cover Image"
                          rules={[
                            { 
                              type: 'url', 
                              message: 'The cover image must be a valid URL!' 
                            }
                          ]}
                        >
                          <Input placeholder="Enter the cover image (optional)" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'notes']}
                          label="Notes"
                          rules={[
                            { max: 300, message: 'Notes must be less than 300 characters!' }
                          ]}
                        >
                          <TextArea 
                            rows={2} 
                            placeholder="Enter additional notes (optional)"
                            showCount
                            maxLength={300}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="Description"
                      rules={[
                        { max: 500, message: 'The description must be less than 500 characters!' }
                      ]}
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="Enter the description (optional)"
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>
                  </Card>
                ))}

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                    size="large"
                    style={{ width: '200px' }}
                  >
                    Add Another Book
                  </Button>
                </div>
              </>
            )}
          </Form.List>

          <Form.Item style={{ textAlign: 'center', marginTop: '30px' }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                disabled={isCreating}
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  border: 'none',
                  padding: '0 40px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {isCreating ? 'Submitting...' : 'Submit Donation'}
              </Button>
              <Button 
                onClick={resetAllForms}
                size="large"
                style={{
                  padding: '0 40px',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                Reset All
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

       {/* Donation Records Table */}
       {!loadingDonationRecords && (
         <div style={{ marginTop: '0' }}>
           {/* Statistics Cards */}
           <div style={{ 
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
             gap: '20px',
             marginBottom: '24px'
           }}>
            {/* Total Donations */}
            <div style={{ 
              padding: '20px',
              background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
              borderRadius: '12px',
              border: '2px solid #b7eb8f',
              boxShadow: '0 4px 16px rgba(82, 196, 26, 0.15)',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <h3 style={{ 
                  margin: '0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#52c41a'
                }}>
                  Total Donations
                </h3>
              </div>
              <div style={{ 
                fontSize: '32px',
                fontWeight: '700',
                color: '#52c41a'
              }}>
                {totalRecords}
              </div>
            </div>

            {/* Processing Records */}
            <Tooltip
              title={
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Processing Records Breakdown:</div>
                  <div>• Pending: {pendingRecords}</div>
                  <div>• Confirmed: {confirmedRecords}</div>
                  <div>• Sent: {sentRecords}</div>
                </div>
              }
              placement="top"
              color="#fa8c16"
            >
              <div 
                style={{ 
                  padding: '20px',
                  background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)',
                  borderRadius: '12px',
                  border: '2px solid #ffd591',
                  boxShadow: '0 4px 16px rgba(250, 140, 22, 0.15)',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  cursor: 'help',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <h3 style={{ 
                    margin: '0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#fa8c16'
                  }}>
                    Processing Records
                  </h3>
                </div>
                <div style={{ 
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#fa8c16'
                }}>
                  {processingRecords}
                </div>
                <div style={{ 
                  fontSize: '12px',
                  color: '#d48806',
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}>
                  Hover for details
                </div>
              </div>
            </Tooltip>

            {/* Received */}
            <div style={{ 
              padding: '20px',
              background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
              borderRadius: '12px',
              border: '2px solid #b7eb8f',
              boxShadow: '0 4px 16px rgba(82, 196, 26, 0.15)',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>✅</span>
                <h3 style={{ 
                  margin: '0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#52c41a'
                }}>
                  Received
                </h3>
              </div>
              <div style={{ 
                fontSize: '32px',
                fontWeight: '700',
                color: '#52c41a'
              }}>
                {receivedRecords}
              </div>
            </div>

            {/* Canceled */}
            <div style={{ 
              padding: '20px',
              background: 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)',
              borderRadius: '12px',
              border: '2px solid #ffbb96',
              boxShadow: '0 4px 16px rgba(255, 77, 79, 0.15)',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>❌</span>
                <h3 style={{ 
                  margin: '0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ff4d4f'
                }}>
                  Canceled
                </h3>
              </div>
              <div style={{ 
                fontSize: '32px',
                fontWeight: '700',
                color: '#ff4d4f'
              }}>
                {canceledRecords}
              </div>
            </div>
          </div>

          {/* Table */}
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
                    Donation Records
                  </Title>
                  <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                    Track and manage all book donation transactions
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
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} donations`,
                style: { marginTop: '16px' }
              }}
              scroll={{ x: 1400 }}
              size="middle"
              bordered
              style={{ borderRadius: '8px' }}
            />
          </Card>
        </div>
      )}

       {/* Loading State */}
       {loadingDonationRecords && (
         <div style={{ marginTop: '0' }}>
           <Skeleton.Input active size="large" style={{ width: "200px", height: "32px", marginBottom: '24px' }} />
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px", marginBottom: '24px' }}>
             {[...Array(4)].map((_, index) => (
               <Skeleton key={index} active>
                 <div style={{ height: "120px", padding: "16px" }} />
               </Skeleton>
             ))}
           </div>
           <Skeleton.Input active size="large" style={{ width: "100%", height: "400px" }} />
         </div>
       )}
    </div>
  );
}
