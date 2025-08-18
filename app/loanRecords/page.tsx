"use client";

import { useList, useUpdate } from "@refinedev/core";
import { Skeleton, Table, Tag, Space, Typography, Card, Tooltip, Button } from "antd";
import { BookOutlined, UserOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { LoanRecord } from "../interface/loanRecord";
import { Book } from "../interface/book";

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
    ? loanRecords?.data?.filter(item => item.borrowerName === userData.email) 
    : loanRecords?.data;

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
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 180,
      render: (_, record) => {
        const { status } = record;
        
         // Admin actions
         if (userData?.role === "admin") {
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
                     onClick={() => handleStatusChange(record.id, "delivered")}
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
                     ✨ Delivered
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
                     ❌ Canceled
                   </Button>
                 </div>
                 <Text style={{ 
                   color: "#52c41a", 
                   fontSize: '11px',
                   fontWeight: '500',
                   textAlign: 'center',
                   lineHeight: '1.2'
                 }}>
                   Choose action: Deliver or Cancel
                 </Text>
               </div>
             );
          } else if (status === "delivered" && userData?.email === record.borrowerName) {
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
                    background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
                    minWidth: "100px",
                    height: "32px"
                  }}
                >
                  📦 Received
                </Button>
                <Text style={{ 
                  color: "#1890ff", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Received the book from the library
                </Text>
              </div>
            );
          }  else if (status === "received" && userData?.email === record.borrowerName) {
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
                  onClick={() => handleStatusChange(record.id, "returned")}
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
                  🔄 Returned
                </Button>
                <Text style={{ 
                  color: "#fa8c16", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Returned the book to the library
                </Text>
              </div>
            );
          } else if (status === "returned") {
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
                  onClick={() => handleStatusChange(record.id, "completed")}
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
                  ✅ Complete
                </Button>
                <Text style={{ 
                  color: "#722ed1", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Complete the loan
                </Text>
              </div>
            );
          } else if (status === "completed") {
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
                    🎉 Completed
                  </Text>
                </div>
                <Text style={{ 
                  color: "#52c41a", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  The loan record book has complete
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
                  The loan request has been canceled
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
        
        // User actions
        else if (userData?.role === "user") {
          if (status === "delivered") {
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
                    background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
                    minWidth: "100px",
                    height: "32px"
                  }}
                >
                  📦 Received
                </Button>
                <Text style={{ 
                  color: "#1890ff", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Received the book from the library
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
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleStatusChange(record.id, "returned")}
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
                  🔄 Returned
                </Button>
                <Text style={{ 
                  color: "#fa8c16", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  Returned the book to the library
                </Text>
              </div>
            );
          } else if (status === "completed") {
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
                    🎉 Completed
                  </Text>
                </div>
                <Text style={{ 
                  color: "#52c41a", 
                  fontSize: '11px',
                  fontWeight: '500',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>
                  The loan record book has complete
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
                  The loan request has been canceled
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