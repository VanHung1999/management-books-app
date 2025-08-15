"use client";

import React, { useState, useEffect } from "react";
import { Card, List, Skeleton, Pagination, Tag, Button, Space, Typography, Avatar, message } from "antd";
import { BookOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useGetIdentity } from "@refinedev/core";
import { getLoanRecords } from "../database/loanRecorDatabase";
import { LoanRecord } from "../interface/loanrecord";

const { Title, Text } = Typography;

export default function LoanRecords() {
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<LoanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  const { data: user } = useGetIdentity<{ name?: string; email?: string }>();

  // Load loan records
  useEffect(() => {
    if (user) {
      loadUserLoanRecords();
    }
  }, [user]);

  const loadUserLoanRecords = () => {
    try {
      const allRecords = getLoanRecords();
      const userRecords = allRecords.filter(record => 
        record.borrowerName === (user?.name || user?.email)
      );
      setLoanRecords(userRecords);
      setFilteredRecords(userRecords);
      setIsLoading(false);
    } catch (error) {
      message.error('Failed to load loan records');
      setIsLoading(false);
    }
  };

  // Filter records by status
  const filterByStatus = (status: string) => {
    setSelectedStatus(status);
    if (status === "all") {
      setFilteredRecords(loanRecords);
    } else {
      setFilteredRecords(loanRecords.filter(record => record.status === status));
    }
    setCurrentPage(1);
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return { color: "#fa8c16", icon: <ClockCircleOutlined />, text: "Pending" };
      case "delivered":
        return { color: "#1890ff", icon: <BookOutlined />, text: "Delivered" };
      case "received":
        return { color: "#52c41a", icon: <CheckCircleOutlined />, text: "Received" };
      case "returned":
        return { color: "#722ed1", icon: <CheckCircleOutlined />, text: "Returned" };
      case "canceled":
        return { color: "#ff4d4f", icon: <CloseCircleOutlined />, text: "Canceled" };
      default:
        return { color: "#8c8c8c", icon: <ClockCircleOutlined />, text: status };
    }
  };

  // Format date
  const formatDate = (dateValue: Date | string | null) => {
    if (!dateValue) return "N/A";
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate pagination
  const totalRecords = filteredRecords.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  if (!user) {
    return (
      <div style={{ 
        padding: '48px', 
        textAlign: 'center',
        maxWidth: '1200px', 
        margin: '0 auto',
        backgroundColor: '#fafafa',
        minHeight: '100vh'
      }}>
        <UserOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
        <Title level={2} style={{ color: '#8c8c8c', margin: '16px 0' }}>Please Login</Title>
        <Text style={{ color: '#8c8c8c', fontSize: '16px' }}>You need to be logged in to view your loan records.</Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        <Skeleton.Input active size="large" style={{ width: "200px", height: "32px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "16px" }}>
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} active>
              <div style={{ height: "200px", padding: "16px" }} />
            </Skeleton>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Section */}
      <div style={{ 
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <Title level={2} style={{ 
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: '700',
            color: '#262626'
          }}>
            📚 My Loan Records
          </Title>
          <Text style={{ 
            fontSize: '16px',
            color: '#8c8c8c'
          }}>
            Welcome back, <strong>{user.name || user.email}</strong>! Here are your book borrowing history.
          </Text>
        </div>

        {/* Status Filter Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {["all", "pending", "delivered", "received", "returned", "returnedConfirmed", "canceled"].map(status => (
            <Button
              key={status}
              type={selectedStatus === status ? "primary" : "default"}
              size="middle"
              onClick={() => filterByStatus(status)}
              style={{
                borderRadius: '20px',
                textTransform: 'capitalize'
              }}
            >
              {getStatusInfo(status).icon} {getStatusInfo(status).text}
              {status !== "all" && (
                <span style={{ 
                  marginLeft: '8px',
                  backgroundColor: selectedStatus === status ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}>
                  {loanRecords.filter(r => r.status === status).length}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '24px',
          marginTop: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
              {loanRecords.length}
            </div>
            <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Total Records</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
              {loanRecords.filter(r => r.status === "returned").length}
            </div>
            <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Returned</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
              {loanRecords.filter(r => r.status === "pending" || r.status === "delivered").length}
            </div>
            <div style={{ fontSize: '14px', color: '#8c8c8c' }}>Active</div>
          </div>
        </div>
      </div>

      {/* Loan Records List */}
      {currentRecords.length > 0 ? (
        <>
          <List
            grid={{
              gutter: 24,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 3,
            }}
            dataSource={currentRecords}
            renderItem={(record) => {
              const statusInfo = getStatusInfo(record.status);
              return (
                <List.Item key={record.id} style={{ padding: '8px' }}>
                  <Card 
                    style={{ 
                      width: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      border: `2px solid ${statusInfo.color}20`
                    }}
                    hoverable
                  >
                    {/* Header with Status */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px'
                      }}>
                        <Avatar 
                          icon={<BookOutlined />} 
                          style={{ backgroundColor: statusInfo.color }}
                        />
                        <div>
                          <Text strong style={{ fontSize: '16px' }}>
                            {record.bookTitle}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            ID: {record.id}
                          </Text>
                        </div>
                      </div>
                      <Tag 
                        color={statusInfo.color}
                        icon={statusInfo.icon}
                        style={{ 
                          borderRadius: '12px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}
                      >
                        {statusInfo.text}
                      </Tag>
                    </div>

                    {/* Record Details */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '8px'
                      }}>
                        <Text type="secondary">Quantity:</Text>
                        <Text strong>{record.quantity} copies</Text>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '8px'
                      }}>
                        <Text type="secondary">Borrowed:</Text>
                        <Text>{formatDate(record.borrowedAt)}</Text>
                      </div>
                      {record.deliveredAt && (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '8px'
                        }}>
                          <Text type="secondary">Delivered:</Text>
                          <Text>{formatDate(record.deliveredAt)}</Text>
                        </div>
                      )}
                      {record.returnedAt && (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '8px'
                        }}>
                          <Text type="secondary">Returned:</Text>
                          <Text>{formatDate(record.returnedAt)}</Text>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px',
                      justifyContent: 'flex-end'
                    }}>
                      {record.status === "pending" && (
                        <Button size="small" type="primary">
                          Track Delivery
                        </Button>
                      )}
                      {record.status === "delivered" && (
                        <Button size="small" type="primary">
                          Confirm Received
                        </Button>
                      )}
                      {record.status === "received" && (
                        <Button size="small" type="primary">
                          Return Book
                        </Button>
                      )}
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
          
          {/* Pagination */}
          <div style={{ 
            marginTop: '32px', 
            display: 'flex', 
            justifyContent: 'center',
            padding: '16px'
          }}>
            <Pagination
              current={currentPage}
              total={totalRecords}
              pageSize={pageSize}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) => 
                `${range[0]}-${range[1]} of ${total} records`
              }
              onChange={setCurrentPage}
              style={{ 
                backgroundColor: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '100px 50px',
          color: '#666',
          fontSize: '16px'
        }}>
          <BookOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={3} style={{ color: '#8c8c8c', margin: '16px 0' }}>
            No Loan Records Found
          </Title>
          <Text style={{ color: '#8c8c8c' }}>
            {selectedStatus === "all" 
              ? "You haven't borrowed any books yet. Start exploring our collection!"
              : `No ${selectedStatus} records found.`
            }
          </Text>
        </div>
      )}
    </div>
  );
}
