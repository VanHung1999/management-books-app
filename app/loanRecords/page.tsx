"use client";

import { useList } from "@refinedev/core";
import { Skeleton, Table, Tag, Space, Typography, Card, Tooltip } from "antd";
import { BookOutlined, UserOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

export default function LoanRecords() {
  const { data, isLoading } = useList({
    resource: "loanRecords",
  });

  const currentUser = localStorage.getItem("currentUser");
  const userData = JSON.parse(currentUser as string);

  // Filter data based on user role
  const filteredData = !isLoading && userData?.role === "user" 
    ? data?.data?.filter(item => item.borrowerName === userData.email) 
    : data?.data;

  // Calculate statistics
  const totalRecords = filteredData?.length || 0;
  const pendingRecords = filteredData?.filter(item => item.status === "pending").length || 0;
  const deliveredRecords = filteredData?.filter(item => item.status === "delivered").length || 0;
  const receivedRecords = filteredData?.filter(item => item.status === "received").length || 0;
  const returnedRecords = filteredData?.filter(item => item.status === "returned").length || 0;
  const completedRecords = filteredData?.filter(item => item.status === "completed").length || 0;
  const canceledRecords = filteredData?.filter(item => item.status === "canceled").length || 0;
  const processingRecords = pendingRecords + deliveredRecords + receivedRecords + returnedRecords;

  const getStatusColor = (status: string) => {
    switch (status) { 
      case "pending": return "orange";
      case "delivered": return "blue";
      case "received": return "cyan";
      case "returned": return "purple";
      case "returnedConfirmed": return "green";
      case "canceled": return "red";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => { 
    switch (status) {
      case "pending": return <ClockCircleOutlined />;
      case "delivered": return <BookOutlined />;
      case "received": return <BookOutlined />;
      case "returned": return <BookOutlined />;
      case "returnedConfirmed": return <CheckCircleOutlined />;
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

  const columns: ColumnsType<any> = [
    {
      title: "Borrower",
      dataIndex: "borrowerName",
      key: "borrowerName",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Book",
      dataIndex: "bookTitle",
      key: "bookTitle",
      render: (text) => (
        <Space>
          <BookOutlined style={{ color: "#52c41a" }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (quantity) => (
        <Tag color="blue" style={{ borderRadius: "6px" }}>
          {quantity}
        </Tag>
      ),
    },
    // Only show these columns for admin users
    ...(userData?.role === "admin" ? [
      {
        title: "Deliverer",
        dataIndex: "delivererName",
        key: "delivererName",
        render: (text: string) => text || "-",
      },
      {
        title: "Return Confirmer",
        dataIndex: "returnConfirmerName",
        key: "returnConfirmerName",
        render: (text: string) => text || "-",
      }
    ] : []),
    {
      title: "Borrowed At",
      dataIndex: "borrowedAt",
      key: "borrowedAt",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#722ed1" }} />
          <Text>{formatDate(date)}</Text>
        </Space>
      ),
    },
    {
      title: "Delivered At",
      dataIndex: "deliveredAt",
      key: "deliveredAt",
      render: (date) => formatDate(date),
    },
    {
      title: "Received At",
      dataIndex: "receivedAt",
      key: "receivedAt",
      render: (date) => formatDate(date),
    },
    {
      title: "Returned At",
      dataIndex: "returnedAt",
      key: "returnedAt",
      render: (date) => formatDate(date),
    },
    {
      title: "Return Confirmed At",
      dataIndex: "returnConfirmedAt",
      key: "returnConfirmedAt",
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
          {status === "delivered" && "Delivered"}
          {status === "received" && "Received"}
          {status === "returned" && "Returned"}
          {status === "completed" && "Completed"}
          {status === "canceled" && "Canceled"}
        </Tag>
      ),
    },
  ];

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} active>
              <div style={{ height: "120px", padding: "16px" }} />
            </Skeleton>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Enhanced Header Section */}
      <div style={{ 
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: '#fafafa',
        borderRadius: '16px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        {/* Header */}
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
            📚 Loan Records Management
          </h2>
          <p style={{ 
            margin: '0',
            fontSize: '14px',
            color: '#8c8c8c',
            fontStyle: 'italic'
          }}>
            Track and manage all book loan transactions efficiently
          </p>
        </div>

        {/* Statistics Cards Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Total Transactions */}
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
                Total Transactions
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
                <div>• Delivered: {deliveredRecords}</div>
                <div>• Received: {receivedRecords}</div>
                <div>• Returned: {returnedRecords}</div>
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

          {/* Completed */}
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
                Completed
              </h3>
            </div>
            <div style={{ 
              fontSize: '32px',
              fontWeight: '700',
              color: '#52c41a'
            }}>
              {completedRecords}
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

      {/* Main Table */}
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
                Loan Records Details
              </Title>
              <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                Detailed view of all book loan transactions with status tracking
              </Text>
            </div>
          </Space>
        }
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e8e8e8'
        }}
        headStyle={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderBottom: '2px solid #e8e8e8'
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
              `${range[0]}-${range[1]} of ${total} transactions`,
            style: { marginTop: '16px' }
          }}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
          style={{ borderRadius: '8px' }}
        />
      </Card>
    </div>
  );
}