"use client";

import { useOne } from "@refinedev/core";
import { useParams } from "next/navigation";
import { Card, Row, Col, Tag, Divider, Skeleton, Button, Space, Typography, Badge, Avatar, Modal, InputNumber, message } from "antd";
import { ArrowLeftOutlined, BookOutlined, UserOutlined, CalendarOutlined, TagOutlined, BarcodeOutlined, FileTextOutlined, ClockCircleOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useState } from "react";

const { Title, Text, Paragraph } = Typography;

export default function BookDetail() {
  const { id } = useParams();
  const { data, isLoading } = useOne({
    resource: "books",
    id: id as string,
  });

  // State for loans popup
  const [isLoansModalVisible, setIsLoansModalVisible] = useState(false);
  const [loanQuantity, setLoanQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to open loans popup
  const handleOpenLoansModal = () => {
    setLoanQuantity(1);
    setIsLoansModalVisible(true);
  };

  // Function to close popup
  const handleCloseLoansModal = () => {
    setIsLoansModalVisible(false);
    setLoanQuantity(1);
  };

  // Function to confirm book borrowing
  const handleConfirmLoan = async () => {
    if (loanQuantity <= 0) {
      message.error('Loan quantity must be greater than 0!');
      return;
    }
    
    if (loanQuantity > book.status.available) {
      message.error(`Loan quantity cannot exceed ${book.status.available} available copies!`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Add book borrowing logic here
      // Example: call API to create loan record
      
      message.success(`Successfully borrowed ${loanQuantity} copies of "${book.name}"!`);
      setIsLoansModalVisible(false);
      setLoanQuantity(1);
      
      // Refresh data if needed
      // window.location.reload();
      
    } catch (error) {
      message.error('An error occurred while borrowing the book. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: '32px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        backgroundColor: '#fafafa',
        minHeight: '100vh'
      }}>
        <Skeleton active>
          <div style={{ height: '700px' }} />
        </Skeleton>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div style={{ 
        padding: '48px', 
        textAlign: 'center',
        maxWidth: '1400px', 
        margin: '0 auto',
        backgroundColor: '#fafafa',
        minHeight: '100vh'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <BookOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={2} style={{ color: '#8c8c8c', margin: '16px 0' }}>Book not found</Title>
          <Text style={{ color: '#8c8c8c', fontSize: '16px' }}>The book you're looking for doesn't exist or has been removed.</Text>
        </div>
        <Link href="/books">
          <Button type="primary" size="large" icon={<HomeOutlined />}>
            Back to Books
          </Button>
        </Link>
      </div>
    );
  }

  const book = data.data;

  return (
    <div style={{ 
      backgroundColor: '#fafafa',
      minHeight: '100vh',
      padding: '0'
    }}>
      {/* Header Section */}
      <div style={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #f0f0f0',
        padding: '24px 0',
        marginBottom: '32px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>
          <Link href="/books">
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              style={{ 
                fontSize: '16px',
                height: 'auto',
                padding: '12px 20px',
                color: '#1890ff',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              className="hover-effect"
            >
              Back to Books
            </Button>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px 32px 32px' }}>
        {/* Main Book Information */}
        <Card 
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            marginBottom: '32px',
            border: 'none',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: '0' } }}
        >
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '40px 40px 0 40px',
            color: 'white'
          }}>
            <Row gutter={[40, 24]} align="middle">
              {/* Book Cover */}
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    position: 'relative',
                    display: 'inline-block'
                  }}>
                    <img 
                      src={book.coverImage} 
                      alt={book.name}
                      style={{
                        width: '100%',
                        maxWidth: '280px',
                        height: 'auto',
                        borderRadius: '16px',
                        boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      className="book-cover-hover"
                    />
                    <Badge 
                      count={book.num} 
                      style={{ 
                        backgroundColor: '#52c41a',
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    />
                  </div>
                </div>
              </Col>

              {/* Book Details */}
              <Col xs={24} md={16}>
                <div style={{ marginBottom: '32px' }}>
                  <Title level={1} style={{ 
                    margin: '0 0 20px 0',
                    color: 'white',
                    fontSize: '36px',
                    lineHeight: '1.2',
                    fontWeight: '700',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {book.name}
                  </Title>
                  
                  <Space size="large" wrap style={{ marginBottom: '24px' }}>
                    <Tag 
                      color="white" 
                      icon={<UserOutlined />}
                      style={{ 
                        fontSize: '14px', 
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {book.author}
                    </Tag>
                    <Tag 
                      color="white" 
                      icon={<TagOutlined />}
                      style={{ 
                        fontSize: '14px', 
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {book.category}
                    </Tag>
                    <Tag 
                      color="white" 
                      icon={<CalendarOutlined />}
                      style={{ 
                        fontSize: '14px', 
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {book.publishYear}
                    </Tag>
                  </Space>

                  {book.description && (
                    <Paragraph style={{ 
                      fontSize: '16px', 
                      lineHeight: '1.7',
                      color: 'rgba(255,255,255,0.9)',
                      marginBottom: '0',
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {book.description}
                    </Paragraph>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* Book Status Grid */}
          <div style={{ padding: '40px' }}>
            <Title level={3} style={{ 
              margin: '0 0 24px 0',
              color: '#1f1f1f',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Book Status Overview
            </Title>
            <Row gutter={[20, 20]}>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#f6ffed',
                    borderColor: '#b7eb8f',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  className="status-card-hover"
                >
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#52c41a',
                    marginBottom: '8px'
                  }}>
                    {book.status.available}
                  </div>
                  <Text style={{ color: '#52c41a', fontSize: '14px', fontWeight: '500' }}>Available</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#fff7e6',
                    borderColor: '#ffd591',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(250, 140, 22, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  className="status-card-hover"
                >
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#fa8c16',
                    marginBottom: '8px'
                  }}>
                    {book.status.loaned}
                  </div>
                  <Text style={{ color: '#fa8c16', fontSize: '14px', fontWeight: '500' }}>Loaned</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#fff2f0',
                    borderColor: '#ffccc7',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  className="status-card-hover"
                >
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#ff4d4f',
                    marginBottom: '8px'
                  }}>
                    {book.status.disabled}
                  </div>
                  <Text style={{ color: '#ff4d4f', fontSize: '14px', fontWeight: '500' }}>Disabled</Text>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card 
                  size="small" 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#f0f8ff',
                    borderColor: '#91d5ff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                    transition: 'all 0.3s ease'
                  }}
                  className="status-card-hover"
                >
                  <div style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: '#1890ff',
                    marginBottom: '8px'
                  }}>
                    {book.status.renovated}
                  </div>
                  <Text style={{ color: '#1890ff', fontSize: '14px', fontWeight: '500' }}>Renovated</Text>
                </Card>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Additional Information */}
        <Card 
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f1f1f'
            }}>
              <Avatar 
                icon={<BookOutlined />} 
                style={{ 
                  backgroundColor: '#1890ff',
                  color: 'white'
                }} 
              />
              Book Information
            </div>
          }
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: 'none',
            marginBottom: '32px'
          }}
          styles={{ body: { padding: '32px' } }}
        >
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}
              className="info-item-hover"
              >
                <Avatar 
                  icon={<BarcodeOutlined />} 
                  style={{ 
                    backgroundColor: '#1890ff',
                    color: 'white',
                    fontSize: '18px'
                  }} 
                />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#8c8c8c' }}>ISBN</Text>
                  <br />
                  <Text style={{ fontSize: '16px', color: '#1f1f1f' }}>{book.ISBN || 'N/A'}</Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                transition: 'all 0.3s ease'
              }}
              className="info-item-hover"
              >
                <Avatar 
                  icon={<FileTextOutlined />} 
                  style={{ 
                    backgroundColor: '#52c41a',
                    color: 'white',
                    fontSize: '18px'
                  }} 
                />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#8c8c8c' }}>Total Copies</Text>
                  <br />
                  <Text style={{ fontSize: '16px', color: '#1f1f1f' }}>{book.num}</Text>
                </div>
              </div>
            </Col>
          </Row>

          <Divider style={{ margin: '32px 0' }} />

          {/* Timestamps */}
          <Row gutter={[32, 24]}>
            <Col xs={24} sm={12}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f0f8ff',
                borderRadius: '12px',
                border: '1px solid #d6e4ff',
                transition: 'all 0.3s ease'
              }}
              className="info-item-hover"
              >
                <Avatar 
                  icon={<ClockCircleOutlined />} 
                  style={{ 
                    backgroundColor: '#1890ff',
                    color: 'white',
                    fontSize: '18px'
                  }} 
                />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#8c8c8c' }}>Created</Text>
                  <br />
                  <Text style={{ fontSize: '16px', color: '#1f1f1f' }}>
                    {new Date(book.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px',
                padding: '20px',
                backgroundColor: '#f0f8ff',
                borderRadius: '12px',
                border: '1px solid #d6e4ff',
                transition: 'all 0.3s ease'
              }}
              className="info-item-hover"
              >
                <Avatar 
                  icon={<ClockCircleOutlined />} 
                  style={{ 
                    backgroundColor: '#1890ff',
                    color: 'white',
                    fontSize: '18px'
                  }} 
                />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#8c8c8c' }}>Last Updated</Text>
                  <br />
                  <Text style={{ fontSize: '16px', color: '#1f1f1f' }}>
                    {new Date(book.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Action Buttons */}
        <div style={{ 
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <Title level={3} style={{ 
            margin: '0 0 24px 0',
            color: '#1f1f1f',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Manage This Book
          </Title>
          <Space size="large" wrap>
            <Button 
              type="primary" 
              size="large"
              onClick={handleOpenLoansModal}
              style={{ 
                height: '52px',
                padding: '0 36px',
                fontSize: '16px',
                borderRadius: '12px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
                transition: 'all 0.3s ease'
              }}
              className="action-button-hover"
            >
              📚 Loans
            </Button>
            <Link href={`/books/${book.id}/edit`}>
              <Button 
                type="primary" 
                size="large"
                icon={<EditOutlined />}
                style={{ 
                  height: '52px',
                  padding: '0 36px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                className="action-button-hover"
              >
                Edit Book
              </Button>
            </Link>
            <Link href="/books">
              <Button 
                size="large"
                icon={<HomeOutlined />}
                style={{ 
                  height: '52px',
                  padding: '0 36px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '2px solid #d9d9d9',
                  transition: 'all 0.3s ease'
                }}
                className="action-button-hover"
              >
                Back to List
              </Button>
            </Link>
          </Space>
        </div>
      </div>

             {/* Loans Modal Popup */}
      <Modal
                 title={
           <div style={{ 
             display: 'flex', 
             alignItems: 'center', 
             gap: '12px',
             fontSize: '18px',
             fontWeight: '600',
             color: '#1f1f1f'
           }}>
             <span style={{ fontSize: '24px' }}>📚</span>
             Borrow Book: {book.name}
           </div>
         }
        open={isLoansModalVisible}
        onCancel={handleCloseLoansModal}
                 footer={[
           <Button key="cancel" onClick={handleCloseLoansModal} size="large">
             Cancel
           </Button>,
           <Button 
             key="confirm" 
             type="primary" 
             onClick={handleConfirmLoan}
             loading={isSubmitting}
             size="large"
             style={{
               background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
               border: 'none',
               borderRadius: '8px',
               fontWeight: '600'
             }}
           >
             {isSubmitting ? 'Processing...' : 'Confirm Borrow'}
           </Button>
         ]}
        width={500}
        centered
        destroyOnClose
      >
        <div style={{ padding: '20px 0' }}>
          {/* Book Information */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            marginBottom: '24px'
          }}>
            <img 
              src={book.coverImage} 
              alt={book.name}
              style={{
                width: '80px',
                height: '100px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
            <div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1f1f1f',
                marginBottom: '8px'
              }}>
                {book.name}
              </div>
                             <div style={{ 
                 fontSize: '14px', 
                 color: '#666',
                 marginBottom: '4px'
               }}>
                 Author: {book.author}
               </div>
               <div style={{ 
                 fontSize: '14px', 
                 color: '#666'
               }}>
                 Category: {book.category}
               </div>
            </div>
          </div>

          {/* Book Statistics */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ 
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f6ffed',
              borderRadius: '8px',
              border: '1px solid #b7eb8f'
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#52c41a',
                marginBottom: '4px'
              }}>
                {book.status.available}
              </div>
                             <div style={{ fontSize: '14px', color: '#52c41a' }}>Available</div>
            </div>
            <div style={{ 
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#fff7e6',
              borderRadius: '8px',
              border: '1px solid #ffd591'
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#fa8c16',
                marginBottom: '4px'
              }}>
                {book.status.loaned}
              </div>
                             <div style={{ fontSize: '14px', color: '#fa8c16' }}>Loaned</div>
            </div>
          </div>

          {/* Select Loan Quantity */}
          <div style={{ 
            padding: '20px',
            backgroundColor: '#f0f8ff',
            borderRadius: '12px',
            border: '1px solid #d6e4ff'
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#1890ff',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Select quantity to borrow:
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '16px'
            }}>
              <InputNumber
                min={1}
                max={book.status.available}
                value={loanQuantity}
                onChange={(value) => setLoanQuantity(value || 1)}
                size="large"
                style={{
                  width: '120px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
                addonAfter={
                  <span style={{ fontSize: '14px', color: '#666' }}>
                                         copies
                  </span>
                }
              />
            </div>
            <div style={{ 
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '14px',
              color: '#666'
            }}>
                             Maximum: <strong style={{ color: '#1890ff' }}>{book.status.available}</strong> copies
            </div>
          </div>

          {/* Notification */}
          <div style={{ 
            padding: '16px',
            backgroundColor: '#fff2e8',
            borderRadius: '8px',
            border: '1px solid #ffd591',
            marginTop: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px',
              color: '#d46b08'
            }}>
              <span>ℹ️</span>
                             <strong>Note:</strong> Loan quantity cannot exceed the number of available books.
            </div>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .book-cover-hover:hover {
          transform: translateY(-8px);
        }
        
        .status-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        }
        
        .info-item-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          border-color: #1890ff;
        }
        
        .action-button-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        }
        
        .hover-effect:hover {
          background-color: rgba(24, 144, 255, 0.1) !important;
          transform: translateX(-4px);
        }
      `}</style>
    </div>
  );
}