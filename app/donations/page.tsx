'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, Input, Select, Button, Card, Typography, Space, Row, Col, Table, Tag, Tooltip, Skeleton, App } from 'antd';
import { getCategories } from '../database/categoryDatabase';
import { PlusOutlined, DeleteOutlined, GiftOutlined, UserOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined, CloseOutlined } from '@ant-design/icons';
import { useCreate, useList, useUpdate } from '@refinedev/core';
import { User } from '../interface/user';
import { DonationRecord } from '../interface/donationRecord';
import { Book } from '../interface/book';
import type { ColumnsType } from "antd/es/table";
import { 
  renderDonationActionButton, 
  renderDonationStatusDisplay, 
  renderDonationActionContainer, 
  renderDonationSingleAction,
  DONATION_ACTION_CONFIGS,
  DONATION_STATUS_CONFIGS
} from '../components/DonationActionComponents';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Donations() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const categories = getCategories();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({}); // Track input values
  const [filePreviewUrls, setFilePreviewUrls] = useState<{[key: string]: string}>({}); // Track file preview URLs
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [checkboxStates, setCheckboxStates] = useState<{[key: number]: boolean}>({});
  const [validateBookTitle, setValidateBookTitle] = useState<{[key: number]: {canSubmit: boolean, message: string }}>({});

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

  const { mutate: createBook } = useCreate<Book>({
    resource: "books",
  });

  const { data: booksData } = useList<Book>({
    resource: "books",
  });

  const { mutate: updateBook } = useUpdate<Book>({
    resource: "books",
  });

  const handleBookTitleValidation = (value: string, name: number, checkboxValue?: boolean) => {
    // Use passed checkboxValue if provided, otherwise fall back to state
    const currentCheckboxValue = checkboxValue !== undefined ? checkboxValue : checkboxStates[name];
    const trimmedTitle = value.trim();

    const currentFormBooks = form.getFieldValue('donatedBooks') || [];
    const duplicateInForm = currentFormBooks.find((book: any, index: number) => 
      index !== name && 
      book.bookTitle && 
      book.bookTitle.trim().toLowerCase() === trimmedTitle.toLowerCase()
    );
    const hasExistinginLibrary = booksData?.data?.some(book => book.name === trimmedTitle);

    const hasExistinginDonationForm = donationRecordData?.data?.some(donation => donation.bookTitle === trimmedTitle);
    if (duplicateInForm) {
      setValidateBookTitle(prev => ({ ...prev, [name]: { canSubmit: false, message: 'This book already exists in the current donation form!' } }));
      return;
    }

    if (hasExistinginDonationForm) {
      const donationRecord = donationRecordData?.data?.find(donation => donation.bookTitle === trimmedTitle);
      if ((donationRecord?.status === "pending" || donationRecord?.status === "confirmed" || donationRecord?.status === "sent") && !hasExistinginLibrary) {
        setValidateBookTitle(prev => ({ ...prev, [name]: { canSubmit: false, message: 'This book doesn\'t exist in the library but in the process to be added!' } }));
        return;
      }
    }

    if (hasExistinginLibrary && !currentCheckboxValue) {
      setValidateBookTitle(prev => ({ ...prev, [name]: { canSubmit: false, message: 'This book already exists in the library!' } }));
      return;
    }

    if (!hasExistinginLibrary && currentCheckboxValue) {
      setValidateBookTitle(prev => ({ ...prev, [name]: { canSubmit: false, message: 'This book doesn\'t exist in the library' } }));
      return;
    }

    setValidateBookTitle(prev => ({ ...prev, [name]: { canSubmit: true, message: '' } }));
    return;
    
  };



  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setCurrentUser(parsedUser);
    }
  }, []);

  // Cleanup file preview URLs on unmount
  useEffect(() => {
    return () => {
      // Revoke all object URLs to prevent memory leaks
      Object.values(filePreviewUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [filePreviewUrls]);

  const handleSubmit = (values: any) => {

    // Check for duplicate books before submitting    
    setIsCreating(true);
    let successCount = 0;
    let totalCount = values.donatedBooks.length;
    
    const donationRecords = values.donatedBooks.map((donationRecord: any) => {
      // Handle file upload - convert to base64 if it's a file
      if (donationRecord.coverImageFile) {
        // Convert file to base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          createDonationRecord({  
            values: {
              ...donationRecord,
              coverImage: base64String,
              donationerName: currentUser?.email,
              donationDate: new Date(),
              status: "pending"
            }
          });
          successCount++;
          if (successCount === totalCount) {
            message.success(`Successfully submitted ${totalCount} book donation(s)!`);
            form.resetFields();
            setIsCreating(false);
          }
        };
        reader.readAsDataURL(donationRecord.coverImageFile);
      } else {
        // Use URL directly
        createDonationRecord({
          values: {
            ...donationRecord,
            donationerName: currentUser?.email,
            donationDate: new Date(),
            status: "pending"
          }
        });
        successCount++;
        if (successCount === totalCount) {
          message.success(`Successfully submitted ${totalCount} book donation(s)!`);
          form.resetFields();
          setIsCreating(false);
        }
      }
    });
    
    // Fallback reset in case of errors
    setTimeout(() => {
      if (isCreating) {
        form.resetFields();
        setIsCreating(false);
        message.info('Form reset. Please check if all donations were submitted successfully.');
      }
    }, 5000);
  };

  const resetAllForms = () => {
    form.resetFields();
    // Clean up all preview URLs when resetting
    Object.values(filePreviewUrls).forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setFilePreviewUrls({});
    setInputValues({});
    setCheckboxStates({});
    setValidateBookTitle({});
  };

  // Handle file upload with preview
  const handleFileUpload = useCallback((file: File, name: number) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('File size must be less than 5MB');
      return false;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file');
      return false;
    }
    
    // Set file and clear URL input
    form.setFieldValue(['donatedBooks', name, 'coverImageFile'], file);
    form.setFieldValue(['donatedBooks', name, 'coverImage'], '');
    setInputValues(prev => ({ ...prev, [`cover-${name}`]: '' }));
    
    // Create and store preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrls(prev => ({
      ...prev,
      [`preview-${name}`]: previewUrl
    }));
    
    message.success('File uploaded successfully!');
    return true;
  }, [form, message, setInputValues, setFilePreviewUrls]);

  // Filter data based on user role
  const filteredData = !loadingDonationRecords && currentUser?.role === "user" 
  ? (donationRecordData?.data?.filter(item => item.donationerName === currentUser.email) || []).sort((a, b) => Number(b.id) - Number(a.id))
  : (donationRecordData?.data || []).sort((a, b) => Number(b.id) - Number(a.id));

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
  const handleStatusChange = (recordId: string, newStatus: "confirmed" | "sent" | "received" | "canceled", hasExistinginLibrary: boolean) => {
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
        if (!hasExistinginLibrary) {
          createBook({
            values: {
              name: record.bookTitle,
              author: record.author,
              category: record.category,
              num: record.num,
              coverImage: record.coverImage,
              description: record.description,
              publishYear: record.publishYear,
            }
          });
        } else {
            const book = booksData?.data?.find(book => book.name === record.bookTitle);
            updateBook({
              id: book?.id,
              values: {
                num: Number(book?.num) + Number(record.num),
                status: {
                  ...book?.status,
                  available: Number(book?.status.available) + Number(record.num),
                }
              }
            });
        }
      }
      
      // Reload the page
      window.location.reload();
    }
  };

  // Get action configuration based on status and user role
  const getDonationActionConfig = (record: any) => {
    const { status } = record;
    
    // Admin actions
    if (currentUser?.role === "admin") {
      if (status === "pending") {
        return renderDonationActionContainer([
          renderDonationActionButton({
            ...DONATION_ACTION_CONFIGS.confirm,
            onClick: () => handleStatusChange(record.id, "confirmed", record.hasExist)
          }),
          renderDonationActionButton({
            ...DONATION_ACTION_CONFIGS.cancel,
            onClick: () => handleStatusChange(record.id, "canceled", record.hasExist)
          })
        ], "Choose action: Confirm or Cancel", "#52c41a");
      } else if (status === "sent") {
        return renderDonationSingleAction(
          renderDonationActionButton({
            ...DONATION_ACTION_CONFIGS.receive,
            onClick: () => handleStatusChange(record.id, "received", record.hasExist)
          }),
          "Add books to library",
          "#fa8c16"
        );
      }
    }
    
    // User actions for confirmed status
    if (status === "confirmed" && currentUser?.email === record.donationerName) {
      return renderDonationSingleAction(
        renderDonationActionButton({
          ...DONATION_ACTION_CONFIGS.send,
          onClick: () => handleStatusChange(record.id, "sent", record.hasExist)
        }),
        "Mark as sent",
        "#722ed1"
      );
    }
    
    // Status displays for received
    if (status === "received") {
      return renderDonationStatusDisplay(DONATION_STATUS_CONFIGS.received);
    }
    
    // Status displays for canceled
    if (status === "canceled") {
      return renderDonationStatusDisplay(DONATION_STATUS_CONFIGS.canceled);
    }
    
    // Default waiting status
    return renderDonationStatusDisplay({
      ...DONATION_STATUS_CONFIGS.waiting,
      text: "⏳ Waiting",
      description: currentUser?.role === "admin" 
        ? "Waiting response from customer" 
        : "Waiting response from admin"
    });
  };

    const columns: ColumnsType<any> = [
    {
      title: "Donor",
      dataIndex: "donationerName",
      key: "donationerName",
      align: "center",
      width: 220,
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
      align: "center",
      width: 250,
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
      align: "center",
      width: 160,
      render: (text) => (
        <Text>{text}</Text>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      align: "center",
      width: 200,
      render: (category) => (
        <Tag color="blue" style={{ borderRadius: "6px" }}>
          {category}
        </Tag>
      ),
    },
    {
      title: "Qty",
      dataIndex: "num",
      key: "num",
      align: "center",
      width: 80,
      render: (num) => (
        <Tag color="green" style={{ borderRadius: "6px" }}>
          {num}
        </Tag>
      ),
    },
    {
      title: "Published Year",
      dataIndex: "publishYear",
      key: "publishYear",
      align: "center",
      width: 140,
      render: (year) => (
        <Text>{year || "-"}</Text>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      align: "center",
      width: 300,
      render: (notes) => (
        notes ? (
          <Text style={{ 
            display: 'block',
            wordBreak: 'break-word',
            whiteSpace: 'normal'
          }}>
            {notes}
          </Text>
        ) : (
          <Text type="secondary" style={{ fontStyle: 'italic' }}>-</Text>
        )
      ),
    },
    {
      title: "Cover Image",
      dataIndex: "coverImage",
      key: "coverImage",
      width: 120,
      align: "center",
      render: (coverImage) => (
        coverImage ? (
          <Tooltip title="Click to view full size">
            <img
              src={coverImage}
              alt="Book Cover"
              style={{
                width: '50px',
                height: '65px',
                objectFit: 'cover',
                borderRadius: '6px',
                border: '2px solid #e8e8e8',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.transform = 'scale(1)';
              }}
              onClick={() => {
                setPreviewImage(coverImage);
                setIsPreviewVisible(true);
              }}
            />
          </Tooltip>
        ) : (
          <Tooltip title="No cover image available">
            <div style={{
              width: '100px',
              height: '65px',
              background: '#f5f5f5',
              borderRadius: '6px',
              border: '2px dashed #d9d9d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8c8c8c',
              fontSize: '10px'
            }}>
              No Image
            </div>
          </Tooltip>
        )
      ),
    },
    // Only show these columns for admin users
    ...(currentUser?.role === "admin" ? [
      {
        title: "Confirmer",
        dataIndex: "confirmerName",
        key: "confirmerName",
        width: 120,
        align: "center" as const,
        render: (text: string) => (
          <Text>{text || "-"}</Text>
        ),
      },
      {
        title: "Receiver",
        dataIndex: "receiverName",
        key: "receiverName",
        width: 120,
        align: "center" as const,
        render: (text: string) => (
          <Text>{text || "-"}</Text>
        ),
      }
    ] : []),
    {
      title: "Donated At",
      dataIndex: "donationDate",
      key: "donationDate",
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
      title: "Confirmed At",
      dataIndex: "confirmDate",
      key: "confirmDate",
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
      title: "Sent At",
      dataIndex: "sendDate",
      key: "sendDate",
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
      title: "Received At",
      dataIndex: "receiveDate",
      key: "receiveDate",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
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
      width: 200,
      fixed: "right",
      render: (_, record) => getDonationActionConfig(record),
    },
  ];

  return (
    <div style={{ 
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
        
       {/* Donation Form Section */}
        <div style={{ 
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: '#fafafa',
          borderRadius: '16px',
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
        }}>
          {/* Section Header */}
          <div style={{ 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <h2 style={{ 
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#262626',
              letterSpacing: '0.5px'
            }}>
              🎁 Submit Your Book Donation
            </h2>
            <p style={{ 
              margin: '0',
              fontSize: '14px',
              color: '#8c8c8c',
              fontStyle: 'italic'
            }}>
              Submit your book donations to help expand our library collection
            </p>
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
                        border: '1px solid #e8e8e8',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        background: '#ffffff'
                      }}
                      title={
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: '#262626',
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
                                onClick={() => {
                                  // Clean up all related states for this field BEFORE removing
                                  setCheckboxStates(prev => {
                                    const newState = { ...prev };
                                    delete newState[name];
                                    return newState;
                                  });
                                  
                                  setValidateBookTitle(prev => {
                                    const newState = { ...prev };
                                    delete newState[name];
                                    return newState;
                                  });
                                  
                                  setInputValues(prev => {
                                    const newState = { ...prev };
                                    delete newState[`cover-${name}`];
                                    return newState;
                                  });
                                  
                                  // Clean up file preview URL
                                  if (filePreviewUrls[`preview-${name}`]) {
                                    URL.revokeObjectURL(filePreviewUrls[`preview-${name}`]);
                                    setFilePreviewUrls(prev => {
                                      const newUrls = { ...prev };
                                      delete newUrls[`preview-${name}`];
                                      return newUrls;
                                    });
                                  }
                                  
                                  // Remove the field from form AFTER cleaning up states
                                  remove(name);
                                }}
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
                      <Row gutter={24}>
                        <Col span={12}>
                          <Form.Item
                              {...restField}
                              name={[name, 'bookTitle']}
                              label="Book Title"
                              validateStatus={
                                validateBookTitle[name]?.canSubmit === false
                                  ? 'error' 
                                  : undefined
                              }
                              help={
                                validateBookTitle[name]?.canSubmit === false
                                  ? validateBookTitle[name]?.message
                                  : undefined
                              }
                             rules={[
                                { required: true, message: 'Please enter the book title!' },
                                { min: 2, message: 'The book title must be at least 2 characters!' },
                                { max: 200, message: 'The book title must be less than 200 characters!' }
                            ]}
                           >
                            <Input 
                              placeholder="Enter the book title" 
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value && value.trim().length >= 2) {
                                  handleBookTitleValidation(value, name);
                                }
                              }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'author']}
                            label="Author"
                            rules={[
                               { 
                                  required: !checkboxStates[name], 
                                  message: 'Please enter the author name!' 
                               },
                               { min: 2, message: 'The author name must be at least 2 characters!' },
                               { max: 100, message: 'The author name must be less than 100 characters!' }
                            ]}
                          >
                              <Input 
                                placeholder="Enter the author name" 
                                disabled={checkboxStates[name] || false}
                              />
                          </Form.Item>
                        </Col>
                      </Row>

                      {/* Checkbox below Book Title */}
                      <Row gutter={24}>
                        <Col span={24}>
                          <Form.Item
                            {...restField}
                            name={[name, 'hasExist']}
                            valuePropName="checked"
                          >
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                style={{ width: '16px', height: '16px' }}
                                  onChange={(e) => {
                                    // Update form value
                                    form.setFieldValue(['donatedBooks', name, 'hasExist'], e.target.checked);
                                    
                                    // Update local state to trigger re-render
                                    setCheckboxStates(prev => ({
                                      ...prev,
                                      [name]: e.target.checked
                                    }));
                                    
                                    if (e.target.checked) {
                                     // If checked, clear other fields except book title
                                     form.setFieldValue(['donatedBooks', name, 'author'], '');
                                     form.setFieldValue(['donatedBooks', name, 'category'], undefined);
                                     form.setFieldValue(['donatedBooks', name, 'num'], '');
                                     form.setFieldValue(['donatedBooks', name, 'publishYear'], '');
                                     form.setFieldValue(['donatedBooks', name, 'notes'], '');
                                     form.setFieldValue(['donatedBooks', name, 'description'], '');
                                     form.setFieldValue(['donatedBooks', name, 'coverImage'], '');
                                     form.setFieldValue(['donatedBooks', name, 'coverImageFile'], null);
                                     
                                     // Clear file preview
                                     if (filePreviewUrls[`preview-${name}`]) {
                                       URL.revokeObjectURL(filePreviewUrls[`preview-${name}`]);
                                       setFilePreviewUrls(prev => {
                                         const newUrls = { ...prev };
                                         delete newUrls[`preview-${name}`];
                                         return newUrls;
                                       });
                                     }
                                     
                                     // Clear input values
                                     setInputValues(prev => ({ ...prev, [`cover-${name}`]: '' }));
                                     
                                    }

                                    // Use the new checkbox value directly instead of relying on state
                                    const newCheckboxValue = e.target.checked;
                                    handleBookTitleValidation(form.getFieldValue(['donatedBooks', name, 'bookTitle']), name, newCheckboxValue);

                                 }}
                              />
                              <span style={{ fontSize: '14px', color: '#333' }}>
                                This book already exists in the library
                              </span>
                            </label>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={24}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'category']}
                            label="Category"
                            rules={[
                               { 
                                 required: !checkboxStates[name], 
                                 message: 'Please select the category!' 
                               }
                            ]}
                          >
                           <Select 
                              placeholder="Select the category" 
                              options={categories.map(category => ({
                                label: category,
                                value: category
                              }))}
                              disabled={checkboxStates[name] || false}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'num']}
                            label="Number of Books"
                            rules={[
                              { 
                                required: true,
                                message: 'Please enter the number of books!' 
                              },
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

                      <Row gutter={24}>
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
                              disabled={checkboxStates[name] || false}
                            />
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
                              disabled={checkboxStates[name] || false}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={24}>
                        <Col span={24}>
                          <Form.Item
                            {...restField}
                            name={[name, 'coverImage']}
                            label="Cover Image"
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <Input 
                                placeholder="Enter image URL or upload file" 
                                value={inputValues[`cover-${name}`] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  form.setFieldValue(['donatedBooks', name, 'coverImage'], value);
                                  form.setFieldValue(['donatedBooks', name, 'coverImageFile'], null);
                                  setInputValues(prev => ({ ...prev, [`cover-${name}`]: value }));
                                }}
                                disabled={checkboxStates[name] || false}
                              />
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#8c8c8c' }}>OR</span>
                                <div style={{ position: 'relative' }}>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        if (handleFileUpload(file, name)) {
                                          e.target.value = '';
                                        }
                                      }
                                    }}
                                    style={{
                                      position: 'absolute',
                                      opacity: 0,
                                      width: '100%',
                                      height: '100%',
                                      cursor: 'pointer'
                                    }}
                                    id={`file-input-${name}`}
                                  />
                                  <Button
                                    type="default"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    style={{
                                      background: '#f0f0f0',
                                      border: '1px dashed #d9d9d9',
                                      borderRadius: '6px',
                                      padding: '4px 12px',
                                      fontSize: '12px',
                                      color: '#595959',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    onClick={() => document.getElementById(`file-input-${name}`)?.click()}
                                    disabled={checkboxStates[name] || false}
                                  >
                                    Choose File
                                  </Button>
                                  <span style={{ 
                                    fontSize: '11px', 
                                    color: '#8c8c8c', 
                                    marginLeft: '8px',
                                    fontStyle: 'italic'
                                  }}>
                                    {form.getFieldValue(['donatedBooks', name, 'coverImageFile']) ? 
                                      form.getFieldValue(['donatedBooks', name, 'coverImageFile']).name : 
                                      'No file chosen'
                                    }
                                  </span>
                                </div>
                              </div>
                              {/* Preview Image */}
                              {(form.getFieldValue(['donatedBooks', name, 'coverImage']) || filePreviewUrls[`preview-${name}`]) && (
                                <div style={{ marginTop: '8px', position: 'relative' }}>
                                  <img
                                    src={form.getFieldValue(['donatedBooks', name, 'coverImage']) || filePreviewUrls[`preview-${name}`] || ''}
                                    alt="Preview"
                                    style={{
                                      width: '100px',
                                      height: '120px',
                                      objectFit: 'cover',
                                      borderRadius: '8px',
                                      border: '2px solid #d9d9d9'
                                    }}
                                  />
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<CloseOutlined />}
                                    style={{
                                      position: 'absolute',
                                      top: '-8px',
                                      right: '-8px',
                                      background: '#ff4d4f',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '50%',
                                      width: '20px',
                                      height: '20px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                    onClick={() => {
                                      form.setFieldValue(['donatedBooks', name, 'coverImage'], '');
                                      form.setFieldValue(['donatedBooks', name, 'coverImageFile'], null);
                                      setInputValues(prev => ({ ...prev, [`cover-${name}`]: '' }));
                                      
                                      // Clean up preview URL
                                      if (filePreviewUrls[`preview-${name}`]) {
                                        URL.revokeObjectURL(filePreviewUrls[`preview-${name}`]);
                                        setFilePreviewUrls(prev => {
                                          const newUrls = { ...prev };
                                          delete newUrls[`preview-${name}`];
                                          return newUrls;
                                        });
                                      }
                                      
                                      message.info('Cover image removed');
                                    }}
                                  />
                                </div>
                              )}                            
                            </div>
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
                          disabled={checkboxStates[name] || false}
                        />
                      </Form.Item>
                    </Card>
                  ))}

                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />}
                      onClick={() => {
                        add();
                      }}
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
                  disabled={isCreating || Object.values(validateBookTitle).some(validation => validation && validation.canSubmit === false)}
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
        </div>

        {/* Donation Record Management Section */}
        {!loadingDonationRecords && (
          <div style={{ 
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: '#fafafa',
            borderRadius: '16px',
            border: '1px solid #e8e8e8',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
            {/* Section Header */}
            <div style={{ 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: '#262626',
                letterSpacing: '0.5px'
              }}>
                📊 Donation Record Management
              </h2>
              <p style={{ 
                margin: '0',
                fontSize: '14px',
                color: '#8c8c8c',
                fontStyle: 'italic'
              }}>
                Overview and management of all donation activities
              </p>
            </div>

            {/* Statistics Cards */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
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
          </div>
        )}

        {/* Donation Records Table Section */}
        {!loadingDonationRecords && (
          <div style={{ 
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: '#fafafa',
            borderRadius: '16px',
            border: '1px solid #e8e8e8',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}>
            {/* Section Header */}
            <div style={{ 
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700',
                color: '#262626',
                letterSpacing: '0.5px'
              }}>
                📋 Donation Records
              </h2>
              <p style={{ 
                margin: '0',
                fontSize: '14px',
                color: '#8c8c8c',
                fontStyle: 'italic'
              }}>
                Track and manage all book donation transactions
              </p>
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
                      Donation Records Details
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
                scroll={{ x: 2230 }}
                size="small"
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

        {/* Image Preview Modal */}
        {isPreviewVisible && previewImage && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            onClick={() => setIsPreviewVisible(false)}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={previewImage}
                alt="Full size preview"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
              />
              <Button
                type="text"
                icon={<CloseOutlined />}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '0',
                  color: 'white',
                  fontSize: '24px',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreviewVisible(false);
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }