"use client";

import { useList, useUpdate } from "@refinedev/core";
import { Skeleton, Table, Tag, Space, Typography, Card, Tooltip} from "antd";
import { BookOutlined, UserOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { LoanRecord } from "../interface/loanRecord";
import { Book } from "../interface/book";
import { 
  renderActionButton, 
  renderStatusDisplay, 
  renderActionContainer, 
  renderSingleAction,
  ACTION_CONFIGS,
  STATUS_CONFIGS
} from "../components/LoanActionComponents";
import styles from "../styles/pages/loanRecords/LoanRecords.module.css";

const { Title, Text } = Typography;

export default function LoanRecords() {
  const [userData, setUserData] = useState<any>(null);

  // Load user from localStorage on client-side
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      try {
        const parsedUser = JSON.parse(currentUser);
        setUserData(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const { data: loanRecords, isLoading } = useList<LoanRecord>({
    resource: "loanRecords",
  });

  const { mutate: updateLoanRecord } = useUpdate<LoanRecord>({
    resource: "loanRecords",
  });

  const { data: books, isLoading: bookLoading } = useList<Book>({
    resource: "books",
  });

  const { mutate: updateBook } = useUpdate<Book>({
    resource: "books",
  });

  // Filter data based on user role
  const filteredData = !isLoading && userData?.role === "user" 
    ? (loanRecords?.data?.filter(item => item.borrowerName === userData.email) || []).sort((a, b) => Number(b.id) - Number(a.id))
    : (loanRecords?.data || []).sort((a, b) => Number(b.id) - Number(a.id));

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

  // Handle status change
  const handleStatusChange = (recordId: string, newStatus: "delivered" | "received" | "returned" | "completed" | "pending" | "canceled") => {
    //update the loan record
    const record = loanRecords?.data?.find(item => item.id === recordId);
    if (record) {
      const updatedRecord = { ...record, status: newStatus };
      // Add timestamp based on new status
      const now = new Date();
      switch (newStatus) {
        case 'delivered':
          updatedRecord.deliveredAt = now;
          updatedRecord.delivererName = userData?.name || 'Unknown';
          break;
        case 'received':
          updatedRecord.receivedAt = now;
          break;
        case 'returned':
          updatedRecord.returnedAt = now;
          break;
        case 'completed':
          updatedRecord.returnConfirmedAt = now;
          updatedRecord.returnConfirmerName = userData?.name || 'Unknown';
          break;
      }
      updateLoanRecord({
        id: recordId,
        values: {
          ...updatedRecord
        }
      });

      if(newStatus === "completed" || newStatus === "canceled"){
        const book = books?.data?.find(item => item.name === record.bookTitle);
        if(book){
          updateBook({
            id: book.id,
            values: {
              status: {
                ...book.status,
                available: book.status.available + record.quantity,
                loaned: book.status.loaned - record.quantity
              }
            }
          });
        }
      }
      //reload the page
      window.location.reload();
    }
  };

  // Get action configuration based on status and user role
  const getActionConfig = (record: any) => {
    const { status } = record;
    
    // Early returns for specific statuses
    if (status === "completed") return renderStatusDisplay(STATUS_CONFIGS.completed);
    if (status === "canceled") return renderStatusDisplay(STATUS_CONFIGS.canceled);
    
    // Admin actions (regardless of borrower)
    if (userData?.role === "admin") {
      if (status === "pending") {
        return renderActionContainer([
          renderActionButton({
            ...ACTION_CONFIGS.delivered,
            onClick: () => handleStatusChange(record.id, "delivered")
          }),
          renderActionButton({
            ...ACTION_CONFIGS.canceled,
            onClick: () => handleStatusChange(record.id, "canceled")
          })
        ], "Choose action: Deliver or Cancel", "#52c41a");
      }
      if (status === "returned") {
        return renderSingleAction(
          renderActionButton({
            ...ACTION_CONFIGS.completed,
            onClick: () => handleStatusChange(record.id, "completed")
          }),
          "Complete the loan",
          "#722ed1"
        );
      }
    }
    
    // User actions (for both regular users and admin users when they are the borrower)
    if (userData?.email === record.borrowerName) {
      if (status === "delivered") {
        return renderSingleAction(
          renderActionButton({
            ...ACTION_CONFIGS.received,
            onClick: () => handleStatusChange(record.id, "received")
          }),
          "Received the book from the library",
          "#1890ff"
        );
      }
      if (status === "received") {
        return renderSingleAction(
          renderActionButton({
            ...ACTION_CONFIGS.returned,
            onClick: () => handleStatusChange(record.id, "returned")
          }),
          "Returned the book to the library",
          "#fa8c16"
        );
      }
    }
    
    // Default waiting status
    return renderStatusDisplay({
      ...STATUS_CONFIGS.waiting,
      text: "⏳ Waiting",
      description: userData?.role === "admin" 
        ? "Waiting response from customer" 
        : "Waiting response from admin"
    });
  };

  const columns: ColumnsType<any> = [
    {
      title: "Borrower",
      dataIndex: "borrowerName",
      key: "borrowerName",
      align: "center" as const,
      width: 220,
      render: (text) => (
        <Space>
          <UserOutlined className={styles.borrowerIcon} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Book",
      dataIndex: "bookTitle",
      key: "bookTitle",
      align: "center" as const,
      width: 350,
      render: (text) => (
        <Space>
          <BookOutlined className={styles.bookIcon} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      width: 80,
      render: (quantity) => (
        <Tag color="blue" className={styles.quantityTag}>
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
        align: "center" as const,
        width: 120,
        render: (text: string) => text || "-",
      },
      {
        title: "Return Confirmer",
        dataIndex: "returnConfirmerName",
        key: "returnConfirmerName",
        align: "center" as const,
        width: 120,
        render: (text: string) => text || "-",
      }
    ] : []),
    {
      title: "Borrowed At",
      dataIndex: "borrowedAt",
      key: "borrowedAt",
      align: "center" as const,
      width: 140,
      render: (date) => (
        <Space>
          <CalendarOutlined className={styles.calendarIcon} />
          <Text>{formatDate(date)}</Text>
        </Space>
      ),
    },
    {
      title: "Delivered At",
      dataIndex: "deliveredAt",
      key: "deliveredAt",
      align: "center" as const,
      width: 140,
      render: (date) => formatDate(date),
    },
    {
      title: "Received At",
      dataIndex: "receivedAt",
      key: "receivedAt",
      align: "center" as const,
      width: 140,
      render: (date) => formatDate(date),
    },
    {
      title: "Returned At",
      dataIndex: "returnedAt",
      key: "returnedAt",
      align: "center" as const,
      width: 140,
      render: (date) => formatDate(date),
    },
    {
      title: "Return Confirmed At",
      dataIndex: "returnConfirmedAt",
      key: "returnConfirmedAt",
      align: "center" as const,
      width: 140,
      render: (date) => formatDate(date),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      width: 120,
      render: (status) => (
        <Tag 
          color={getStatusColor(status)} 
          icon={getStatusIcon(status)}
          className={styles.statusTag}
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
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 180,
      fixed: "right",
      render: (_, record) => getActionConfig(record),
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Skeleton.Input active size="large" className={styles.loadingTitle} />
        <div className={styles.loadingGrid}>
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} active>
              <div className={styles.loadingCard} />
            </Skeleton>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loanRecordsContainer}>
      {/* Enhanced Header Section */}
      <div className={styles.headerSection}>
        {/* Header */}
        <div className={styles.headerContent}>
          <h2 className={styles.headerTitle}>
            📚 Loan Records Management
          </h2>
          <p className={styles.headerSubtitle}>
            Track and manage all book loan transactions efficiently
          </p>
        </div>

        {/* Statistics Cards Grid */}
        <div className={styles.statsGrid}>
          {/* Total Transactions */}
          <div className={`${styles.statCard} ${styles.totalTransactionsCard}`}>
            <div className={styles.statCardHeader}>
              <span className={styles.statCardIcon}>📊</span>
              <h3 className={styles.statCardTitle}>
                Total Transactions
              </h3>
            </div>
            <div className={styles.statCardValue}>
              {totalRecords}
            </div>
          </div>

          {/* Processing Records */}
          <Tooltip
            title={
              <div className={styles.tooltipContent}>
                <div className={styles.tooltipTitle}>Processing Records Breakdown:</div>
                <div>• Pending: {pendingRecords}</div>
                <div>• Delivered: {deliveredRecords}</div>
                <div>• Received: {receivedRecords}</div>
                <div>• Returned: {returnedRecords}</div>
              </div>
            }
            placement="top"
            color="#fa8c16"
          >
            <div className={`${styles.statCard} ${styles.processingRecordsCard}`}>
              <div className={styles.statCardHeader}>
                <span className={styles.statCardIcon}>⚡</span>
                <h3 className={styles.statCardTitle}>
                  Processing Records
                </h3>
              </div>
              <div className={styles.statCardValue}>
                {processingRecords}
              </div>
              <div className={styles.hoverHint}>
                Hover for details
              </div>
            </div>
          </Tooltip>

          {/* Completed */}
          <div className={`${styles.statCard} ${styles.completedCard}`}>
            <div className={styles.statCardHeader}>
              <span className={styles.statCardIcon}>✅</span>
              <h3 className={styles.statCardTitle}>
                Completed
              </h3>
            </div>
            <div className={styles.statCardValue}>
              {completedRecords}
            </div>
          </div>

          {/* Canceled */}
          <div className={`${styles.statCard} ${styles.canceledCard}`}>
            <div className={styles.statCardHeader}>
              <span className={styles.statCardIcon}>❌</span>
              <h3 className={styles.statCardTitle}>
                Canceled
              </h3>
            </div>
            <div className={styles.statCardValue}>
              {canceledRecords}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Card 
        title={
          <Space size="large">
            <div className={styles.tableHeaderIcon}>
              <TeamOutlined />
            </div>
            <div className={styles.tableHeaderText}>
              <Title level={4}>
                Loan Records Details
              </Title>
              <Text>
                Detailed view of all book loan transactions with status tracking
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
            className: styles.paginationStyle
          }}
          scroll={{ x: 2230 }}
          size="small"
          bordered
          className={styles.loanRecordsTable}
        />
      </Card>
    </div>
  );
}